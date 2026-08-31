from app.domain.models import ColumnProfile, NormalizedDataset
from app.services.chart_service import prepare_charts, recommend_fallback_charts


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

    assert len(specs) == 1
    assert specs[0].type == "bar"
    assert len(charts) == 1
    assert charts[0].data == [
        {"segment": "Enterprise", "revenue": 250.0},
        {"segment": "SMB", "revenue": 150.0},
    ]
