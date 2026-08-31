from __future__ import annotations

from collections import defaultdict
from typing import Any

from app.domain.models import ChartSpec, NormalizedDataset, PreparedChart

MAX_CHART_POINTS = 12


def recommend_fallback_charts(dataset: NormalizedDataset) -> list[ChartSpec]:
    category_column = _first_column_by_type(dataset, "category")
    number_column = _first_column_by_type(dataset, "number")

    if category_column is None or number_column is None:
        return []

    return [
        ChartSpec(
            id="fallback_bar_1",
            title=f"{number_column} by {category_column}",
            type="bar",
            x_key=category_column,
            y_key=number_column,
            reason="First available category and numeric columns provide a simple grouped comparison.",
        )
    ]


def prepare_charts(
    dataset: NormalizedDataset,
    specs: list[ChartSpec],
) -> list[PreparedChart]:
    prepared_charts: list[PreparedChart] = []
    valid_columns = {column.name for column in dataset.columns}

    for spec in specs:
        if spec.type != "bar":
            continue
        if spec.x_key not in valid_columns or spec.y_key not in valid_columns:
            continue
        if spec.y_key is None:
            continue

        data = aggregate_for_bar(dataset.rows, spec.x_key, spec.y_key)
        if data:
            prepared_charts.append(PreparedChart(spec=spec, data=data))

    return prepared_charts


def aggregate_for_bar(
    rows: list[dict[str, Any]],
    x_key: str,
    y_key: str,
) -> list[dict[str, Any]]:
    totals: dict[str, float] = defaultdict(float)

    for row in rows:
        category = row.get(x_key)
        value = _to_float(row.get(y_key))
        if category is None or value is None:
            continue
        totals[str(category)] += value

    sorted_items = sorted(totals.items(), key=lambda item: abs(item[1]), reverse=True)
    return [
        {x_key: category, y_key: total}
        for category, total in sorted_items[:MAX_CHART_POINTS]
    ]


def _first_column_by_type(dataset: NormalizedDataset, column_type: str) -> str | None:
    for column in dataset.columns:
        if column.type == column_type:
            return column.name
    return None


def _to_float(value: Any) -> float | None:
    if value is None or value == "":
        return None
    try:
        return float(value)
    except (TypeError, ValueError):
        return None
