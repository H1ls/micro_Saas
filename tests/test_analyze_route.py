from fastapi.testclient import TestClient

from app.main import app
from app.services.session_store import clear_sessions


def test_analyze_csv_returns_session_analysis_and_chart() -> None:
    clear_sessions()
    client = TestClient(app)

    response = client.post(
        "/api/analyze",
        files={"file": ("sales.csv", b"segment,revenue\nSMB,100\nEnterprise,250\n", "text/csv")},
    )

    assert response.status_code == 200
    body = response.json()
    assert body["session_id"]
    assert body["dataset"]["source_type"] == "csv"
    assert body["analysis"]["headline"]
    assert len(body["charts"]) == 1


def test_analyze_raw_text_returns_dataset_without_chart() -> None:
    clear_sessions()
    client = TestClient(app)

    response = client.post("/api/analyze", data={"raw_text": "First note\nSecond note"})

    assert response.status_code == 200
    body = response.json()
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
