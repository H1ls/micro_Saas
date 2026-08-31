from datetime import datetime
from typing import Any, Literal

from pydantic import BaseModel, Field


ColumnType = Literal["number", "category", "date", "text", "unknown"]
SourceType = Literal["csv", "excel", "text"]
ChartType = Literal["bar", "line", "pie"]
AskConfidence = Literal["high", "medium", "low", "none"]


class ColumnProfile(BaseModel):
    name: str
    type: ColumnType
    non_null_count: int
    null_count: int
    unique_count: int | None = None
    min_value: float | str | None = None
    max_value: float | str | None = None
    sample_values: list[str] = Field(default_factory=list)


class NormalizedDataset(BaseModel):
    source_type: SourceType
    filename: str | None = None
    columns: list[ColumnProfile]
    rows: list[dict[str, Any]]
    row_count: int
    column_count: int
    compact_context: str


class ChartSpec(BaseModel):
    id: str
    title: str
    type: ChartType
    x_key: str
    y_key: str | None = None
    reason: str


class PreparedChart(BaseModel):
    spec: ChartSpec
    data: list[dict[str, Any]]


class AIAnalysis(BaseModel):
    headline: str
    narrative: str
    key_observations: list[str]
    charts: list[ChartSpec]


class DatasetSession(BaseModel):
    id: str
    dataset: NormalizedDataset
    analysis: AIAnalysis
    charts: list[PreparedChart]
    created_at: datetime
