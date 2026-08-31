from app.domain.models import ColumnProfile, NormalizedDataset
from app.services.analysis_service import fallback_analysis


def test_fallback_analysis_returns_structured_analysis() -> None:
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

    analysis = fallback_analysis(dataset)

    assert analysis.headline
    assert analysis.narrative
    assert analysis.key_observations
    assert len(analysis.charts) == 1
