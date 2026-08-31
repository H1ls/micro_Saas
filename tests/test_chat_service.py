import pytest

from app.domain.errors import LLMUnavailableError
from app.domain.models import AIAnalysis, ColumnProfile, DatasetSession, NormalizedDataset
from app.services import chat_service
from app.services.chat_service import answer_question, build_unknown_answer, validate_used_columns


def test_answer_question_uses_valid_llm_response(monkeypatch: pytest.MonkeyPatch) -> None:
    session = _session()

    def fake_complete_json(system_prompt: str, user_prompt: str) -> dict[str, object]:
        assert "only from the uploaded dataset" in system_prompt
        assert session.dataset.compact_context in user_prompt
        return {
            "answer": "Enterprise has the highest revenue in the uploaded dataset.",
            "confidence": "high",
            "used_columns": ["segment", "revenue"],
        }

    monkeypatch.setattr(chat_service, "complete_json", fake_complete_json)

    response = answer_question(session, "Which segment has the highest revenue?")

    assert response.confidence == "high"
    assert response.used_columns == ["segment", "revenue"]


def test_answer_question_returns_unknown_when_llm_fails(monkeypatch: pytest.MonkeyPatch) -> None:
    session = _session()

    def fake_complete_json(system_prompt: str, user_prompt: str) -> dict[str, object]:
        raise LLMUnavailableError()

    monkeypatch.setattr(chat_service, "complete_json", fake_complete_json)

    response = answer_question(session, "What is the market size?")

    assert response == build_unknown_answer()


def test_answer_question_rejects_unknown_used_columns(monkeypatch: pytest.MonkeyPatch) -> None:
    session = _session()

    def fake_complete_json(system_prompt: str, user_prompt: str) -> dict[str, object]:
        return {
            "answer": "This answer references a missing field.",
            "confidence": "medium",
            "used_columns": ["market_size"],
        }

    monkeypatch.setattr(chat_service, "complete_json", fake_complete_json)

    response = answer_question(session, "What is the market size?")

    assert response == build_unknown_answer()


def test_validate_used_columns() -> None:
    columns = [
        ColumnProfile(name="segment", type="category", non_null_count=1, null_count=0),
        ColumnProfile(name="revenue", type="number", non_null_count=1, null_count=0),
    ]

    assert validate_used_columns(columns, ["segment"])
    assert not validate_used_columns(columns, ["missing"])


def _session() -> DatasetSession:
    dataset = NormalizedDataset(
        source_type="csv",
        filename="sales.csv",
        columns=[
            ColumnProfile(name="segment", type="category", non_null_count=2, null_count=0),
            ColumnProfile(name="revenue", type="number", non_null_count=2, null_count=0),
        ],
        rows=[
            {"segment": "SMB", "revenue": 100},
            {"segment": "Enterprise", "revenue": 250},
        ],
        row_count=2,
        column_count=2,
        compact_context='{"columns":["segment","revenue"]}',
    )
    return DatasetSession(
        id="session_1",
        dataset=dataset,
        analysis=AIAnalysis(headline="Ready", narrative="Ready.", key_observations=[], charts=[]),
        charts=[],
        created_at="2026-08-31T16:00:00+00:00",
    )
