from __future__ import annotations

from app.domain.models import NormalizedDataset


ANALYSIS_SYSTEM_PROMPT = """
You analyze only the dataset context provided by the user.
Return only valid JSON with this shape:
{
  "headline": "short main insight",
  "narrative": "2-4 sentence explanation based only on the dataset",
  "key_observations": ["observation grounded in the dataset"],
  "charts": [
    {
      "id": "chart_1",
      "title": "chart title",
      "type": "bar",
      "x_key": "existing column name",
      "y_key": "existing numeric column name",
      "reason": "why this chart is useful"
    }
  ]
}
Do not use external facts. Do not invent columns, categories, values, currencies, dates, or events.
If there is not enough information for a claim, keep the claim out of the response.
For this MVP, use only chart types "bar", "line", and "pie".
Write headline, narrative, key_observations, chart titles and reasons in Russian.
""".strip()


def build_analysis_prompt(dataset: NormalizedDataset) -> str:
    """Строит user prompt из compact context, не передавая LLM весь исходный файл."""

    return (
        "Create a concise dashboard narrative from this dataset context.\n\n"
        f"{dataset.compact_context}\n\n"
        "Constraints:\n"
        "- Use only columns present in the dataset context.\n"
        "- Keep headline under 140 characters.\n"
        "- Keep narrative under 900 characters.\n"
        "- Return 1-3 key_observations.\n"
        "- Recommend 2-3 charts when the available columns support them.\n"
        "- Write all user-facing text in Russian."
    )
