from datetime import datetime, timedelta, timezone

import pytest

from app.domain.errors import SessionNotFoundError
from app.domain.models import AIAnalysis, DatasetSession, NormalizedDataset
from app.services import session_store


def test_create_and_get_session() -> None:
    session_store.clear_sessions()
    dataset = _dataset()
    analysis = _analysis()

    session = session_store.create_session(dataset, analysis, "ai", [])

    assert session_store.get_session(session.id).id == session.id
    assert session.analysis_source == "ai"


def test_expired_session_is_removed(monkeypatch: pytest.MonkeyPatch) -> None:
    session_store.clear_sessions()
    expired = DatasetSession(
        id="expired",
        dataset=_dataset(),
        analysis=_analysis(),
        analysis_source="fallback",
        charts=[],
        created_at=datetime.now(timezone.utc) - timedelta(minutes=120),
    )
    monkeypatch.setitem(session_store._SESSIONS, expired.id, expired)

    with pytest.raises(SessionNotFoundError):
        session_store.get_session(expired.id)


def _dataset() -> NormalizedDataset:
    return NormalizedDataset(
        source_type="csv",
        filename="sales.csv",
        columns=[],
        rows=[],
        row_count=0,
        column_count=0,
        compact_context="{}",
    )


def _analysis() -> AIAnalysis:
    return AIAnalysis(
        headline="Dataset ready",
        narrative="Dataset ready.",
        key_observations=[],
        charts=[],
    )
