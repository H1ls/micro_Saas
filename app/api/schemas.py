from pydantic import BaseModel, Field

from app.domain.models import (
    AIAnalysis,
    AskConfidence,
    ColumnProfile,
    PreparedChart,
    SourceType,
)


class HealthResponse(BaseModel):
    status: str = "ok"


class DatasetSummary(BaseModel):
    source_type: SourceType
    filename: str | None = None
    row_count: int
    column_count: int
    columns: list[ColumnProfile]


class AnalyzeResponse(BaseModel):
    session_id: str
    dataset: DatasetSummary
    analysis: AIAnalysis
    charts: list[PreparedChart]


class AskRequest(BaseModel):
    session_id: str
    question: str = Field(min_length=1)


class AskResponse(BaseModel):
    answer: str
    confidence: AskConfidence
    used_columns: list[str]


class ErrorBody(BaseModel):
    code: str
    message: str


class ErrorResponse(BaseModel):
    error: ErrorBody
