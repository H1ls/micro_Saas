from fastapi.testclient import TestClient

from app.api.routes import analyze
from app.domain.models import AnalysisResult, NormalizedDataset
from app.main import app
from app.services.analysis_service import fallback_analysis
from app.services.session_store import clear_sessions


def fallback_result(dataset: NormalizedDataset) -> AnalysisResult:
    return AnalysisResult(analysis=fallback_analysis(dataset), source="fallback")


def test_analyze_csv_returns_session_analysis_and_chart(monkeypatch) -> None:
    clear_sessions()
    monkeypatch.setattr(analyze, "analyze_dataset_with_llm", fallback_result)
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
    monkeypatch.setattr(analyze, "analyze_dataset_with_llm", fallback_result)
    client = TestClient(app)

    response = client.post("/api/analyze", data={"raw_text": "First note\nSecond note"})

    assert response.status_code == 200
    body = response.json()
    assert body["analysis_source"] == "fallback"
    assert body["dataset"]["source_type"] == "text"
    assert body["dataset"]["row_count"] == 2
    assert body["charts"] == []


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
