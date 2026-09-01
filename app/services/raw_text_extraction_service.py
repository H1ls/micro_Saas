from __future__ import annotations

from dataclasses import dataclass
from typing import Any

import pandas as pd
from pydantic import ValidationError

from app.domain.errors import InvalidLLMResponseError, LLMUnavailableError
from app.domain.models import AIAnalysis, ChartSpec, RawTextExtraction
from app.prompts.raw_text_extraction_prompt import (
    RAW_TEXT_EXTRACTION_JSON_SCHEMA,
    RAW_TEXT_EXTRACTION_SYSTEM_PROMPT,
    build_raw_text_extraction_prompt,
)
from app.services.llm_client import complete_json


FACT_COLUMNS = [
    "group",
    "group_label",
    "label_key",
    "label",
    "metric_key",
    "metric_label",
    "metric_value",
    "unit",
]


@dataclass(frozen=True)
class RawTextExtractionResult:
    """Результат raw-text extraction: проверенные факты, dataframe и dashboard analysis."""

    extraction: RawTextExtraction
    dataframe: pd.DataFrame
    analysis: AIAnalysis


def extract_raw_text(raw_text: str) -> RawTextExtractionResult | None:
    """Извлекает structured facts/metrics из plain raw text одним LLM-запросом."""

    extraction = request_raw_text_extraction(raw_text)
    if not extraction or not extraction.facts:
        return None

    return build_raw_text_extraction_result(extraction)


def request_raw_text_extraction(raw_text: str) -> RawTextExtraction | None:
    """Запрашивает и валидирует один strict LLM extraction для plain raw text."""

    try:
        payload = complete_json(
            system_prompt=RAW_TEXT_EXTRACTION_SYSTEM_PROMPT,
            user_prompt=build_raw_text_extraction_prompt(raw_text),
            json_schema=RAW_TEXT_EXTRACTION_JSON_SCHEMA,
            strict_schema=True,
        )
        return parse_raw_text_extraction(payload)
    except (LLMUnavailableError, InvalidLLMResponseError):
        return None


def build_raw_text_extraction_result(extraction: RawTextExtraction) -> RawTextExtractionResult:
    """Собирает dataframe и dashboard analysis из валидного raw-text extraction."""

    dataframe = extraction_to_dataframe(extraction)
    analysis = build_raw_text_analysis(extraction)
    return RawTextExtractionResult(extraction=extraction, dataframe=dataframe, analysis=analysis)


def extract_raw_text_dataframe(raw_text: str) -> pd.DataFrame | None:
    """Совместимый wrapper для старых вызовов, которым нужен только extracted dataframe."""

    result = extract_raw_text(raw_text)
    return result.dataframe if result is not None else None


def extraction_to_dataframe(extraction: RawTextExtraction) -> pd.DataFrame:
    """Преобразует structured facts в tabular shape для profiling и подготовки графиков."""

    rows = [fact.model_dump() for fact in extraction.facts]
    metrics_by_key = {metric.metric_key: metric.metric_value for metric in extraction.metrics}
    for row in rows:
        for key, value in metrics_by_key.items():
            row[key] = value

    return pd.DataFrame(rows, columns=[*FACT_COLUMNS, *metrics_by_key.keys()])


def build_raw_text_analysis(extraction: RawTextExtraction) -> AIAnalysis:
    """Собирает dashboard narrative и chart specs из валидного raw-text extraction."""

    insight_summary = _lead_fact(extraction) or "Данные извлечены из текста и нормализованы в факты и метрики."
    return AIAnalysis(
        headline="Главный инсайт по текстовым данным",
        insight_summary=insight_summary,
        narrative=insight_summary,
        key_observations=_observations(extraction),
        charts=build_raw_text_chart_specs(extraction),
    )


def build_raw_text_chart_specs(extraction: RawTextExtraction) -> list[ChartSpec]:
    """Собирает валидные LLM chart specs или deterministic specs для extracted facts."""

    llm_charts = _valid_llm_charts(extraction)
    if llm_charts:
        return llm_charts

    grouped_facts = _group_facts_for_charts(extraction)
    return [
        ChartSpec(
            id=f"raw_{index}_{_slug(group)}_{_slug(metric_key)}",
            title=_chart_title(group_label or group, metric_label or metric_key),
            type=_chart_type(index, len(facts)),
            x_key="label",
            y_key="metric_value",
            reason="Построено backend-ом из структурированных фактов raw text.",
            filter={"group": group, "metric_key": metric_key},
        )
        for index, ((group, metric_key, group_label, metric_label), facts) in enumerate(grouped_facts[:3], start=1)
    ]


def parse_raw_text_extraction(payload: dict[str, Any]) -> RawTextExtraction:
    """Валидирует LLM extraction JSON и отбрасывает факты, которые нельзя безопасно визуализировать."""

    try:
        extraction = RawTextExtraction.model_validate(payload)
    except ValidationError as exc:
        raise InvalidLLMResponseError() from exc

    valid_facts = [
        fact
        for fact in extraction.facts
        if fact.group.strip()
        and fact.label_key.strip()
        and fact.label.strip()
        and fact.metric_key.strip()
        and fact.metric_value == fact.metric_value
    ]
    if not valid_facts:
        raise InvalidLLMResponseError()

    return extraction.model_copy(update={"structured_facts": valid_facts})


def _group_facts_for_charts(
    extraction: RawTextExtraction,
) -> list[tuple[tuple[str, str, str | None, str | None], list[Any]]]:
    grouped: dict[tuple[str, str, str | None, str | None], list[Any]] = {}
    for fact in extraction.facts:
        key = (fact.group, fact.metric_key, fact.group_label, fact.metric_label)
        grouped.setdefault(key, []).append(fact)
    return sorted(grouped.items(), key=lambda item: len(item[1]), reverse=True)


def _chart_type(index: int, fact_count: int) -> str:
    if index == 2 and fact_count <= 8:
        return "pie"
    return "bar"


def _valid_llm_charts(extraction: RawTextExtraction) -> list[ChartSpec]:
    valid_filters = {
        (fact.group, fact.metric_key)
        for fact in extraction.facts
        if fact.group.strip() and fact.metric_key.strip()
    }
    valid_charts = []
    for chart in extraction.charts:
        chart_filter = chart.filter or {}
        if chart.x_key != "label" or chart.y_key != "metric_value":
            continue
        group = chart_filter.get("group")
        metric_key = chart_filter.get("metric_key")
        if (group, metric_key) not in valid_filters:
            continue
        valid_charts.append(chart)
    return valid_charts[:3]


def _lead_fact(extraction: RawTextExtraction) -> str | None:
    if not extraction.facts:
        return None
    top_fact = max(extraction.facts, key=lambda fact: fact.metric_value)
    value = _format_number(top_fact.metric_value)
    unit = f" {top_fact.unit}" if top_fact.unit else ""
    metric_label = top_fact.metric_label or top_fact.metric_key
    return f"{top_fact.label} показывает максимум: {value}{unit} по метрике {metric_label}."


def _observations(extraction: RawTextExtraction) -> list[str]:
    observations = []
    for metric in extraction.metrics[:3]:
        value = _format_number(metric.metric_value)
        unit = f" {metric.unit}" if metric.unit else ""
        observations.append(f"{metric.metric_key}: {value}{unit}.")
    if extraction.facts:
        observations.append(_lead_fact(extraction) or "")
    return [observation for observation in observations if observation][:4]


def _chart_title(group_label: str, metric_label: str) -> str:
    return f"{metric_label} по {group_label}"


def _slug(value: str) -> str:
    return "".join(char.lower() if char.isalnum() else "_" for char in value).strip("_") or "value"


def _format_number(value: float) -> str:
    if float(value).is_integer():
        return f"{int(value):,}".replace(",", " ")
    return f"{value:,.2f}".replace(",", " ")
