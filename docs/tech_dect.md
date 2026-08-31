# Technical Decision Document: AI Dashboard MVP

Документ фиксирует технические решения проекта на базе `docs/mvp_ai_dashboard_architecture_48h.md` и `docs/execution_plan.md`. Он не заменяет архитектуру, а кратко собирает принятые решения и следующий слой улучшений.

## 1. Цель продукта

За 48 часов собрать MVP микро-SaaS: пользователь загружает CSV, Excel или вставляет сырой текст, получает AI narrative, 2-3 графика и может задавать вопросы только по загруженному dataset.

Главный принцип: сначала рабочий end-to-end продукт, затем улучшения. Архитектура должна оставаться простой: без auth, billing, полноценной БД, очередей, vector RAG и лишних абстракций.

## 2. Технологический стек

### Backend

- Python 3.11+
- FastAPI
- Pydantic v2
- pandas
- openpyxl
- python-multipart
- OpenAI-compatible LLM client
- python-dotenv
- pytest

Решение нужно для быстрого typed API, стабильных контрактов, простого ingestion CSV/Excel/text и изоляции LLM-провайдера в одном сервисе.

### Frontend

- React
- Vite
- TypeScript
- Tailwind CSS
- Recharts
- lucide-react

Решение нужно для быстрого SaaS UI, typed backend/frontend контракта и достаточного набора графиков без построения собственной charting-системы.

### Storage

- Без полноценной БД.
- Dataset session хранится в памяти backend через `session_store`.
- `session_id` возвращается из `/api/analyze` и используется в `/api/ask`.
- TTL ограничивает рост памяти.

Решение достаточно для MVP без аккаунтов и долговременной истории.

## 3. Границы frontend/backend

### Backend отвечает за

- прием файла или raw text;
- parsing CSV/Excel/text;
- нормализацию dataset;
- profiling колонок;
- compact context для LLM;
- LLM вызовы;
- validation AI JSON;
- подготовку chart data;
- хранение session;
- guardrails для ответов только по dataset.

### Frontend отвечает за

- upload UX;
- отображение empty/loading/error/ready states;
- dashboard layout;
- rendering графиков;
- AskPanel;
- локальную историю чата текущей вкладки.

Frontend не должен вычислять бизнес-агрегации dataset. Он получает готовые `PreparedChart` от backend и только рисует их.

## 4. Domain-модели

Основные модели:

- `ColumnProfile` — описание колонки, тип, null/non-null counts, samples.
- `NormalizedDataset` — единый формат CSV/Excel/text.
- `ChartSpec` — безопасная спецификация графика от AI или fallback.
- `PreparedChart` — chart spec плюс готовые данные для Recharts.
- `AIAnalysis` — headline, narrative, observations, chart specs.
- `DatasetSession` — dataset, analysis, charts и время создания.

Модели нужны для стабильного API-контракта и для того, чтобы LLM не управлял UI напрямую произвольным текстом.

## 5. API

### `GET /api/health`

Проверка запуска backend.

### `POST /api/analyze`

Принимает:

- `file`: CSV/XLS/XLSX;
- `raw_text`: string.

Возвращает:

- `session_id`;
- dataset summary;
- `AIAnalysis`;
- prepared charts.

Основной путь после Block 5: LLM -> JSON -> Pydantic validation -> business validation -> application. При сбое используется deterministic fallback из Block 3.

### `POST /api/ask`

Принимает:

- `session_id`;
- `question`.

Возвращает:

- `answer`;
- `confidence`;
- `used_columns`.

Если ответа нет в dataset, возвращается стандартный fallback:

```text
I cannot answer this from the uploaded dataset.
```

## 6. Сервисный слой

- `ingest_service.py` — file validation, parsing, normalization.
- `profiling_service.py` — column profiles и compact context.
- `analysis_service.py` — LLM analysis, JSON parsing, validation, fallback.
- `chart_service.py` — fallback chart specs и подготовка `bar`, `line`, `pie`.
- `chat_service.py` — answer question, validate used columns, unknown answer fallback.
- `session_store.py` — create/get/cleanup sessions.
- `llm_client.py` — OpenAI-compatible JSON completion.

Сервисы нужны, чтобы routes оставались тонкими, а prompts, AI validation и data processing не смешивались в одном handler.

## 7. Error handling

Все контролируемые ошибки проходят через `AppError` и единый JSON-контракт:

```json
{
  "error": {
    "code": "unsupported_file_type",
    "message": "Upload CSV, XLSX, XLS or paste raw text."
  }
}
```

Ключевые ошибки:

- `missing_input`;
- `unsupported_file_type`;
- `file_too_large`;
- `empty_dataset`;
- `parse_error`;
- `llm_unavailable`;
- `invalid_llm_response`;
- `session_not_found`.

UI должен показывать понятное состояние ошибки, а не traceback или внутренние детали backend.

## 8. AI guardrails

LLM не считается доверенным источником данных.

Обязательный pipeline:

```text
LLM
 -> JSON
 -> Pydantic validation
 -> business validation
 -> application
```

Правила:

- не использовать внешние факты;
- не придумывать колонки, значения, валюты, даты, категории;
- chart specs должны ссылаться только на существующие колонки;
- допустимые chart types: `bar`, `line`, `pie`;
- `/ask` должен проверять `used_columns`;
- при невалидном LLM response используется fallback.

## 9. Execution plan status

План реализации закрыт по блокам:

- Block 1 — backend foundation и API contracts.
- Block 2 — ingestion, domain models, compact context.
- Block 3 — `/api/analyze`, session store, deterministic fallback.
- Block 4 — frontend shell, upload UX, первый dashboard.
- Block 5 — LLM analysis с JSON schema и guardrails.
- Block 6 — AI charts, `/api/ask`, AskPanel.
- Block 7 — stabilization, UI polish, `.env.example`, README, финальная проверка.

Перед новой задачей нужно смотреть `docs/execution_status.md`, чтобы не повторять уже завершенные блоки.

## 10. Следующий UX/качество слой

Следующие улучшения не меняют базовую архитектуру. Их нужно делать отдельными scoped задачами поверх готового MVP.

### 10.1 Русские docstrings под классами и сложными функциями

Добавить русскоязычные docstrings к:

- domain-моделям;
- public service functions;
- сложным validation/fallback функциям;
- prompt builders;
- API route handlers, если поведение не очевидно.

Цель: ускорить поддержку проекта и снизить риск неправильных изменений AI-разработчиком.

Правило: docstring должен объяснять назначение, входы, выходы и важные guardrails. Не добавлять комментарии к очевидному коду.

### 10.2 Перевод сайта на русский

Перевести пользовательский UI на русский:

- upload panel;
- buttons;
- empty/loading/error states;
- chart empty state;
- insight labels;
- AskPanel;
- validation/error copy.

Цель: продукт должен выглядеть цельно для русскоязычного пользователя.

Правило: переводить только visible UI text. API-контракты, domain names, env variables и внутренние technical identifiers не переводить.

## 11. Что не добавлять без отдельного решения

- auth;
- billing;
- persistent database;
- Redis/Celery/queues;
- vector RAG;
- embeddings;
- background jobs;
- export PDF/PNG;
- dashboard builder;
- сложную i18n-систему до явной необходимости.

Для перевода UI на русский достаточно прямого изменения строк или маленького локального словаря, если это реально уменьшит дублирование.
