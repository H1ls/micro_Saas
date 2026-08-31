from __future__ import annotations

from datetime import datetime, timedelta, timezone
from uuid import uuid4

from app.core.config import get_settings
from app.domain.errors import SessionNotFoundError
from app.domain.models import AIAnalysis, DatasetSession, NormalizedDataset, PreparedChart

_SESSIONS: dict[str, DatasetSession] = {}


def create_session(
    dataset: NormalizedDataset,
    analysis: AIAnalysis,
    charts: list[PreparedChart],
) -> DatasetSession:
    cleanup_expired_sessions()
    session = DatasetSession(
        id=str(uuid4()),
        dataset=dataset,
        analysis=analysis,
        charts=charts,
        created_at=datetime.now(timezone.utc),
    )
    _SESSIONS[session.id] = session
    return session


def get_session(session_id: str) -> DatasetSession:
    cleanup_expired_sessions()
    session = _SESSIONS.get(session_id)
    if session is None:
        raise SessionNotFoundError()
    return session


def cleanup_expired_sessions() -> None:
    expires_before = datetime.now(timezone.utc) - timedelta(
        minutes=get_settings().session_ttl_minutes,
    )
    expired_ids = [
        session_id
        for session_id, session in _SESSIONS.items()
        if _normalize_datetime(session.created_at) < expires_before
    ]
    for session_id in expired_ids:
        del _SESSIONS[session_id]


def clear_sessions() -> None:
    _SESSIONS.clear()


def _normalize_datetime(value: datetime) -> datetime:
    if value.tzinfo is None:
        return value.replace(tzinfo=timezone.utc)
    return value
