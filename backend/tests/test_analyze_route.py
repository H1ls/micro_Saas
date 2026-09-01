from fastapi.testclient import TestClient

from app.services import dashboard_service
from app.domain.models import AnalysisResult, NormalizedDataset
from app.main import app
from app.services.analysis_service import fallback_analysis
from app.services.raw_text_extraction_service import (
    RawTextExtractionResult,
    build_raw_text_analysis,
    extraction_to_dataframe,
    parse_raw_text_extraction,
)
from app.services.session_store import clear_sessions


def fallback_result(dataset: NormalizedDataset) -> AnalysisResult:
    return AnalysisResult(analysis=fallback_analysis(dataset), source="fallback")


def test_analyze_csv_returns_session_analysis_and_chart(monkeypatch) -> None:
    clear_sessions()
    monkeypatch.setattr(dashboard_service, "analyze_dataset_with_llm", fallback_result)
    client = TestClient(app)

    response = client.post(
        "/api/analyze",
        files={"file": ("sales.csv", b"segment,revenue\nSMB,100\nEnterprise,250\n", "text/csv")},
    )

    assert response.status_code == 200
    body = response.json()
    assert body["session_id"]
    assert body["analysis_source"] == "fallback"
    assert body["dataset"]["source_type"] == "csv"
    assert body["analysis"]["headline"]
    assert len(body["charts"]) == 2


def test_analyze_raw_text_returns_dataset_without_chart(monkeypatch) -> None:
    clear_sessions()
    monkeypatch.setattr(dashboard_service, "analyze_dataset_with_llm", fallback_result)
    client = TestClient(app)

    response = client.post("/api/analyze", data={"raw_text": "First note\nSecond note"})

    assert response.status_code == 200
    body = response.json()
    assert body["analysis_source"] == "fallback"
    assert body["dataset"]["source_type"] == "text"
    assert body["dataset"]["row_count"] == 2
    assert body["charts"] == []


def test_analyze_plain_raw_text_extracts_facts_with_one_llm_call(monkeypatch) -> None:
    clear_sessions()
    client = TestClient(app)

    def fake_extract_raw_text(raw_text: str) -> RawTextExtractionResult:
        assert "Общая выручка" in raw_text
        extraction = parse_raw_text_extraction(
            {
                "structured_facts": [
                    {
                        "group": "products",
                        "label_key": "product",
                        "label": "Alpha",
                        "metric_key": "orders",
                        "metric_value": 52,
                        "unit": "orders",
                    },
                    {
                        "group": "products",
                        "label_key": "product",
                        "label": "Beta",
                        "metric_key": "orders",
                        "metric_value": 38,
                        "unit": "orders",
                    },
                    {
                        "group": "regions",
                        "label_key": "region",
                        "label": "Северный",
                        "metric_key": "revenue",
                        "metric_value": 360000,
                        "unit": "rub",
                    },
                    {
                        "group": "regions",
                        "label_key": "region",
                        "label": "Южный",
                        "metric_key": "revenue",
                        "metric_value": 280000,
                        "unit": "rub",
                    },
                ],
                "metrics": [{"metric_key": "total_orders", "metric_value": 120, "unit": "orders"}],
                "confidence": "high",
            }
        )
        return RawTextExtractionResult(
            extraction=extraction,
            dataframe=extraction_to_dataframe(extraction),
            analysis=build_raw_text_analysis(extraction),
        )

    def fail_if_second_llm_call(dataset: NormalizedDataset) -> AnalysisResult:
        raise AssertionError("raw_text extracted path must not call analysis LLM")

    monkeypatch.setattr(dashboard_service, "extract_raw_text", fake_extract_raw_text)
    monkeypatch.setattr(dashboard_service, "analyze_dataset_with_llm", fail_if_second_llm_call)

    response = client.post(
        "/api/analyze",
        data={
            "raw_text": (
                "Всего было 120 заказов.\n"
                "Общая выручка составила 840 000 рублей.\n"
                "Продукт Alpha - 52 заказа.\n"
                "Продукт Beta - 38 заказов.\n"
                "Северный регион принес 360 000 рублей.\n"
                "Южный регион принес 280 000 рублей."
            )
        },
    )

    assert response.status_code == 200
    body = response.json()
    assert body["analysis_source"] == "ai"
    assert body["dataset"]["column_count"] >= 6
    assert body["analysis"]["insight_summary"]
    assert body["charts"][0]["data"] == [
        {"label": "Alpha", "metric_value": 52.0},
        {"label": "Beta", "metric_value": 38.0},
    ]


def test_analyze_missing_input_returns_controlled_error() -> None:
    client = TestClient(app)

    response = client.post("/api/analyze")

    assert response.status_code == 400
    assert response.json() == {
        "error": {
            "code": "missing_input",
            "message": "Upload CSV, XLSX, XLS or paste raw text.",
        }
    }
