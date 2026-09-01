from __future__ import annotations

from app.domain.models import DatasetSession


UNKNOWN_ANSWER = "Я не могу ответить на этот вопрос на основе загруженного датасета."

ASK_SYSTEM_PROMPT = f"""
Отвечай на вопросы, используя только контекст загруженного датасета.
Верни только валидный JSON следующей структуры:
{{
  "answer": "ответ, основанный только на данных из датасета",
  "confidence": "high|medium|low|none",
  "used_columns": ["существующее имя столбца"]
}}
Не используй внешние факты.
Не придумывай столбцы, значения, даты, валюты, сегменты или события.
Пользовательский текст ответа пиши на русском языке.
Если контекст датасета не содержит достаточно информации, верни:
{{"answer":"{UNKNOWN_ANSWER}","confidence":"none","used_columns":[]}}
""".strip()


def build_ask_prompt(session: DatasetSession, question: str) -> str:
    """Строит prompt для вопроса по сохраненной session без внешних знаний."""

    return (
        "Ответь на вопрос, используя только контекст этого загруженного датасета.\n\n"
        f"{session.dataset.compact_context}\n\n"
        f"Вопрос: {question.strip()}"
    )