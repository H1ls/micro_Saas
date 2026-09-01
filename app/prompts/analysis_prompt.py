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
      "filter": null
    }
  ]
}
Do not use external facts. Do not invent columns, categories, values, currencies, dates, or events.
If there is not enough information for a claim, keep the claim out of the response.
For this MVP, use only chart types "bar", "line", and "pie".
You choose chart type, x_key, and y_key. Do not return chart data points or numeric series.
If the dataset comes from extracted raw text facts, use x_key "label", y_key "metric_value", and add filter by group and metric_key when needed.
For normal CSV/Excel tables, use filter only when every filter key is an existing dataset column.
Do not add raw-text-only filters such as group or metric_key unless those columns exist in the dataset context.
Write headline, insight_summary, narrative, key_observations, chart titles and reasons in Russian.
Chart titles must clearly describe the displayed metric and grouping, for example "Выручка по регионам".
If source data uses Russian labels or Russian column names, keep all user-facing text fully Russian.
Do not expose technical keys in user-facing chart titles when a readable Russian label can be inferred from the dataset.
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
        "- Chart titles must match what the chart actually displays: metric on y_key by x_key or trend over x_key.\n"
        "- If rows contain group/label/metric_key/metric_value, use filter to isolate one group and one metric_key per chart.\n"
        "- For CSV/Excel datasets, set filter to null unless the filter uses real existing columns from the context.\n"
        "- Write all user-facing text in Russian when the dataset content is Russian; do not mix English technical keys into titles if readable labels are available."
    )
