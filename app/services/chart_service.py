from __future__ import annotations

from collections import defaultdict
from datetime import date, datetime
from typing import Any

from app.domain.models import ChartSpec, NormalizedDataset, PreparedChart

MAX_CHART_POINTS = 12


def recommend_fallback_charts(dataset: NormalizedDataset) -> list[ChartSpec]:
    """Подбирает 1-3 простых fallback графика по доступным category/date/number колонкам."""

    category_column = _first_column_by_type(dataset, "category")
    number_column = _first_column_by_type(dataset, "number")
    date_column = _first_column_by_type(dataset, "date")

    if category_column is None or number_column is None:
        return []

    charts = [
        ChartSpec(
            id="fallback_bar_1",
            title=f"{number_column} by {category_column}",
            type="bar",
            x_key=category_column,
            y_key=number_column,
            reason="First available category and numeric columns provide a simple grouped comparison.",
        )
    ]

    if date_column is not None:
        charts.append(
            ChartSpec(
                id="fallback_line_1",
                title=f"{number_column} over {date_column}",
                type="line",
                x_key=date_column,
                y_key=number_column,
                reason="Date and numeric columns provide a simple trend view.",
            )
        )

    charts.append(
        ChartSpec(
            id="fallback_pie_1",
            title=f"{number_column} share by {category_column}",
            type="pie",
            x_key=category_column,
            y_key=number_column,
            reason="Shows how the numeric value is distributed across categories.",
        )
    )

    return charts[:3]


def prepare_charts(
    dataset: NormalizedDataset,
    specs: list[ChartSpec],
) -> list[PreparedChart]:
    """Готовит chart data для валидных specs; если все specs плохие, использует fallback."""

    prepared_charts = _prepare_valid_charts(dataset, specs)
    if prepared_charts:
        return prepared_charts[:3]

    return _prepare_valid_charts(dataset, recommend_fallback_charts(dataset))[:3]


def _prepare_valid_charts(
    dataset: NormalizedDataset,
    specs: list[ChartSpec],
) -> list[PreparedChart]:
    prepared_charts: list[PreparedChart] = []
    valid_columns = {column.name for column in dataset.columns}

    for spec in specs:
        if spec.y_key is None:
            continue
        if spec.x_key not in valid_columns or spec.y_key not in valid_columns:
            continue

        if spec.type == "bar":
            data = aggregate_for_bar(dataset.rows, spec.x_key, spec.y_key)
        elif spec.type == "line":
            data = aggregate_for_line(dataset.rows, spec.x_key, spec.y_key)
        elif spec.type == "pie":
            data = aggregate_for_pie(dataset.rows, spec.x_key, spec.y_key)
        else:
            continue

        if data:
            prepared_charts.append(PreparedChart(spec=spec, data=data))

    return prepared_charts


def aggregate_for_bar(
    rows: list[dict[str, Any]],
    x_key: str,
    y_key: str,
) -> list[dict[str, Any]]:
    """Агрегирует числовую колонку по категориям для bar chart."""

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


def aggregate_for_line(
    rows: list[dict[str, Any]],
    x_key: str,
    y_key: str,
) -> list[dict[str, Any]]:
    """Агрегирует числовую колонку по сортируемой оси времени/категории для line chart."""

    totals: dict[str, float] = defaultdict(float)

    for row in rows:
        raw_x = row.get(x_key)
        value = _to_float(row.get(y_key))
        if raw_x is None or value is None:
            continue
        totals[_sortable_label(raw_x)] += value

    return [
        {x_key: label, y_key: total}
        for label, total in sorted(totals.items(), key=lambda item: item[0])[:MAX_CHART_POINTS]
    ]


def aggregate_for_pie(
    rows: list[dict[str, Any]],
    x_key: str,
    y_key: str,
) -> list[dict[str, Any]]:
    """Использует ту же группировку, что bar chart, для долей pie chart."""

    return aggregate_for_bar(rows, x_key, y_key)


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


def _sortable_label(value: Any) -> str:
    if isinstance(value, datetime):
        return value.date().isoformat()
    if isinstance(value, date):
        return value.isoformat()
    return str(value)
