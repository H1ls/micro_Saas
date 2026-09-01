from app.services import raw_text_extraction_service
from app.services.raw_text_extraction_service import extract_raw_text


def test_extract_raw_text_uses_one_llm_call_and_structured_facts(monkeypatch) -> None:
    def fake_complete_json(
        system_prompt: str,
        user_prompt: str,
        json_schema: dict[str, object] | None = None,
        strict_schema: bool = False,
    ) -> dict[str, object]:
        assert "Do not invent facts" in system_prompt
        assert "Всего было 120 заказов" in user_prompt
        assert json_schema is not None
        assert strict_schema is True
        return {
            "structured_facts": [
                {
                    "group": "products",
                    "label_key": "product",
                    "label": "Alpha",
                    "metric_key": "orders",
                    "metric_value": "52",
                    "unit": "orders",
                },
                {
                    "group": "regions",
                    "label_key": "region",
                    "label": "Северный",
                    "metric_key": "revenue",
                    "metric_value": "360 000",
                    "unit": "rub",
                },
            ],
            "metrics": [
                {"metric_key": "total_orders", "metric_value": 120, "unit": "orders"},
                {"metric_key": "total_revenue", "metric_value": "840 000", "unit": "rub"},
            ],
            "confidence": "high",
        }

    monkeypatch.setattr(raw_text_extraction_service, "complete_json", fake_complete_json)

    result = extract_raw_text("Всего было 120 заказов.")

    assert result is not None
    dataframe = result.dataframe
    assert dataframe is not None
    assert list(dataframe["label"]) == ["Alpha", "Северный"]
    assert list(dataframe["metric_value"]) == [52.0, 360000.0]
    assert dataframe.loc[0, "total_orders"] == 120.0
    assert dataframe.loc[1, "total_revenue"] == 840000.0
    assert result.analysis.charts[0].filter == {"group": "products", "metric_key": "orders"}
