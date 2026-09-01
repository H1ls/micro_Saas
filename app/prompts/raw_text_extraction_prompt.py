from __future__ import annotations


RAW_TEXT_EXTRACTION_SYSTEM_PROMPT = """
You extract structured facts only from the raw text provided by the user.
Return only valid JSON with this shape:
{
  "structured_facts": [
    {
      "group": "products",
      "group_label": "товарам",
      "label_key": "product",
      "label": "Alpha",
      "metric_key": "orders",
      "metric_label": "заказы",
      "metric_value": 52,
      "unit": "orders"
    }
  ],
  "metrics": [
    {
      "metric_key": "total_orders",
      "metric_value": 120,
      "unit": "orders"
    }
  ],
  "charts": [
    {
      "id": "chart_1",
      "title": "заказы по товарам",
      "type": "bar",
      "x_key": "label",
      "y_key": "metric_value",
      "reason": "Compare extracted product order counts.",
      "filter": { "group": "products", "metric_key": "orders" }
    }
  ],
  "confidence": "high"
}
Do not invent facts, labels, metrics, currencies, dates, categories, or values.
Use concise stable English keys for group, label_key, metric_key, and unit.
Use group_label and metric_label for user-facing labels in the source text language.
Keep label values in the language used by the source text.
Normalize numeric values: "840 000" must become 840000.
If a derived metric is explicitly implied by the text, such as average_order_value = total_revenue / total_orders, include it in metrics.
Choose 2-3 useful charts from the extracted facts. Use only chart types "bar", "line", and "pie".
For charts, use x_key "label", y_key "metric_value", and filter by group and metric_key so each chart contains one comparable fact group.
Chart titles must be logical for the filtered facts and fully Russian when the source text is Russian.
Use group_label and metric_label in chart titles instead of technical group or metric_key when available.
Do not return chart data points or numeric series; backend will calculate chart data from structured_facts.
If the text does not contain category-value facts, return empty structured_facts and charts arrays.
Allowed confidence values: "high", "medium", "low".
""".strip()


RAW_TEXT_EXTRACTION_JSON_SCHEMA = {
    "type": "object",
    "additionalProperties": False,
    "required": ["structured_facts", "metrics", "charts", "confidence"],
    "properties": {
        "structured_facts": {
            "type": "array",
            "items": {
                "type": "object",
                "additionalProperties": False,
                "required": ["group", "group_label", "label_key", "label", "metric_key", "metric_label", "metric_value", "unit"],
                "properties": {
                    "group": {"type": "string"},
                    "group_label": {"type": ["string", "null"]},
                    "label_key": {"type": "string"},
                    "label": {"type": "string"},
                    "metric_key": {"type": "string"},
                    "metric_label": {"type": ["string", "null"]},
                    "metric_value": {"type": ["number", "string"]},
                    "unit": {"type": ["string", "null"]},
                },
            },
        },
        "metrics": {
            "type": "array",
            "items": {
                "type": "object",
                "additionalProperties": False,
                "required": ["metric_key", "metric_value", "unit"],
                "properties": {
                    "metric_key": {"type": "string"},
                    "metric_value": {"type": ["number", "string"]},
                    "unit": {"type": ["string", "null"]},
                },
            },
        },
        "charts": {
            "type": "array",
            "items": {
                "type": "object",
                "additionalProperties": False,
                "required": ["id", "title", "type", "x_key", "y_key", "reason", "filter"],
                "properties": {
                    "id": {"type": "string"},
                    "title": {"type": "string"},
                    "type": {"type": "string", "enum": ["bar", "line", "pie"]},
                    "x_key": {"type": "string"},
                    "y_key": {"type": ["string", "null"]},
                    "reason": {"type": "string"},
                    "filter": {
                        "type": ["object", "null"],
                        "additionalProperties": {"type": "string"},
                    },
                },
            },
        },
        "confidence": {"type": "string", "enum": ["high", "medium", "low"]},
    },
}


def build_raw_text_extraction_prompt(raw_text: str) -> str:
    """Строит prompt для извлечения фактов из неструктурированного raw text."""

    return (
        "Extract normalized facts and summary metrics from this raw text.\n\n"
        f"{raw_text.strip()}\n\n"
        "Rules:\n"
        "- Use only information present in the text.\n"
        "- structured_facts are category rows suitable for charts.\n"
        "- Use Russian user-facing labels when the source text is Russian, e.g. metric_label=\"заказы\", group_label=\"товарам\".\n"
        "- Metrics are totals or derived summary values.\n"
        "- Choose chart specs yourself: type must be bar, line, or pie; use x_key=\"label\", y_key=\"metric_value\".\n"
        "- Use chart filters to isolate one group and one metric_key, for example {\"group\":\"products\",\"metric_key\":\"orders\"}.\n"
        "- Chart titles must use source-language labels, for example \"заказы по товарам\" instead of \"orders by products\".\n"
        "- Do not include calculated chart data; backend will aggregate values.\n"
        "- Return JSON only."
    )
