from __future__ import annotations

from fastapi import APIRouter, File, Form, UploadFile

from app.api.schemas import AnalyzeResponse, DatasetSummary
from app.services.analysis_service import analyze_dataset as analyze_dataset_with_llm
from app.services.chart_service import prepare_charts
from app.services.ingest_service import normalize_dataframe, parse_input
from app.services.raw_text_extraction_service import extract_raw_text
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
    dataframe = parsed_input.dataframe
    if (
        parsed_input.source_type == "text"
        and raw_text
        and list(dataframe.columns) == ["text"]
    ):
        extraction_result = extract_raw_text(raw_text)
        if extraction_result is not None:
            dataset = normalize_dataframe(
                extraction_result.dataframe,
                parsed_input.source_type,
                parsed_input.filename,
                raw_text=raw_text,
                raw_text_extraction=extraction_result.extraction,
            )
            analysis = extraction_result.analysis
            charts = prepare_charts(dataset, analysis.charts)
            session = create_session(dataset, analysis, "ai", charts)
            return AnalyzeResponse(
                session_id=session.id,
                analysis_source=session.analysis_source,
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

    dataset = normalize_dataframe(
        dataframe,
        parsed_input.source_type,
        parsed_input.filename,
        raw_text=raw_text,
    )
    analysis_result = analyze_dataset_with_llm(dataset)
    analysis = analysis_result.analysis
    charts = prepare_charts(dataset, analysis.charts)
    session = create_session(dataset, analysis, analysis_result.source, charts)

    return AnalyzeResponse(
        session_id=session.id,
        analysis_source=session.analysis_source,
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
