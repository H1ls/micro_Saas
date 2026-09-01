from __future__ import annotations


RAW_TEXT_EXTRACTION_SYSTEM_PROMPT = """
Извлекай структурированные факты только из raw text, предоставленного пользователем.
Верни только валидный JSON следующей структуры:
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
      "reason": "Сравнение количества заказов по извлеченным товарам.",
      "filter": { "group": "products", "metric_key": "orders" }
    }
  ],
  "confidence": "high"
}
Не придумывай факты, подписи, метрики, валюты, даты, категории или значения.
Для group, label_key, metric_key и unit используй короткие стабильные английские ключи.
Для пользовательских подписей на языке исходного текста используй group_label и metric_label.
Значения label сохраняй на языке исходного текста.
Нормализуй числовые значения: "840 000" должно преобразовываться в 840000.
Если производная метрика явно следует из текста, например average_order_value = total_revenue / total_orders, добавляй ее в metrics.
Выбирай 2-3 полезных графика на основе извлеченных фактов. Используй только типы графиков "bar", "line" и "pie".
Для графиков используй x_key "label", y_key "metric_value" и filter по group и metric_key, чтобы каждый график содержал одну сопоставимую группу фактов.
Названия графиков должны логично соответствовать отфильтрованным фактам и быть полностью на русском языке, если исходный текст на русском.
Если доступны group_label и metric_label, используй их в названиях графиков вместо технических group и metric_key.
Не возвращай точки графика или числовые ряды; backend сам рассчитает данные графиков из structured_facts.
Если текст не содержит фактов вида категория-значение, верни пустые массивы structured_facts и charts.
Допустимые значения confidence: "high", "medium", "low".
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
        "Извлеки нормализованные факты и итоговые метрики из этого неструктурированного текста.\n\n"
        f"{raw_text.strip()}\n\n"
        "Правила:\n"
        "- Используй только информацию, присутствующую в тексте.\n"
        "- structured_facts — это категориальные строки, подходящие для построения графиков.\n"
        "- Если исходный текст на русском языке, используй русские пользовательские подписи, например metric_label=\"заказы\", group_label=\"товарам\".\n"
        "- Metrics — это итоговые или вычисленные сводные значения.\n"
        "- Самостоятельно выбирай параметры графиков: type должен быть bar, line или pie; используй x_key=\"label\", y_key=\"metric_value\".\n"
        "- Используй chart filters, чтобы выделять одну группу и один metric_key, например {\"group\":\"products\",\"metric_key\":\"orders\"}.\n"
        "- Названия графиков должны использовать язык исходных данных, например \"заказы по товарам\" вместо \"orders by products\".\n"
        "- Не включай рассчитанные данные для графиков; backend сам агрегирует значения.\n"
        "- Верни только JSON."
    )