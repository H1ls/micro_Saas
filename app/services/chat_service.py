from __future__ import annotations

from typing import Any

from pydantic import ValidationError

from app.api.schemas import AskResponse
from app.domain.errors import InvalidLLMResponseError, LLMUnavailableError
from app.domain.models import AskConfidence, DatasetSession
from app.prompts.ask_prompt import ASK_SYSTEM_PROMPT, UNKNOWN_ANSWER, build_ask_prompt
from app.services.llm_client import complete_json

VALID_CONFIDENCE: set[AskConfidence] = {"high", "medium", "low", "none"}


def answer_question(session: DatasetSession, question: str) -> AskResponse:
    try:
        raw = complete_json(
            system_prompt=ASK_SYSTEM_PROMPT,
            user_prompt=build_ask_prompt(session, question),
        )
        response = parse_ask_json(raw)
        if not validate_used_columns(session.dataset.columns, response.used_columns):
            return build_unknown_answer()
        return response
    except (LLMUnavailableError, InvalidLLMResponseError):
        return build_unknown_answer()


def build_unknown_answer() -> AskResponse:
    return AskResponse(answer=UNKNOWN_ANSWER, confidence="none", used_columns=[])


def parse_ask_json(raw: dict[str, Any]) -> AskResponse:
    try:
        response = AskResponse.model_validate(raw)
    except ValidationError as exc:
        raise InvalidLLMResponseError() from exc

    if response.confidence not in VALID_CONFIDENCE:
        raise InvalidLLMResponseError()
    if response.confidence == "none" and response.answer.strip() != UNKNOWN_ANSWER:
        return build_unknown_answer()
    if not response.answer.strip():
        raise InvalidLLMResponseError()

    return response


def validate_used_columns(columns: list[Any], used_columns: list[str]) -> bool:
    valid_column_names = {column.name for column in columns}
    return all(column in valid_column_names for column in used_columns)
