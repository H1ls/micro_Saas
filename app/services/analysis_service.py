from __future__ import annotations

import json
from typing import Any

from pydantic import ValidationError

from app.domain.errors import InvalidLLMResponseError, LLMUnavailableError
from app.domain.models import AIAnalysis, AnalysisResult, ChartSpec, NormalizedDataset
from app.prompts.analysis_prompt import ANALYSIS_SYSTEM_PROMPT, build_analysis_prompt
from app.services.chart_service import recommend_fallback_charts
from app.services.llm_client import complete_json


MAX_HEADLINE_LENGTH = 140
MAX_INSIGHT_SUMMARY_LENGTH = 220
MAX_NARRATIVE_LENGTH = 900


def analyze_dataset(dataset: NormalizedDataset) -> AnalysisResult:
    """Пробует LLM analysis и при любой controlled LLM/validation ошибке возвращает fallback."""

    try:
        raw = complete_json(
            system_prompt=ANALYSIS_SYSTEM_PROMPT,
            user_prompt=build_analysis_prompt(dataset),
        )
        analysis = parse_analysis_json(raw)
        return AnalysisResult(analysis=validate_analysis(dataset, analysis), source="ai")
    except (LLMUnavailableError, InvalidLLMResponseError):
        return AnalysisResult(analysis=fallback_analysis(dataset), source="fallback")


def fallback_analysis(dataset: NormalizedDataset) -> AIAnalysis:
    """Строит deterministic narrative и chart specs без LLM, чтобы dashboard не ломался."""

    charts = recommend_fallback_charts(dataset)
    headline = _build_headline(dataset, charts)
    narrative = _build_narrative(dataset, charts)

    return AIAnalysis(
        headline=headline,
        insight_summary=_build_insight_summary(dataset, charts),
        narrative=narrative,
        key_observations=_build_observations(dataset, charts),
        charts=charts,
    )


def parse_analysis_json(raw: dict[str, Any] | str) -> AIAnalysis:
    """Парсит LLM JSON и поддерживает старые alias поля без ослабления Pydantic validation."""

    if isinstance(raw, str):
        try:
            payload = json.loads(raw)
        except json.JSONDecodeError as exc:
            raise InvalidLLMResponseError() from exc
    else:
        payload = raw

    if not isinstance(payload, dict):
        raise InvalidLLMResponseError()

    normalized_payload = dict(payload)
    if "key_observations" not in normalized_payload and "observations" in normalized_payload:
        normalized_payload["key_observations"] = normalized_payload["observations"]
    if "charts" not in normalized_payload and "chart_specs" in normalized_payload:
        normalized_payload["charts"] = normalized_payload["chart_specs"]
    if "insight_summary" not in normalized_payload and "narrative" in normalized_payload:
        normalized_payload["insight_summary"] = str(normalized_payload["narrative"])[:MAX_INSIGHT_SUMMARY_LENGTH]

    try:
        return AIAnalysis.model_validate(normalized_payload)
    except ValidationError as exc:
        raise InvalidLLMResponseError() from exc


def validate_analysis(dataset: NormalizedDataset, analysis: AIAnalysis) -> AIAnalysis:
    """Проверяет длину narrative и то, что chart specs ссылаются только на колонки dataset."""

    valid_columns = {column.name for column in dataset.columns}
    column_types = {column.name: column.type for column in dataset.columns}

    if not analysis.headline.strip() or not analysis.insight_summary.strip() or not analysis.narrative.strip():
        raise InvalidLLMResponseError()

    valid_charts: list[ChartSpec] = []
    for chart in analysis.charts:
        if chart.x_key not in valid_columns:
            continue
        if chart.y_key is None or chart.y_key not in valid_columns:
            continue
        if column_types.get(chart.y_key) != "number":
            continue

        chart_filter = chart.filter
        if chart.filter:
            for key, expected in chart.filter.items():
                if key not in valid_columns or not str(expected).strip():
                    chart_filter = None
                    break

        valid_charts.append(chart.model_copy(update={"filter": chart_filter}))

    if analysis.charts and not valid_charts:
        raise InvalidLLMResponseError()

    return analysis.model_copy(
        update={
            "headline": _limit_text(analysis.headline, MAX_HEADLINE_LENGTH),
            "insight_summary": _limit_text(analysis.insight_summary, MAX_INSIGHT_SUMMARY_LENGTH),
            "narrative": _limit_text(analysis.narrative, MAX_NARRATIVE_LENGTH),
            "charts": valid_charts,
        }
    )


def _limit_text(value: str, max_length: int) -> str:
    stripped = value.strip()
    if len(stripped) <= max_length:
        return stripped
    return stripped[: max_length - 1].rstrip() + "…"


def _build_headline(dataset: NormalizedDataset, charts: list[ChartSpec]) -> str:
    if charts:
        chart = charts[0]
        return f"{chart.y_key} can be compared by {chart.x_key}"
    return f"Dataset contains {dataset.row_count} rows and {dataset.column_count} columns"


def _build_narrative(dataset: NormalizedDataset, charts: list[ChartSpec]) -> str:
    base = (
        f"The uploaded {dataset.source_type} dataset contains {dataset.row_count} rows "
        f"and {dataset.column_count} columns."
    )
    if charts:
        chart = charts[0]
        return (
            f"{base} A first dashboard view can compare `{chart.y_key}` across "
            f"`{chart.x_key}` categories."
        )
    return f"{base} There is not enough category and numeric structure to build a fallback chart."


def _build_insight_summary(dataset: NormalizedDataset, charts: list[ChartSpec]) -> str:
    if charts:
        chart = charts[0]
        return (
            f"Короткая сводка: `{chart.y_key}` лучше всего смотреть по `{chart.x_key}`; "
            f"dashboard построен по {dataset.row_count} строкам dataset."
        )
    return (
        f"Короткая сводка: в dataset {dataset.row_count} строк и {dataset.column_count} колонок, "
        "но не хватает пары category + number для графиков."
    )


def _build_observations(dataset: NormalizedDataset, charts: list[ChartSpec]) -> list[str]:
    observations = [
        f"Rows: {dataset.row_count}",
        f"Columns: {dataset.column_count}",
    ]
    if charts:
        observations.append(f"Fallback chart uses `{charts[0].x_key}` and `{charts[0].y_key}`.")
    return observations
