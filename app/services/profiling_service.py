from __future__ import annotations

import json
import re
from typing import Any

import pandas as pd
from pandas.api.types import is_datetime64_any_dtype, is_numeric_dtype

from app.domain.models import ColumnProfile, NormalizedDataset

MAX_SAMPLE_VALUES = 5
MAX_CONTEXT_SAMPLE_ROWS = 50
MAX_TOP_VALUES = 5
DATE_LIKE_PATTERN = re.compile(r"^\d{4}[-/]\d{1,2}[-/]\d{1,2}|^\d{1,2}[-/]\d{1,2}[-/]\d{2,4}$")


def infer_column_profiles(df: pd.DataFrame) -> list[ColumnProfile]:
    return [_profile_column(name, df[name]) for name in df.columns]


def build_compact_context(dataset: NormalizedDataset) -> str:
    numeric_summary = []
    category_summary = []
    date_summary = []

    for column in dataset.columns:
        if column.type == "number":
            numeric_summary.append(
                {
                    "name": column.name,
                    "min": column.min_value,
                    "max": column.max_value,
                    "non_null_count": column.non_null_count,
                    "null_count": column.null_count,
                }
            )
        elif column.type == "category":
            category_summary.append(
                {
                    "name": column.name,
                    "unique_count": column.unique_count,
                    "sample_values": column.sample_values[:MAX_TOP_VALUES],
                }
            )
        elif column.type == "date":
            date_summary.append(
                {
                    "name": column.name,
                    "min": column.min_value,
                    "max": column.max_value,
                }
            )

    context = {
        "source_type": dataset.source_type,
        "filename": dataset.filename,
        "row_count": dataset.row_count,
        "column_count": dataset.column_count,
        "columns": [column.model_dump() for column in dataset.columns],
        "numeric_summary": numeric_summary,
        "category_summary": category_summary,
        "date_summary": date_summary,
        "sample_rows": dataset.rows[:MAX_CONTEXT_SAMPLE_ROWS],
    }
    return json.dumps(context, ensure_ascii=False, default=str)


def _profile_column(name: str, series: pd.Series) -> ColumnProfile:
    non_null = series.dropna()
    column_type = _infer_column_type(series)
    min_value, max_value = _min_max_values(non_null, column_type)

    return ColumnProfile(
        name=str(name),
        type=column_type,
        non_null_count=int(non_null.size),
        null_count=int(series.size - non_null.size),
        unique_count=int(non_null.nunique(dropna=True)),
        min_value=min_value,
        max_value=max_value,
        sample_values=_sample_values(non_null),
    )


def _infer_column_type(series: pd.Series) -> str:
    non_null = series.dropna()
    if non_null.empty:
        return "unknown"
    if is_numeric_dtype(series):
        return "number"
    if is_datetime64_any_dtype(series):
        return "date"

    numeric_values = pd.to_numeric(non_null, errors="coerce")
    if numeric_values.notna().mean() >= 0.8:
        return "number"

    string_values = non_null.astype(str).str.strip()
    date_like_ratio = string_values.str.match(DATE_LIKE_PATTERN).mean()
    if date_like_ratio >= 0.8:
        parsed_dates = pd.to_datetime(non_null, errors="coerce")
        if parsed_dates.notna().mean() >= 0.8:
            return "date"

    unique_ratio = non_null.nunique(dropna=True) / max(len(non_null), 1)
    average_length = non_null.astype(str).str.len().mean()
    if unique_ratio <= 0.5 or non_null.nunique(dropna=True) <= 20:
        return "category"
    if average_length > 40:
        return "text"
    return "category"


def _min_max_values(series: pd.Series, column_type: str) -> tuple[Any, Any]:
    if series.empty or column_type in {"category", "text", "unknown"}:
        return None, None
    if column_type == "number":
        numeric_values = pd.to_numeric(series, errors="coerce").dropna()
        if numeric_values.empty:
            return None, None
        return float(numeric_values.min()), float(numeric_values.max())
    if column_type == "date":
        date_values = pd.to_datetime(series, errors="coerce").dropna()
        if date_values.empty:
            return None, None
        return date_values.min().isoformat(), date_values.max().isoformat()
    return None, None


def _sample_values(series: pd.Series) -> list[str]:
    values = []
    for value in series.astype(str).drop_duplicates().head(MAX_SAMPLE_VALUES):
        values.append(value)
    return values
