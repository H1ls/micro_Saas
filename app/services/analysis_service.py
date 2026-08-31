from __future__ import annotations

from app.domain.models import AIAnalysis, ChartSpec, NormalizedDataset
from app.services.chart_service import recommend_fallback_charts


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
