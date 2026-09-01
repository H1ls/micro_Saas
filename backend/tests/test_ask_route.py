from fastapi.testclient import TestClient

from app.api.routes import ask
from app.api.schemas import AskResponse
from app.domain.models import AIAnalysis, ColumnProfile, NormalizedDataset
from app.main import app
from app.services.session_store import clear_sessions, create_session


def test_ask_returns_answer_for_existing_session(monkeypatch) -> None:
    clear_sessions()
    session = create_session(
        _dataset(),
        AIAnalysis(headline="Ready", insight_summary="Ready.", narrative="Ready.", key_observations=[], charts=[]),
        "ai",
        [],
    )
    monkeypatch.setattr(
        ask,
        "answer_question",
        lambda session, question: AskResponse(
            answer="Enterprise has the highest revenue in the uploaded dataset.",
            confidence="high",
            used_columns=["segment", "revenue"],
        ),
    )
    client = TestClient(app)

    response = client.post(
        "/api/ask",
        json={"session_id": session.id, "question": "Which segment has the highest revenue?"},
    )

    assert response.status_code == 200
    body = response.json()
    assert body["answer"]
    assert body["confidence"] in {"high", "medium", "low", "none"}
    assert "used_columns" in body


def test_ask_missing_session_returns_controlled_error() -> None:
    clear_sessions()
    client = TestClient(app)

    response = client.post(
        "/api/ask",
        json={"session_id": "missing", "question": "Any answer?"},
    )

    assert response.status_code == 404
    assert response.json()["error"]["code"] == "session_not_found"


def _dataset() -> NormalizedDataset:
    return NormalizedDataset(
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
