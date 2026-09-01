from __future__ import annotations

from fastapi import APIRouter, File, Form, UploadFile

from app.api.schemas import AnalyzeResponse
from app.services.dashboard_service import analyze_input

router = APIRouter(prefix="/analyze", tags=["analyze"])


@router.post("", response_model=AnalyzeResponse)
def analyze_dataset(
    file: UploadFile | None = File(default=None),
    raw_text: str | None = Form(default=None),
) -> AnalyzeResponse:
    """Принимает файл или raw text и возвращает готовый dashboard contract."""

    return analyze_input(
        file=file.file if file is not None else None,
        raw_text=raw_text,
        filename=file.filename if file is not None else None,
    )
