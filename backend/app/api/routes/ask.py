from __future__ import annotations

from fastapi import APIRouter

from app.api.schemas import AskRequest, AskResponse
from app.services.chat_service import answer_question
from app.services.session_store import get_session

router = APIRouter(prefix="/ask", tags=["ask"])


@router.post("", response_model=AskResponse)
def ask_dataset(request: AskRequest) -> AskResponse:
    """Отвечает на вопрос по сохраненной dataset session через guarded chat service."""

    session = get_session(request.session_id)
    return answer_question(session, request.question)
