from datetime import datetime
from typing import Any, Literal

from pydantic import AliasChoices, BaseModel, Field, field_validator


ColumnType = Literal["number", "category", "date", "text", "unknown"]
SourceType = Literal["csv", "excel", "text"]
ChartType = Literal["bar", "line", "pie"]
AskConfidence = Literal["high", "medium", "low", "none"]
AnalysisSource = Literal["ai", "fallback"]
ExtractionConfidence = Literal["high", "medium", "low"]


class ColumnProfile(BaseModel):
    """Описание одной колонки dataset для profiling, LLM context и chart validation."""

    name: str
    type: ColumnType
    non_null_count: int
    null_count: int
    unique_count: int | None = None
    min_value: float | str | None = None
    max_value: float | str | None = None
    sample_values: list[str] = Field(default_factory=list)


class NormalizedDataset(BaseModel):
    """Единый формат данных после parsing CSV, Excel или raw text."""

    source_type: SourceType
    filename: str | None = None
    raw_text: str | None = None
    raw_text_extraction: "RawTextExtraction | None" = None
    columns: list[ColumnProfile]
    rows: list[dict[str, Any]]
    row_count: int
    column_count: int
    compact_context: str


class ChartSpec(BaseModel):
    """Спецификация графика от LLM или fallback, которую backend обязан валидировать."""

    id: str
    title: str
    type: ChartType
    x_key: str
    y_key: str | None = None
    reason: str
    filter: dict[str, str] | None = None


class PreparedChart(BaseModel):
    """Безопасный график для frontend: валидная спецификация и уже подготовленные данные."""

    spec: ChartSpec
    data: list[dict[str, Any]]


class AIAnalysis(BaseModel):
    """Структурированный narrative dashboard, прошедший Pydantic validation."""

    headline: str
    insight_summary: str
    narrative: str
    key_observations: list[str]
    charts: list[ChartSpec]


class AnalysisResult(BaseModel):
    """Результат analysis с явным источником: LLM или deterministic fallback."""

    analysis: AIAnalysis
    source: AnalysisSource


class ExtractedFact(BaseModel):
    """Один нормализованный факт из raw text: категория, метрика и числовое значение."""

    group: str
    group_label: str | None = None
    label_key: str
    label: str
    metric_key: str
    metric_label: str | None = None
    metric_value: float
    unit: str | None = None

    @field_validator("metric_value", mode="before")
    @classmethod
    def normalize_metric_value(cls, value: Any) -> Any:
        """Приводит числовые строки LLM extraction к float без доверия к форматированию модели."""

        return _normalize_numeric_value(value)


class ExtractedMetric(BaseModel):
    """Сводная метрика из raw text, не обязательно привязанная к категории."""

    metric_key: str
    metric_value: float
    unit: str | None = None

    @field_validator("metric_value", mode="before")
    @classmethod
    def normalize_metric_value(cls, value: Any) -> Any:
        """Приводит числовые строки LLM extraction к float без доверия к форматированию модели."""

        return _normalize_numeric_value(value)


class RawTextExtraction(BaseModel):
    """Структурированный JSON из raw text после LLM extraction и Pydantic validation."""

    structured_facts: list[ExtractedFact] = Field(
        validation_alias=AliasChoices("structured_facts", "facts"),
        serialization_alias="structured_facts",
    )
    metrics: list[ExtractedMetric] = Field(default_factory=list)
    confidence: ExtractionConfidence = "medium"

    @property
    def facts(self) -> list[ExtractedFact]:
        return self.structured_facts


def _normalize_numeric_value(value: Any) -> Any:
    if isinstance(value, str):
        return (
            value.replace(" ", "")
            .replace("\u00a0", "")
            .replace("₽", "")
            .replace("рублей", "")
            .replace("руб.", "")
            .replace(",", ".")
            .strip()
        )
    return value


class DatasetSession(BaseModel):
    """In-memory session с dataset, анализом и графиками для последующих вопросов."""

    id: str
    dataset: NormalizedDataset
    analysis: AIAnalysis
    analysis_source: AnalysisSource
    charts: list[PreparedChart]
    created_at: datetime
