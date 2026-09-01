from dataclasses import dataclass


@dataclass
class AppError(Exception):
    code: str
    message: str
    status_code: int


class MissingInputError(AppError):
    def __init__(self) -> None:
        super().__init__(
            code="missing_input",
            message="Upload CSV, XLSX, XLS or paste raw text.",
            status_code=400,
        )


class UnsupportedFileTypeError(AppError):
    def __init__(self) -> None:
        super().__init__(
            code="unsupported_file_type",
            message="Upload CSV, XLSX, XLS or paste raw text.",
            status_code=400,
        )


class FileTooLargeError(AppError):
    def __init__(self) -> None:
        super().__init__(
            code="file_too_large",
            message="The uploaded file is too large for this MVP.",
            status_code=413,
        )


class EmptyDatasetError(AppError):
    def __init__(self) -> None:
        super().__init__(
            code="empty_dataset",
            message="The dataset is empty. Upload a file or paste text with data.",
            status_code=422,
        )


class DatasetParseError(AppError):
    def __init__(self) -> None:
        super().__init__(
            code="parse_error",
            message="The dataset could not be parsed.",
            status_code=422,
        )


class LLMUnavailableError(AppError):
    def __init__(self) -> None:
        super().__init__(
            code="llm_unavailable",
            message="The AI service is temporarily unavailable.",
            status_code=502,
        )


class InvalidLLMResponseError(AppError):
    def __init__(self) -> None:
        super().__init__(
            code="invalid_llm_response",
            message="The AI response was invalid.",
            status_code=502,
        )


class SessionNotFoundError(AppError):
    def __init__(self) -> None:
        super().__init__(
            code="session_not_found",
            message="Dataset session was not found. Upload the data again.",
            status_code=404,
        )
