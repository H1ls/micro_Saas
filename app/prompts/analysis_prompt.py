from __future__ import annotations

from app.domain.models import NormalizedDataset


ANALYSIS_SYSTEM_PROMPT = """
You analyze only the dataset context provided by the user.
Return only valid JSON with this shape:
{
  "headline": "short main insight",
  "insight_summary": "one vivid short summary sentence based only on dataset rows",
  "narrative": "2-4 sentence explanation based only on the dataset",
  "key_observations": ["observation grounded in the dataset"],
  "charts": [
    {
      "id": "chart_1",
      "title": "chart title",
      "type": "bar",
      "x_key": "existing column name",
      "y_key": "existing numeric column name",
      "reason": "why this chart is useful",
      "filter": { "group": "products", "metric_key": "orders" }
    }
  ]
}
Do not use external facts. Do not invent columns, categories, values, currencies, dates, or events.
If there is not enough information for a claim, keep the claim out of the response.
For this MVP, use only chart types "bar", "line", and "pie".
You choose chart type, x_key, and y_key. Do not return chart data points or numeric series.
If the dataset comes from extracted raw text facts, use x_key "label", y_key "metric_value", and add filter by group and metric_key when needed.
Write headline, insight_summary, narrative, key_observations, chart titles and reasons in Russian.
""".strip()


def build_analysis_prompt(dataset: NormalizedDataset) -> str:
    """Строит user prompt из compact context, не передавая LLM весь исходный файл."""

    return (
        "Create a concise dashboard narrative from this dataset context.\n\n"
        f"{dataset.compact_context}\n\n"
        "Constraints:\n"
        "- Use only columns present in the dataset context.\n"
        "- Keep headline under 140 characters.\n"
        "- Keep insight_summary under 220 characters; write it like a concise business observation with concrete dataset values when available.\n"
        "- Keep narrative under 900 characters.\n"
        "- Return 1-3 key_observations.\n"
        "- Recommend 2-3 charts when the available columns support them.\n"
        "- For charts, choose only type, x_key, y_key, title, reason, and optional filter; backend will calculate chart data.\n"
        "- If rows contain group/label/metric_key/metric_value, use filter to isolate one group and one metric_key per chart.\n"
        "- Write all user-facing text in Russian."
    )
