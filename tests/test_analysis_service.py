import pytest

from app.domain.errors import InvalidLLMResponseError, LLMUnavailableError
from app.domain.models import ColumnProfile, NormalizedDataset
from app.services import analysis_service
from app.services.analysis_service import (
    analyze_dataset,
    fallback_analysis,
    parse_analysis_json,
    validate_analysis,
)


def build_dataset() -> NormalizedDataset:
    return NormalizedDataset(
        source_type="csv",
        filename="sales.csv",
        columns=[
            ColumnProfile(name="segment", type="category", non_null_count=1, null_count=0),
            ColumnProfile(name="revenue", type="number", non_null_count=1, null_count=0),
        ],
        rows=[{"segment": "SMB", "revenue": 100}],
        row_count=1,
        column_count=2,
        compact_context='{"columns":[{"name":"segment"},{"name":"revenue"}]}',
    )


def test_fallback_analysis_returns_structured_analysis() -> None:
    dataset = build_dataset()

    analysis = fallback_analysis(dataset)

    assert analysis.headline
    assert analysis.insight_summary
    assert analysis.narrative
    assert analysis.key_observations
    assert len(analysis.charts) == 2


def test_parse_analysis_json_accepts_chart_specs_alias() -> None:
    analysis = parse_analysis_json(
        {
            "headline": "Revenue differs by segment",
            "narrative": "The dataset shows revenue by uploaded segment values.",
            "observations": ["SMB has revenue in the uploaded rows."],
            "chart_specs": [
                {
                    "id": "chart_1",
                    "title": "Revenue by segment",
                    "type": "bar",
                    "x_key": "segment",
                    "y_key": "revenue",
                    "reason": "Compares numeric revenue across categories.",
                }
            ],
        }
    )

    assert analysis.key_observations == ["SMB has revenue in the uploaded rows."]
    assert analysis.charts[0].x_key == "segment"


def test_validate_analysis_rejects_unknown_chart_columns() -> None:
    dataset = build_dataset()
    analysis = parse_analysis_json(
        {
            "headline": "Revenue differs by segment",
            "narrative": "The dataset shows revenue by uploaded segment values.",
            "key_observations": ["Segment and revenue are present."],
            "charts": [
                {
                    "id": "chart_1",
                    "title": "Revenue by missing column",
                    "type": "bar",
                    "x_key": "missing_segment",
                    "y_key": "revenue",
                    "reason": "Invalid because the column does not exist.",
                }
            ],
        }
    )

    with pytest.raises(InvalidLLMResponseError):
        validate_analysis(dataset, analysis)


def test_validate_analysis_drops_invalid_chart_filter_when_columns_are_valid() -> None:
    dataset = build_dataset()
    analysis = parse_analysis_json(
        {
            "headline": "Revenue differs by segment",
            "insight_summary": "SMB has revenue in the uploaded rows.",
            "narrative": "The dataset shows revenue by uploaded segment values.",
            "key_observations": ["Segment and revenue are present."],
            "charts": [
                {
                    "id": "chart_1",
                    "title": "Выручка по сегментам",
                    "type": "bar",
                    "x_key": "segment",
                    "y_key": "revenue",
                    "reason": "Compares revenue across segments.",
                    "filter": {"group": "products", "metric_key": "revenue"},
                }
            ],
        }
    )

    validated = validate_analysis(dataset, analysis)

    assert validated.charts[0].filter is None


def test_validate_analysis_trims_overlong_text_without_losing_valid_charts() -> None:
    dataset = build_dataset()
    analysis = parse_analysis_json(
        {
            "headline": "Revenue differs by segment",
            "insight_summary": "A" * 260,
            "narrative": "The dataset shows revenue by uploaded segment values.",
            "key_observations": ["Segment and revenue are present."],
            "charts": [
                {
                    "id": "chart_1",
                    "title": "Выручка по сегментам",
                    "type": "bar",
                    "x_key": "segment",
                    "y_key": "revenue",
                    "reason": "Compares revenue across segments.",
                }
            ],
        }
    )

    validated = validate_analysis(dataset, analysis)

    assert len(validated.insight_summary) == analysis_service.MAX_INSIGHT_SUMMARY_LENGTH
    assert validated.charts[0].id == "chart_1"


def test_analyze_dataset_uses_llm_when_response_is_valid(monkeypatch: pytest.MonkeyPatch) -> None:
    dataset = build_dataset()

    def fake_complete_json(system_prompt: str, user_prompt: str) -> dict[str, object]:
        assert "Do not use external facts" in system_prompt
        assert dataset.compact_context in user_prompt
        return {
            "headline": "Revenue differs by segment",
            "insight_summary": "Enterprise is the key revenue segment in the uploaded rows.",
            "narrative": "The uploaded dataset contains segment and revenue columns.",
            "key_observations": ["The response uses only uploaded columns."],
            "charts": [
                {
                    "id": "chart_1",
                    "title": "Revenue by segment",
                    "type": "bar",
                    "x_key": "segment",
                    "y_key": "revenue",
                    "reason": "Compares revenue across segments.",
                }
            ],
        }

    monkeypatch.setattr(analysis_service, "complete_json", fake_complete_json)

    result = analyze_dataset(dataset)

    assert result.source == "ai"
    assert result.analysis.headline == "Revenue differs by segment"
    assert result.analysis.insight_summary == "Enterprise is the key revenue segment in the uploaded rows."
    assert result.analysis.charts[0].id == "chart_1"


def test_analyze_dataset_falls_back_when_llm_fails(monkeypatch: pytest.MonkeyPatch) -> None:
    dataset = build_dataset()

    def fake_complete_json(system_prompt: str, user_prompt: str) -> dict[str, object]:
        raise LLMUnavailableError()

    monkeypatch.setattr(analysis_service, "complete_json", fake_complete_json)

    result = analyze_dataset(dataset)

    assert result.source == "fallback"
    assert result.analysis.headline == "revenue can be compared by segment"
    assert result.analysis.charts[0].id == "fallback_bar_1"
