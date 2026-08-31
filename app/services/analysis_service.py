from __future__ import annotations

import json
from typing import Any

from pydantic import ValidationError

from app.domain.errors import InvalidLLMResponseError, LLMUnavailableError
from app.domain.models import AIAnalysis, ChartSpec, NormalizedDataset
from app.prompts.analysis_prompt import ANALYSIS_SYSTEM_PROMPT, build_analysis_prompt
from app.services.chart_service import recommend_fallback_charts
from app.services.llm_client import complete_json


MAX_HEADLINE_LENGTH = 140
MAX_NARRATIVE_LENGTH = 900


def analyze_dataset(dataset: NormalizedDataset) -> AIAnalysis:
    try:
        raw = complete_json(
            system_prompt=ANALYSIS_SYSTEM_PROMPT,
            user_prompt=build_analysis_prompt(dataset),
        )
        analysis = parse_analysis_json(raw)
        return validate_analysis(dataset, analysis)
    except (LLMUnavailableError, InvalidLLMResponseError):
        return fallback_analysis(dataset)


def fallback_analysis(dataset: NormalizedDataset) -> AIAnalysis:
    charts = recommend_fallback_charts(dataset)
    headline = _build_headline(dataset, charts)
    narrative = _build_narrative(dataset, charts)

    return AIAnalysis(
        headline=headline,
        narrative=narrative,
        key_observations=_build_observations(dataset, charts),
        charts=charts,
    )


def parse_analysis_json(raw: dict[str, Any] | str) -> AIAnalysis:
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

    try:
        return AIAnalysis.model_validate(normalized_payload)
    except ValidationError as exc:
        raise InvalidLLMResponseError() from exc


def validate_analysis(dataset: NormalizedDataset, analysis: AIAnalysis) -> AIAnalysis:
    valid_columns = {column.name for column in dataset.columns}

    if not analysis.headline.strip() or not analysis.narrative.strip():
        raise InvalidLLMResponseError()
    if len(analysis.headline) > MAX_HEADLINE_LENGTH:
        raise InvalidLLMResponseError()
    if len(analysis.narrative) > MAX_NARRATIVE_LENGTH:
        raise InvalidLLMResponseError()

    for chart in analysis.charts:
        if chart.x_key not in valid_columns:
            raise InvalidLLMResponseError()
        if chart.y_key is None or chart.y_key not in valid_columns:
            raise InvalidLLMResponseError()

    return analysis


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


def _build_observations(dataset: NormalizedDataset, charts: list[ChartSpec]) -> list[str]:
    observations = [
        f"Rows: {dataset.row_count}",
        f"Columns: {dataset.column_count}",
    ]
    if charts:
        observations.append(f"Fallback chart uses `{charts[0].x_key}` and `{charts[0].y_key}`.")
    return observations
