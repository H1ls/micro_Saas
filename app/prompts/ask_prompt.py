from __future__ import annotations

from app.domain.models import DatasetSession


UNKNOWN_ANSWER = "I cannot answer this from the uploaded dataset."

ASK_SYSTEM_PROMPT = f"""
You answer questions only from the uploaded dataset context.
Return only valid JSON with this shape:
{{
  "answer": "answer grounded only in the dataset",
  "confidence": "high|medium|low|none",
  "used_columns": ["existing column name"]
}}
Do not use external facts. Do not invent columns, values, dates, currencies, segments, or events.
If the dataset context does not contain enough information, return:
{{"answer":"{UNKNOWN_ANSWER}","confidence":"none","used_columns":[]}}
""".strip()


def build_ask_prompt(session: DatasetSession, question: str) -> str:
    return (
        "Answer the question using only this uploaded dataset context.\n\n"
        f"{session.dataset.compact_context}\n\n"
        f"Question: {question.strip()}"
    )
