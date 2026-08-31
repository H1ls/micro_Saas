from __future__ import annotations

from dataclasses import dataclass
from io import BytesIO, StringIO
from pathlib import Path
from typing import BinaryIO

import pandas as pd

from app.core.config import get_settings
from app.domain.errors import (
    DatasetParseError,
    EmptyDatasetError,
    FileTooLargeError,
    MissingInputError,
    UnsupportedFileTypeError,
)
from app.domain.models import NormalizedDataset, SourceType
from app.services.profiling_service import build_compact_context, infer_column_profiles
from app.utils.dataframe import dataframe_to_rows, normalize_dataframe_columns

SUPPORTED_EXTENSIONS = {".csv", ".xls", ".xlsx"}


@dataclass(frozen=True)
class ParsedInput:
    """Результат parsing входа до нормализации: dataframe, тип источника и имя файла."""

    dataframe: pd.DataFrame
    source_type: SourceType
    filename: str | None = None


def validate_file(filename: str | None, content: bytes) -> None:
    """Проверяет расширение и размер файла до parsing, возвращая controlled errors."""

    if not filename:
        raise UnsupportedFileTypeError()

    extension = Path(filename).suffix.lower()
    if extension not in SUPPORTED_EXTENSIONS:
        raise UnsupportedFileTypeError()

    max_bytes = get_settings().max_upload_size_mb * 1024 * 1024
    if len(content) > max_bytes:
        raise FileTooLargeError()


def parse_input(
    file: BinaryIO | None = None,
    raw_text: str | None = None,
    filename: str | None = None,
) -> ParsedInput:
    """Выбирает путь parsing для файла или raw text и не допускает пустой вход."""

    has_file = file is not None
    has_text = bool(raw_text and raw_text.strip())

    if not has_file and not has_text:
        raise MissingInputError()
    if has_file:
        content = file.read()
        validate_file(filename or getattr(file, "filename", None), content)
        resolved_filename = filename or getattr(file, "filename", None)
        return _parse_file_content(content, resolved_filename)

    return ParsedInput(
        dataframe=_parse_raw_text(raw_text or ""),
        source_type="text",
        filename=None,
    )


def normalize_dataframe(
    df: pd.DataFrame,
    source_type: SourceType,
    filename: str | None = None,
) -> NormalizedDataset:
    """Очищает dataframe, строит profiles и compact context для дальнейшего анализа."""

    if df.empty:
        raise EmptyDatasetError()

    normalized_df = normalize_dataframe_columns(df)
    normalized_df = normalized_df.dropna(how="all")
    if normalized_df.empty:
        raise EmptyDatasetError()

    rows = dataframe_to_rows(normalized_df)
    columns = infer_column_profiles(normalized_df)
    dataset = NormalizedDataset(
        source_type=source_type,
        filename=filename,
        columns=columns,
        rows=rows,
        row_count=len(rows),
        column_count=len(columns),
        compact_context="",
    )
    return dataset.model_copy(update={"compact_context": build_compact_context(dataset)})


def _parse_file_content(content: bytes, filename: str | None) -> ParsedInput:
    extension = Path(filename or "").suffix.lower()
    try:
        if extension == ".csv":
            dataframe = pd.read_csv(BytesIO(content))
            return ParsedInput(dataframe=dataframe, source_type="csv", filename=filename)
        if extension in {".xls", ".xlsx"}:
            dataframe = pd.read_excel(BytesIO(content), sheet_name=0)
            return ParsedInput(dataframe=dataframe, source_type="excel", filename=filename)
    except Exception as exc:
        raise DatasetParseError() from exc

    raise UnsupportedFileTypeError()


def _parse_raw_text(raw_text: str) -> pd.DataFrame:
    cleaned_lines = [line.strip() for line in raw_text.splitlines() if line.strip()]
    if not cleaned_lines:
        raise EmptyDatasetError()

    text = "\n".join(cleaned_lines)
    try:
        if "," in text or "\t" in text:
            dataframe = pd.read_csv(StringIO(text), sep=None, engine="python")
            if not dataframe.empty:
                return dataframe
    except Exception:
        pass

    return pd.DataFrame({"text": cleaned_lines})
