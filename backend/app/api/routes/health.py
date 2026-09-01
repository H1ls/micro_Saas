from fastapi import APIRouter

from app.api.schemas import HealthResponse

router = APIRouter(prefix="/health", tags=["health"])


@router.get("", response_model=HealthResponse)
def health() -> HealthResponse:
    """Возвращает простой health-check для локального запуска и smoke tests."""

    return HealthResponse()
