from app.domain.models import ColumnProfile, NormalizedDataset
from app.domain.models import ChartSpec
from app.services.chart_service import (
    aggregate_for_line,
    aggregate_for_pie,
    prepare_charts,
    recommend_fallback_charts,
)


def test_recommend_and_prepare_fallback_bar_chart() -> None:
    dataset = NormalizedDataset(
        source_type="csv",
        filename="sales.csv",
        columns=[
            ColumnProfile(name="segment", type="category", non_null_count=3, null_count=0),
            ColumnProfile(name="revenue", type="number", non_null_count=3, null_count=0),
        ],
        rows=[
            {"segment": "SMB", "revenue": 100},
            {"segment": "Enterprise", "revenue": 250},
            {"segment": "SMB", "revenue": 50},
        ],
        row_count=3,
        column_count=2,
        compact_context="{}",
    )

    specs = recommend_fallback_charts(dataset)
    charts = prepare_charts(dataset, specs)

    assert len(specs) == 2
    assert specs[0].type == "bar"
    assert len(charts) == 2
    assert charts[0].data == [
        {"segment": "Enterprise", "revenue": 250.0},
        {"segment": "SMB", "revenue": 150.0},
    ]


def test_prepare_charts_supports_line_and_pie() -> None:
    dataset = NormalizedDataset(
        source_type="csv",
        filename="sales.csv",
        columns=[
            ColumnProfile(name="date", type="date", non_null_count=3, null_count=0),
            ColumnProfile(name="segment", type="category", non_null_count=3, null_count=0),
            ColumnProfile(name="revenue", type="number", non_null_count=3, null_count=0),
        ],
        rows=[
            {"date": "2026-01-02", "segment": "SMB", "revenue": 100},
            {"date": "2026-01-01", "segment": "Enterprise", "revenue": 250},
            {"date": "2026-01-02", "segment": "SMB", "revenue": 50},
        ],
        row_count=3,
        column_count=3,
        compact_context="{}",
    )

    charts = prepare_charts(
        dataset,
        [
            ChartSpec(id="line_1", title="Revenue over time", type="line", x_key="date", y_key="revenue", reason="Trend"),
            ChartSpec(id="pie_1", title="Revenue share", type="pie", x_key="segment", y_key="revenue", reason="Share"),
        ],
    )

    assert [chart.spec.type for chart in charts] == ["line", "pie"]
    assert charts[0].data == [
        {"date": "2026-01-01", "revenue": 250.0},
        {"date": "2026-01-02", "revenue": 150.0},
    ]
    assert charts[1].data[0] == {"segment": "Enterprise", "revenue": 250.0}


def test_prepare_charts_falls_back_when_specs_are_invalid() -> None:
    dataset = NormalizedDataset(
        source_type="csv",
        filename="sales.csv",
        columns=[
            ColumnProfile(name="segment", type="category", non_null_count=1, null_count=0),
            ColumnProfile(name="revenue", type="number", non_null_count=1, null_count=0),
        ],
        rows=[{"segment": "SMB", "revenue": 100}],
        row_count=1,
        column_count=2,
        compact_context="{}",
    )

    charts = prepare_charts(
        dataset,
        [ChartSpec(id="bad", title="Bad", type="bar", x_key="missing", y_key="revenue", reason="Invalid")],
    )

    assert charts[0].spec.id == "fallback_bar_1"


def test_prepare_charts_applies_llm_filter_before_aggregation() -> None:
    dataset = NormalizedDataset(
        source_type="text",
        filename=None,
        columns=[
            ColumnProfile(name="group", type="category", non_null_count=5, null_count=0),
            ColumnProfile(name="label", type="category", non_null_count=5, null_count=0),
            ColumnProfile(name="metric_key", type="category", non_null_count=5, null_count=0),
            ColumnProfile(name="metric_value", type="number", non_null_count=5, null_count=0),
        ],
        rows=[
            {"group": "products", "label": "Alpha", "metric_key": "orders", "metric_value": 52},
            {"group": "products", "label": "Beta", "metric_key": "orders", "metric_value": 38},
            {"group": "regions", "label": "Северный", "metric_key": "revenue", "metric_value": 360000},
            {"group": "regions", "label": "Южный", "metric_key": "revenue", "metric_value": 280000},
            {"group": "regions", "label": "Западный", "metric_key": "revenue", "metric_value": 200000},
        ],
        row_count=5,
        column_count=4,
        compact_context="{}",
    )

    charts = prepare_charts(
        dataset,
        [
            ChartSpec(
                id="products_orders",
                title="Заказы по продуктам",
                type="bar",
                x_key="label",
                y_key="metric_value",
                reason="Сравнивает заказы по продуктам.",
                filter={"group": "products", "metric_key": "orders"},
            ),
            ChartSpec(
                id="regions_revenue",
                title="Выручка по регионам",
                type="pie",
                x_key="label",
                y_key="metric_value",
                reason="Показывает вклад регионов.",
                filter={"group": "regions", "metric_key": "revenue"},
            ),
        ],
    )

    assert charts[0].data == [
        {"label": "Alpha", "metric_value": 52.0},
        {"label": "Beta", "metric_value": 38.0},
    ]
    assert charts[1].data[0] == {"label": "Северный", "metric_value": 360000.0}


def test_aggregate_helpers_return_chart_data() -> None:
    rows = [
        {"date": "2026-01-02", "segment": "SMB", "revenue": "100"},
        {"date": "2026-01-01", "segment": "SMB", "revenue": "50"},
    ]

    assert aggregate_for_line(rows, "date", "revenue") == [
        {"date": "2026-01-01", "revenue": 50.0},
        {"date": "2026-01-02", "revenue": 100.0},
    ]
    assert aggregate_for_pie(rows, "segment", "revenue") == [{"segment": "SMB", "revenue": 150.0}]
