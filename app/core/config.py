import os
from dataclasses import dataclass
from functools import lru_cache

from dotenv import load_dotenv


def _get_int_env(name: str, default: int) -> int:
    raw_value = os.getenv(name)
    if raw_value is None:
        return default
    try:
        return int(raw_value)
    except ValueError:
        return default


@dataclass(frozen=True)
class Settings:
    app_name: str
    api_prefix: str
    openai_api_key: str | None
    llm_model: str
    max_upload_size_mb: int
    session_ttl_minutes: int


@lru_cache
def get_settings() -> Settings:
    load_dotenv()
    return Settings(
        app_name=os.getenv("APP_NAME", "AI Dashboard MVP"),
        api_prefix=os.getenv("API_PREFIX", "/api"),
        openai_api_key=os.getenv("OPENAI_API_KEY"),
        llm_model=os.getenv("LLM_MODEL", "gpt-4.1-mini"),
        max_upload_size_mb=_get_int_env("MAX_UPLOAD_SIZE_MB", 10),
        session_ttl_minutes=_get_int_env("SESSION_TTL_MINUTES", 60),
    )
