from __future__ import annotations

import math
from typing import Any

import pandas as pd


def clean_column_name(value: Any, fallback_index: int) -> str:
    name = str(value).strip() if value is not None else ""
    return name or f"column_{fallback_index + 1}"


def normalize_dataframe_columns(df: pd.DataFrame) -> pd.DataFrame:
    normalized = df.copy()
    seen: dict[str, int] = {}
    columns: list[str] = []

    for index, column in enumerate(normalized.columns):
        base_name = clean_column_name(column, index)
        count = seen.get(base_name, 0)
        seen[base_name] = count + 1
        columns.append(base_name if count == 0 else f"{base_name}_{count + 1}")

    normalized.columns = columns
    return normalized


def to_jsonable_value(value: Any) -> Any:
    if pd.isna(value):
        return None
    if hasattr(value, "isoformat"):
        return value.isoformat()
    if isinstance(value, float) and math.isfinite(value):
        return value
    if isinstance(value, float):
        return None
    return value


def dataframe_to_rows(df: pd.DataFrame) -> list[dict[str, Any]]:
    records = df.to_dict(orient="records")
    return [
        {str(key): to_jsonable_value(value) for key, value in row.items()}
        for row in records
    ]
