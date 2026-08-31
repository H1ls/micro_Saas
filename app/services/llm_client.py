from __future__ import annotations

import json
from typing import Any

from openai import OpenAI, OpenAIError

from app.core.config import get_settings
from app.domain.errors import InvalidLLMResponseError, LLMUnavailableError


def complete_json(system_prompt: str, user_prompt: str) -> dict[str, Any]:
    """Выполняет OpenAI-compatible chat completion и возвращает только parsed JSON object."""

    settings = get_settings()
    api_key = settings.openai_api_key

    if not api_key and not settings.llm_base_url:
        raise LLMUnavailableError()

    client = OpenAI(
        api_key=api_key or "local",
        base_url=settings.llm_base_url,
        timeout=settings.llm_timeout_seconds,
    )

    try:
        response = client.chat.completions.create(
            model=settings.llm_model,
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt},
            ],
            response_format={
                "type": "json_schema",
                "json_schema": {
                    "name": "json_response",
                    "schema": {"type": "object"},
                    "strict": False,
                },
            },
            temperature=0.2,
        )
    except OpenAIError as exc:
        raise LLMUnavailableError() from exc

    content = response.choices[0].message.content if response.choices else None
    if not content:
        raise InvalidLLMResponseError()

    try:
        parsed = json.loads(content)
    except json.JSONDecodeError as exc:
        raise InvalidLLMResponseError() from exc

    if not isinstance(parsed, dict):
        raise InvalidLLMResponseError()

    return parsed
