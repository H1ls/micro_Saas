> [!IMPORTANT]
> Перед началом любого блока изучи:
> `docs/mvp_ai_dashboard_architecture_48h.md`
> и `docs/ai_execution_rules.md`.
>
> Не переходить к следующему блоку до завершения, проверки и commit текущего.
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
