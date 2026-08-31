from __future__ import annotations

from fastapi import APIRouter, File, Form, UploadFile

from app.api.schemas import AnalyzeResponse, DatasetSummary
from app.services.analysis_service import analyze_dataset as analyze_dataset_with_llm
from app.services.chart_service import prepare_charts
from app.services.ingest_service import normalize_dataframe, parse_input
from app.services.session_store import create_session

router = APIRouter(prefix="/analyze", tags=["analyze"])


@router.post("", response_model=AnalyzeResponse)
def analyze_dataset(
    file: UploadFile | None = File(default=None),
    raw_text: str | None = Form(default=None),
) -> AnalyzeResponse:
    """Принимает файл или raw text и возвращает готовый dashboard contract."""

    parsed_input = parse_input(
        file=file.file if file is not None else None,
        raw_text=raw_text,
        filename=file.filename if file is not None else None,
    )
    dataset = normalize_dataframe(
        parsed_input.dataframe,
        parsed_input.source_type,
        parsed_input.filename,
    )
    analysis = analyze_dataset_with_llm(dataset)
    charts = prepare_charts(dataset, analysis.charts)
    session = create_session(dataset, analysis, charts)

    return AnalyzeResponse(
        session_id=session.id,
        dataset=DatasetSummary(
            source_type=dataset.source_type,
            filename=dataset.filename,
            row_count=dataset.row_count,
            column_count=dataset.column_count,
            columns=dataset.columns,
        ),
        analysis=analysis,
        charts=charts,
    )
