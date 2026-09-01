> [!IMPORTANT]
> Перед реализацией любых изменений изучи:
> `docs/ai_execution_rules.md` и `docs/execution_plan.md`.
>
> Этот документ является главным источником истины по архитектуре проекта.
# MVP architecture: AI-dashboard from CSV, Excel and text

## Цель

За 48 часов собрать микро-SaaS без авторизации, биллинга, полноценной БД, очередей и сложного RAG. Пользователь загружает CSV, Excel или вставляет сырой текст, получает главный AI-инсайт, короткий narrative, 2-3 графика и может задавать вопросы только по загруженным данным.

Главный архитектурный принцип: один быстрый end-to-end сценарий важнее идеальной платформы. Слои нужны только там, где они помогают быстро менять UI, промпты и обработку данных без превращения кода в один большой handler.

## 1. Минимальный технологический стек

### Backend

- Python 3.11+
- FastAPI
- Pydantic v2
- pandas
- openpyxl
- python-multipart
- OpenAI Python SDK или совместимый LLM client
- python-dotenv
- pytest

Зачем: FastAPI быстро дает typed API и Swagger, Pydantic держит контракты ответа стабильными для UI, pandas закрывает CSV/Excel без ручного парсинга, а отдельный LLM client позволит поменять модель или провайдера без переписывания бизнес-логики.

### Frontend

- React + Vite + TypeScript
- Tailwind CSS
- Recharts
- lucide-react

Зачем: React/Vite быстрее всего для интерактивного SaaS UI, TypeScript защищает контракт backend/frontend, Recharts достаточно хорош для MVP-графиков, Tailwind ускоряет визуальную сборку без отдельной дизайн-системы.

### Storage

- Без полноценной БД.
- Данные текущей сессии хранить в памяти backend через простой `dict[session_id, DatasetSession]`.
- `session_id` возвращать после анализа и держать на клиенте.
- Ограничить TTL сессии, например 60 минут, и размер файла, например 5-10 MB.

Зачем: для MVP не нужна учетная запись и долговременная история. In-memory session проще, чем SQLite/Postgres, но все еще позволяет задавать вопросы по уже загруженному dataset без повторной отправки файла в каждый запрос.

## 2. Структура проекта

```text
app/
  main.py
  core/
    config.py
  api/
    routes/
      health.py
      analyze.py
      ask.py
    schemas.py
  domain/
    models.py
    errors.py
  services/
    ingest_service.py
    profiling_service.py
    analysis_service.py
    chart_service.py
    chat_service.py
    session_store.py
    llm_client.py
  prompts/
    analysis_prompt.py
    ask_prompt.py
  utils/
    dataframe.py
frontend/
  src/
    api/client.ts
    types/dashboard.ts
    state/useDashboardSession.ts
    components/
      UploadPanel.tsx
      Dashboard.tsx
      InsightHero.tsx
      ChartGrid.tsx
      ChartRenderer.tsx
      AskPanel.tsx
      AppShell.tsx
      states.tsx
    App.tsx
    main.tsx
tests/
  test_ingest_service.py
  test_chart_service.py
  test_chat_service.py
docs/
  mvp_ai_dashboard_architecture_48h.md
.env.example
README.md
```

Зачем: структура плоская и понятная. `api` отвечает только за HTTP, `services` за сценарии, `domain` за модели и ошибки, `prompts` за быстрое изменение AI-поведения, `frontend` за UI. Это не enterprise-разделение, а минимальная защита от лапши.

## 3. Разделение frontend/backend

### Backend отвечает за

- прием файла или текста;
- парсинг CSV/Excel/text;
- нормализацию данных;
- профилирование колонок;
- генерацию compact context для LLM;
- выбор и подготовку данных для графиков;
- вызовы LLM;
- проверку, что AI не ссылается на несуществующие колонки;
- хранение текущей dataset-сессии в памяти.

Зачем: все, что связано с данными и AI-ограничениями, должно быть на сервере. Так UI остается тонким, а API key не попадает в браузер.

### Frontend отвечает за

- upload UX;
- отображение loading/empty/error states;
- dashboard layout;
- rendering графиков;
- чат по данным;
- хранение `session_id` и истории чата текущей вкладки.

Зачем: UI можно быстро менять без изменения анализа. История чата на клиенте достаточна для MVP, потому что нет аккаунтов и долговременной памяти.

## 4. Основные domain-модели

### `ColumnProfile`

```python
class ColumnProfile(BaseModel):
    name: str
    type: Literal["number", "category", "date", "text", "unknown"]
    non_null_count: int
    null_count: int
    unique_count: int | None = None
    min_value: float | str | None = None
    max_value: float | str | None = None
    sample_values: list[str] = []
```

Зачем: LLM и chart service должны знать структуру данных, не читая весь dataframe.

### `NormalizedDataset`

```python
class NormalizedDataset(BaseModel):
    source_type: Literal["csv", "excel", "text"]
    filename: str | None = None
    columns: list[ColumnProfile]
    rows: list[dict[str, Any]]
    row_count: int
    column_count: int
    compact_context: str
```

Зачем: единый формат для CSV, Excel и текста. Все следующие слои работают с одной моделью.

### `ChartSpec`

```python
class ChartSpec(BaseModel):
    id: str
    title: str
    type: Literal["bar", "line", "pie"]
    x_key: str
    y_key: str | None = None
    reason: str
```

Зачем: AI может рекомендовать график, но backend валидирует поля и готовит данные. UI получает уже безопасную спецификацию.

### `PreparedChart`

```python
class PreparedChart(BaseModel):
    spec: ChartSpec
    data: list[dict[str, Any]]
```

Зачем: frontend не должен агрегировать данные. Он только рисует.

### `AIAnalysis`

```python
class AIAnalysis(BaseModel):
    headline: str
    narrative: str
    key_observations: list[str]
    charts: list[ChartSpec]
```

Зачем: фиксированный JSON-контракт не дает LLM ломать UI произвольным текстом.

### `DatasetSession`

```python
class DatasetSession(BaseModel):
    id: str
    dataset: NormalizedDataset
    analysis: AIAnalysis
    charts: list[PreparedChart]
    created_at: datetime
```

Зачем: `/ask` должен ссылаться на уже загруженные данные по `session_id`, а не заставлять пользователя повторно отправлять файл.

## 5. API endpoints

### `GET /api/health`

Возвращает:

```json
{ "status": "ok" }
```

Зачем: простая проверка запуска backend и деплоя.

### `POST /api/analyze`

Принимает `multipart/form-data`:

- `file`: optional CSV/XLS/XLSX;
- `raw_text`: optional string.

Возвращает:

```json
{
  "session_id": "uuid",
  "dataset": {
    "source_type": "csv",
    "filename": "sales.csv",
    "row_count": 120,
    "column_count": 6,
    "columns": []
  },
  "analysis": {
    "headline": "Revenue is concentrated in two channels",
    "narrative": "Short explanation...",
    "key_observations": [],
    "charts": []
  },
  "charts": []
}
```

Зачем: один endpoint делает полный первый сценарий upload -> dashboard. Это быстрее и проще, чем дробить MVP на upload job, analysis job и polling.

### `POST /api/ask`

Принимает JSON:

```json
{
  "session_id": "uuid",
  "question": "Which segment has the highest revenue?"
}
```

Возвращает:

```json
{
  "answer": "Enterprise has the highest revenue in the uploaded dataset.",
  "confidence": "high",
  "used_columns": ["segment", "revenue"]
}
```

Если ответа нет в dataset:

```json
{
  "answer": "I cannot answer this from the uploaded dataset.",
  "confidence": "none",
  "used_columns": []
}
```

Зачем: отдельный endpoint для вопросов упрощает UI и позволяет переиспользовать сохраненную dataset-сессию.

## 6. Сервисный слой

### `ingest_service.py`

Функции:

- `parse_input(file, raw_text) -> pd.DataFrame`
- `validate_file(file) -> None`
- `normalize_dataframe(df, source_type, filename) -> NormalizedDataset`

Зачем: вся грязная работа с входными форматами собрана в одном месте.

### `profiling_service.py`

Функции:

- `infer_column_profiles(df) -> list[ColumnProfile]`
- `build_compact_context(dataset) -> str`

Зачем: compact context нужен, чтобы не отправлять в LLM весь файл. Для MVP достаточно схемы, summary статистики и первых N строк.

### `analysis_service.py`

Функции:

- `analyze_dataset(dataset) -> AIAnalysis`
- `parse_analysis_json(raw) -> AIAnalysis`
- `validate_analysis(dataset, analysis) -> AIAnalysis`
- `fallback_analysis(dataset) -> AIAnalysis`

Зачем: LLM нестабилен. Этот слой держит строгий JSON parsing, fallback и запрет на несуществующие колонки.

### `chart_service.py`

Функции:

- `recommend_fallback_charts(dataset) -> list[ChartSpec]`
- `prepare_charts(dataset, specs) -> list[PreparedChart]`
- `aggregate_for_bar(df, x_key, y_key)`
- `aggregate_for_line(df, x_key, y_key)`
- `aggregate_for_pie(df, x_key, y_key)`

Зачем: AI выбирает смысл графиков, но backend отвечает за корректные данные. Если AI вернул плохой chart spec, deterministic fallback все равно покажет 1-2 графика.

### `chat_service.py`

Функции:

- `answer_question(session, question) -> AskResponse`
- `build_unknown_answer() -> AskResponse`
- `validate_used_columns(dataset, used_columns) -> bool`

Зачем: главный guardrail продукта находится здесь. Prompt должен запрещать внешние знания, а код должен проверять хотя бы используемые колонки и формат ответа.

### `session_store.py`

Функции:

- `create_session(dataset, analysis, charts) -> DatasetSession`
- `get_session(session_id) -> DatasetSession`
- `cleanup_expired_sessions() -> None`

Зачем: простой in-memory store заменяет БД. TTL не дает памяти расти бесконечно.

### `llm_client.py`

Функции:

- `complete_json(system_prompt, user_prompt) -> dict`

Зачем: все настройки модели, timeout, retries и parsing raw response изолированы от domain-кода.

## 7. Обработка ошибок

### Domain errors

```python
class AppError(Exception):
    code: str
    message: str
    status_code: int

class UnsupportedFileTypeError(AppError): ...
class FileTooLargeError(AppError): ...
class EmptyDatasetError(AppError): ...
class DatasetParseError(AppError): ...
class LLMUnavailableError(AppError): ...
class InvalidLLMResponseError(AppError): ...
class SessionNotFoundError(AppError): ...
```

Зачем: UI должен получать предсказуемые ошибки, а backend не должен размазывать `HTTPException` по всем сервисам.

### Error response contract

```json
{
  "error": {
    "code": "unsupported_file_type",
    "message": "Upload CSV, XLSX, XLS or paste raw text."
  }
}
```

Зачем: frontend сможет показывать нормальные состояния ошибок без парсинга случайных traceback.

### Минимальная карта ошибок

| Ситуация | HTTP | Code | UI |
|---|---:|---|---|
| Нет файла и текста | 400 | `missing_input` | Попросить загрузить файл или вставить текст |
| Неподдерживаемый формат | 400 | `unsupported_file_type` | Показать допустимые форматы |
| Файл слишком большой | 413 | `file_too_large` | Попросить уменьшить файл |
| Пустой dataset | 422 | `empty_dataset` | Попросить другой файл |
| Ошибка парсинга | 422 | `parse_error` | Показать retry и подсказку |
| LLM timeout/error | 502 | `llm_unavailable` | Показать fallback или retry |
| Сессия не найдена | 404 | `session_not_found` | Попросить загрузить данные заново |

Зачем: этих ошибок достаточно для MVP, но они покрывают основные демонстрационные провалы.

## 8. AI guardrails без сложного RAG

### Что отправлять в LLM

- список колонок и типов;
- row count и column count;
- summary по числовым колонкам;
- top values по категориальным колонкам;
- date range по датам;
- первые 20-50 строк как sample;
- для маленьких dataset можно отправить все строки в JSON.

Зачем: это не vector RAG, но достаточно для вопросов и narrative в MVP.

### Prompt rules

- отвечать только по переданному dataset context;
- если ответа нет, вернуть стандартную фразу;
- не придумывать колонки, метрики, валюты, даты и сегменты;
- возвращать только JSON по заданной схеме;
- для каждого вывода желательно указывать использованные колонки.

Зачем: промпт снижает риск галлюцинаций, а JSON-схема делает ответ машинно проверяемым.

### Code validation

- отклонять chart specs с несуществующими `x_key`/`y_key`;
- ограничивать типы графиков только `bar`, `line`, `pie`;
- ограничивать narrative длиной;
- если JSON невалидный, использовать deterministic fallback;
- для `/ask` проверять `used_columns`.

Зачем: полагаться только на инструкцию модели недостаточно. Минимальная валидация в коде дешевле, чем разбирать сломанный UI перед демо.

## 9. UI MVP

Первый экран должен быть приложением, не лендингом:

- верхняя панель с названием продукта и статусом dataset;
- слева upload panel: dropzone, file picker, textarea, кнопка Analyze;
- справа или ниже после анализа: insight hero, 2-3 chart cards, ask panel;
- состояния: empty, loading skeleton, error, ready.

Зачем: пользователь сразу попадает в рабочий продукт. SaaS-ощущение создается чистым layout, хорошими состояниями и аккуратными карточками графиков, а не маркетинговым hero.

## 10. Последовательность реализации на 48 часов

План ниже сохраняет архитектуру из этого документа: FastAPI backend, React/Vite frontend, in-memory `session_store`, отдельные `services`, отдельные `prompts`, без auth, billing, полноценной БД, очередей и vector RAG.

Для демонстрации продукта обязательны блоки 1-5. Если времени мало, блоки 6-7 можно сократить до минимальной ручной проверки и короткого README.

### День 1: рабочий end-to-end

#### Блок 1. Backend foundation и контракты API

Цель: поднять минимальный FastAPI backend с понятными typed-контрактами и единым форматом ошибок.

Подзадачи:

1. Создать `app/main.py`, подключить routes и `GET /api/health`.
   - Зависит от: нет.
   - До начала: выбран Python environment и установлены базовые зависимости.
   - Готово, когда: backend запускается, `/api/health` возвращает `{ "status": "ok" }`.
2. Создать `app/core/config.py` для env-настроек: `OPENAI_API_KEY`, `LLM_MODEL`, file size limit, session TTL.
   - Зависит от: шага 1.
   - До начала: понятно, какие env нужны из архитектуры.
   - Готово, когда: настройки читаются из env и имеют безопасные defaults для локального запуска.
3. Описать API schemas в `app/api/schemas.py`: `AnalyzeResponse`, `AskRequest`, `AskResponse`, error response.
   - Зависит от: шага 1.
   - До начала: зафиксированы response contracts из раздела 5.
   - Готово, когда: routes могут импортировать схемы без циклических зависимостей.
4. Описать `AppError` и наследников в `app/domain/errors.py`, добавить global error handler.
   - Зависит от: шага 3.
   - До начала: есть список ошибок из раздела 7.
   - Готово, когда: domain error превращается в JSON `{ "error": { "code", "message" } }`.

Результат блока: backend skeleton готов, ошибки и контракты больше не размазываются по handler-ам.

Обязателен для демо: да.

#### Блок 2. Ingestion, domain-модели и compact context

Цель: принимать CSV, Excel и сырой текст, приводить их к `NormalizedDataset` и готовить компактный контекст для AI.

Подзадачи:

1. Создать domain-модели `ColumnProfile`, `NormalizedDataset`, `ChartSpec`, `PreparedChart`, `AIAnalysis`, `DatasetSession`.
   - Зависит от: блока 1.
   - До начала: есть Pydantic и структура `app/domain/models.py`.
   - Готово, когда: модели покрывают поля из раздела 4 и используются в schemas/services.
2. Реализовать `ingest_service.validate_file()` и ограничения формата/размера.
   - Зависит от: шага 1.
   - До начала: определены допустимые расширения `.csv`, `.xls`, `.xlsx`.
   - Готово, когда: неподдерживаемый или слишком большой файл возвращает controlled error.
3. Реализовать `parse_input()` для CSV, Excel первого листа и raw text.
   - Зависит от: шага 2.
   - До начала: установлены `pandas`, `openpyxl`, `python-multipart`.
   - Готово, когда: каждый входной формат превращается в `pd.DataFrame`.
4. Реализовать `profiling_service.infer_column_profiles()` и `build_compact_context()`.
   - Зависит от: шага 3.
   - До начала: есть dataframe с нормализованными колонками.
   - Готово, когда: для dataset есть типы колонок, row/column count, samples и compact context.
5. Реализовать `normalize_dataframe()` и минимальные unit tests на CSV, Excel, raw text, empty dataset.
   - Зависит от: шага 4.
   - До начала: есть domain-модели и ошибки.
   - Готово, когда: сервис возвращает `NormalizedDataset`, а плохие входы не падают traceback.

Результат блока: backend умеет получить данные и подготовить их для анализа без LLM.

Обязателен для демо: да.

#### Блок 3. `/api/analyze`, session store и deterministic dashboard fallback

Цель: сделать первый полный backend-сценарий upload -> normalized dataset -> analysis response -> session.

Подзадачи:

1. Реализовать `session_store.py`: `create_session()`, `get_session()`, `cleanup_expired_sessions()`.
   - Зависит от: блока 2.
   - До начала: есть `DatasetSession`.
   - Готово, когда: созданная сессия доступна по `session_id` до TTL.
2. Реализовать `chart_service.recommend_fallback_charts()` и подготовку первого `bar` chart.
   - Зависит от: блока 2.
   - До начала: есть `ColumnProfile` и normalized rows.
   - Готово, когда: для dataset с category+number можно получить `PreparedChart`.
3. Реализовать `analysis_service.fallback_analysis()`.
   - Зависит от: блока 2.
   - До начала: есть dataset profile и compact context.
   - Готово, когда: без LLM возвращаются headline, narrative, observations и chart specs.
4. Реализовать `POST /api/analyze` на fallback-логике.
   - Зависит от: шагов 1-3.
   - До начала: есть schemas и error handler из блока 1.
   - Готово, когда: файл или текст возвращает `session_id`, dataset summary, analysis и charts.

Результат блока: продукт уже демонстрируем с deterministic анализом и одним графиком, даже без API key.

Обязателен для демо: да.

#### Блок 4. Frontend shell, upload UX и первый dashboard

Цель: собрать рабочий UI-путь upload -> analyze -> insight -> chart.

Подзадачи:

1. Создать React/Vite frontend shell: `AppShell`, `App`, базовые стили Tailwind.
   - Зависит от: блока 1.
   - До начала: выбран frontend stack из раздела 1.
   - Готово, когда: frontend запускается и показывает рабочий экран приложения, не лендинг.
2. Создать `api/client.ts` и типы `dashboard.ts` под backend response.
   - Зависит от: блока 3.
   - До начала: стабилен контракт `/api/analyze`.
   - Готово, когда: клиент умеет отправлять `multipart/form-data` и читать typed response.
3. Реализовать `UploadPanel`: file picker, dropzone, raw text, кнопка Analyze.
   - Зависит от: шага 2.
   - До начала: известны ограничения форматов.
   - Готово, когда: пользователь может выбрать файл или вставить текст и запустить анализ.
4. Реализовать `useDashboardSession`: loading, error, ready, current session.
   - Зависит от: шага 2.
   - До начала: есть API client.
   - Готово, когда: UI не ломается при успехе и ошибке `/api/analyze`.
5. Реализовать `InsightHero`, `ChartGrid`, `ChartRenderer` для первого `bar` chart.
   - Зависит от: шагов 2-4.
   - До начала: backend возвращает `PreparedChart`.
   - Готово, когда: после анализа видны headline, narrative и график.

Результат блока: есть первый end-to-end продуктовый сценарий в браузере.

Обязателен для демо: да.

#### Блок 5. LLM analysis с JSON schema и guardrails

Цель: заменить fallback как основной источник narrative на LLM, сохранив fallback при сбоях.

Подзадачи:

1. Реализовать `llm_client.complete_json()` с timeout и чтением env.
   - Зависит от: блока 1.
   - До начала: есть `config.py` и переменные окружения.
   - Готово, когда: клиент возвращает parsed JSON или controlled LLM error.
2. Создать `prompts/analysis_prompt.py` с system prompt и builder по `compact_context`.
   - Зависит от: блока 2.
   - До начала: есть формат compact context.
   - Готово, когда: prompt требует JSON, запрещает внешние факты и ограничивает ответ dataset.
3. Реализовать `analysis_service.analyze_dataset()`, `parse_analysis_json()`, `validate_analysis()`.
   - Зависит от: шагов 1-2 и блока 3.
   - До начала: есть `AIAnalysis`, `ChartSpec`, fallback.
   - Готово, когда: валидный LLM JSON используется, невалидный JSON уходит в fallback.
4. Подключить LLM analysis в `/api/analyze`.
   - Зависит от: шага 3.
   - До начала: fallback endpoint уже работает.
   - Готово, когда: при наличии API key dashboard получает AI headline/narrative, а без успешного LLM не ломается.

Результат блока: основной promise продукта работает через AI, но остается надежный fallback.

Обязателен для демо: да, если нужно показать именно AI narrative. Без API key демо возможно на fallback, но слабее.

### День 2: качество MVP

#### Блок 6. AI-графики, `/api/ask` и чат по данным

Цель: закрыть два ключевых требования MVP: 2-3 подходящих графика и вопросы только по загруженному dataset.

Подзадачи:

1. Расширить `chart_service.prepare_charts()` для `bar`, `line`, `pie`.
   - Зависит от: блока 5.
   - До начала: AI или fallback возвращает `ChartSpec`.
   - Готово, когда: backend возвращает 2-3 `PreparedChart`, а плохие specs заменяются fallback specs.
2. Обновить `ChartRenderer` под `bar`, `line`, `pie`.
   - Зависит от: шага 1 и блока 4.
   - До начала: backend response содержит данные для всех типов графиков.
   - Готово, когда: UI корректно рисует все разрешенные типы.
3. Создать `prompts/ask_prompt.py` и `chat_service.answer_question()`.
   - Зависит от: блока 5.
   - До начала: есть `session_store`, `compact_context`, `llm_client`.
   - Готово, когда: service возвращает `answer`, `confidence`, `used_columns`.
4. Реализовать `POST /api/ask`.
   - Зависит от: шага 3.
   - До начала: есть `AskRequest`, `AskResponse`, `SessionNotFoundError`.
   - Готово, когда: вопрос по `session_id` получает ответ, отсутствующая сессия возвращает controlled error.
5. Реализовать `AskPanel` и client-side chat history.
   - Зависит от: шага 4 и блока 4.
   - До начала: есть API client и текущий `session_id`.
   - Готово, когда: пользователь задает вопросы, видит историю текущей вкладки, а вопрос вне dataset получает нормальный fallback-ответ.

Результат блока: dashboard показывает несколько графиков и поддерживает Q&A по данным.

Обязателен для демо: да.

#### Блок 7. Стабилизация, SaaS UI polish и финальная проверка

Цель: довести MVP до состояния, которое можно показывать без объяснений разработчика рядом.

Подзадачи:

1. Довести empty/loading/error states для upload, analyze, charts и ask.
   - Зависит от: блоков 4 и 6.
   - До начала: основные UI-компоненты уже есть.
   - Готово, когда: плохой файл, пустой dataset, LLM error и вопрос без ответа не ломают страницу.
2. Визуально отполировать layout как современный SaaS-инструмент.
   - Зависит от: шага 1.
   - До начала: готов основной функционал.
   - Готово, когда: первый экран выглядит как рабочее приложение: аккуратная панель загрузки, insight hero, сетка графиков, ask panel.
3. Добавить `.env.example` без реальных ключей.
   - Зависит от: блоков 1 и 5.
   - До начала: известны все env-переменные.
   - Готово, когда: новый разработчик видит, какие настройки нужны.
4. Обновить README с запуском, форматами входа, MVP-ограничениями и примерами вопросов.
   - Зависит от: всех обязательных блоков.
   - До начала: понятен фактический способ запуска backend/frontend.
   - Готово, когда: проект можно запустить по README.
5. Прогнать ручную проверку: CSV, Excel, raw text, плохой файл, пустые данные, вопрос вне dataset.
   - Зависит от: шагов 1-4.
   - До начала: backend и frontend запускаются локально.
   - Готово, когда: все сценарии либо работают, либо показывают ожидаемое UI-состояние ошибки.

Результат блока: MVP готов к демонстрации и локальному запуску другим человеком.

Обязателен для демо: частично. Минимально нужны error states для основных провалов и ручная проверка happy path; README и глубокую полировку можно сократить, если время кончается.

### Минимальный demo-scope, если времени мало

Если остается мало времени, резать нужно не архитектуру, а глубину реализации:

1. Обязательно оставить блоки 1-4: без них нет рабочего продукта.
2. Оставить блок 5 хотя бы для headline/narrative через LLM и fallback при ошибке.
3. В блоке 6 оставить минимум: 2 графика вместо 3, `/api/ask`, AskPanel и fallback "I cannot answer this from the uploaded dataset."
4. В блоке 7 оставить минимум: базовые error states и ручная проверка CSV happy path + вопрос вне dataset.
5. Excel можно оставить простым: первый лист, без сложной поддержки merged cells, формул и нестандартных таблиц.

Такой demo-scope все еще выполняет главное обещание MVP: upload -> AI insight -> charts -> ask по dataset.

## 11. Что намеренно не делать в MVP

- Не делать регистрацию и login.
- Не делать billing.
- Не подключать Postgres.
- Не делать multi-tenant архитектуру.
- Не строить vector database и embeddings.
- Не делать background jobs.
- Не делать streaming ответов.
- Не делать export PDF/PNG.
- Не делать сложный drag-and-drop dashboard builder.
- Не поддерживать все странные варианты Excel и CSV.

Зачем: каждый пункт выше может быть полезен позже, но за 48 часов он забирает время у главного сценария: upload -> insight -> charts -> ask.

## 12. Минимальные критерии готовности

- Можно загрузить CSV, XLS/XLSX или вставить текст.
- Backend возвращает нормализованный dataset summary.
- AI возвращает headline и narrative.
- UI показывает 2-3 графика.
- Пользователь может задать вопрос по dataset.
- При вопросе вне данных AI честно отвечает, что не может ответить.
- Ошибки файла, парсинга и LLM не ломают страницу.
- Промпты лежат отдельно и быстро редактируются.
- Проект запускается по README.
