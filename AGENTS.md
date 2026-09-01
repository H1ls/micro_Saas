# AGENTS.md

## Назначение проекта

Micro-SaaS MVP превращает CSV, Excel или сырой текст в AI-dashboard.
Основной пользовательский поток: загрузка данных -> нормализация dataset -> insight/narrative -> 2-3 графика -> вопросы по загруженному dataset.

## Главные источники истины

Перед изменениями сначала читай:

1. `docs/mvp_ai_dashboard_architecture_48h.md`
2. `docs/execution_plan.md`
3. `docs/ai_execution_rules.md`
4. `docs/execution_status.md`

Если документация и код расходятся, не выдумывай отсутствующие компоненты.
Сначала ориентируйся на фактическое состояние кода, затем явно укажи расхождение.

## MVP-ограничения

Не добавлять без отдельного решения:

- авторизацию;
- billing;
- полноценную БД;
- Redis, очереди, background workers;
- vector database, embeddings, сложный RAG;
- multi-tenant архитектуру;
- repository pattern и сложные generic abstractions;
- export PDF/PNG и dashboard builder.

## Фактическая карта проекта

Backend лежит в `app/`.
Frontend лежит в `frontend/`.
Тесты backend лежат в `tests/`.
Документы и планы лежат в `docs/`.
Backend-зависимости описаны в `requirements.txt`.
Frontend-зависимости описаны в `frontend/package.json`.

## Backend

`app/main.py` создает FastAPI app, подключает routers и global error handlers.
API routes находятся в `app/api/routes/`.
API schemas находятся в `app/api/schemas.py`.
Domain models и controlled errors находятся в `app/domain/`.
Use-case логика находится в `app/services/`.
LLM prompts находятся в `app/prompts/`.
Мелкие dataframe helpers находятся в `app/utils/`.

Routes должны оставаться тонкими.
Не размещай в routes CSV/Excel parsing, dataframe aggregation, prompt logic, chart calculations или бизнес-логику.

## Backend Services

`ingest_service.py` отвечает за file/raw text parsing и нормализацию входа.
`profiling_service.py` строит профили колонок и compact context.
`analysis_service.py` управляет LLM analysis, validation и deterministic fallback.
`chart_service.py` выбирает и готовит данные для bar/line/pie charts.
`chat_service.py` отвечает на вопросы по session dataset и применяет guardrails.
`session_store.py` хранит dataset sessions in-memory с TTL.
`llm_client.py` изолирует вызов OpenAI-compatible local/remote LLM.

Перед созданием нового service проверь, не решается ли задача расширением существующего.

## Frontend

Frontend построен на React + Vite + TypeScript + Tailwind + Recharts.
API client находится в `frontend/src/api/client.ts`.
Типы backend response находятся в `frontend/src/types/dashboard.ts`.
Состояние dashboard находится в `frontend/src/state/useDashboardSession.ts`.
UI components находятся в `frontend/src/components/`.

Frontend отвечает за UI, interaction, loading/empty/error states и rendering.
Frontend не должен самостоятельно считать бизнес-агрегаты dataset, если backend уже возвращает prepared chart data.

## Данные и AI Guardrails

LLM не является доверенным источником данных.
LLM может формулировать headline, narrative, observations и рекомендовать chart specs.
Числовые chart data должны готовиться backend-кодом.
Ответы `/api/ask` должны опираться только на загруженный dataset.
Если ответа нет в dataset, возвращай стандартный fallback, а не выдуманный ответ.

Structured LLM output должен проходить:

```text
LLM -> JSON -> Pydantic validation -> business validation -> application
```

При ошибке LLM, невалидном JSON или провале validation используй deterministic fallback.

## Ошибки

Controlled errors должны проходить через `AppError` и единый contract:

```json
{ "error": { "code": "...", "message": "..." } }
```

Не отдавай пользователю traceback, env values, API keys или внутренние exception details.
Не размазывай `HTTPException` по domain/service слоям.

## Запрет на дублирование

Не создавай файлы вида `analysis_service_new.py`, `models2.py`, `helpers_new.py`, `temp_service.py`.
Не оставляй старую и новую реализацию одной логики одновременно.
Не дублируй models, schemas, services, helpers, components, routes и config.
Сначала ищи существующую реализацию через `rg`, затем меняй минимально нужное место.

## Проверки

Для backend обычно используй:

```powershell
.venv\Scripts\python.exe -m compileall app tests
.venv\Scripts\python.exe -m pytest tests -q
```

Для frontend обычно используй:

```powershell
cd frontend
npm.cmd run build
```

Vite dev server проксирует `/api` на `http://127.0.0.1:8000`.
Backend запускается командой:

```powershell
.venv\Scripts\python.exe -m uvicorn app.main:app --reload
```

## Git и статус

Перед блоком проверяй `docs/execution_status.md`.
Если Block N уже `DONE`, не выполняй его повторно и не меняй код автоматически.
После завершения блока обновляй статус, фиксируй проверки и делай один осмысленный commit.
Не добавляй в commit `.env`, secrets, debug dumps, temporary files и unrelated изменения.
