from io import BytesIO

import pandas as pd
import pytest

from app.domain.errors import EmptyDatasetError, FileTooLargeError, UnsupportedFileTypeError
from app.services.ingest_service import normalize_dataframe, parse_input, validate_file


def test_parse_csv_file_and_normalize_dataset() -> None:
    parsed = parse_input(
        file=BytesIO(b"segment,revenue\nSMB,100\nEnterprise,250\n"),
        filename="sales.csv",
    )
    dataset = normalize_dataframe(parsed.dataframe, parsed.source_type, parsed.filename)

    assert dataset.source_type == "csv"
    assert dataset.filename == "sales.csv"
    assert dataset.row_count == 2
    assert dataset.column_count == 2
    assert {column.name: column.type for column in dataset.columns} == {
        "segment": "category",
        "revenue": "number",
    }
    assert "sample_rows" in dataset.compact_context


def test_parse_excel_first_sheet_and_normalize_dataset() -> None:
    buffer = BytesIO()
    pd.DataFrame({"date": ["2026-01-01", "2026-01-02"], "value": [10, 20]}).to_excel(
        buffer,
        index=False,
    )
    buffer.seek(0)

    parsed = parse_input(file=buffer, filename="metrics.xlsx")
    dataset = normalize_dataframe(parsed.dataframe, parsed.source_type, parsed.filename)

    assert dataset.source_type == "excel"
    assert dataset.row_count == 2
    assert {column.name: column.type for column in dataset.columns}["value"] == "number"


def test_parse_raw_text_as_text_dataset() -> None:
    parsed = parse_input(raw_text="First observation\n\nSecond observation")
    dataset = normalize_dataframe(parsed.dataframe, parsed.source_type, parsed.filename)

    assert dataset.source_type == "text"
    assert dataset.row_count == 2
    assert dataset.columns[0].name == "text"


def test_parse_raw_table_text_as_dataframe() -> None:
    parsed = parse_input(raw_text="name,revenue\nA,10\nB,20")
    dataset = normalize_dataframe(parsed.dataframe, parsed.source_type, parsed.filename)

    assert dataset.source_type == "text"
    assert dataset.column_count == 2
    assert {column.name: column.type for column in dataset.columns}["revenue"] == "number"


def test_validate_file_rejects_unsupported_extension() -> None:
    with pytest.raises(UnsupportedFileTypeError):
        validate_file("data.json", b"{}")


def test_validate_file_rejects_too_large_file(monkeypatch: pytest.MonkeyPatch) -> None:
    from app.core import config

    config.get_settings.cache_clear()
    monkeypatch.setenv("MAX_UPLOAD_SIZE_MB", "0")

    with pytest.raises(FileTooLargeError):
        validate_file("data.csv", b"x")

    config.get_settings.cache_clear()


def test_normalize_dataframe_rejects_empty_dataset() -> None:
    with pytest.raises(EmptyDatasetError):
        normalize_dataframe(pd.DataFrame(), "csv", "empty.csv")
