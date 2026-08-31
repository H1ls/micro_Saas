# Execution Status

Перед началом любого блока нужно проверить этот файл. Если блок уже имеет статус `DONE`, не выполнять его повторно и не менять код автоматически. Вместо этого сообщить: `Блок N уже завершен`, показать дату завершения и commit.

Допустимые статусы: `NOT STARTED`, `IN PROGRESS`, `DONE`, `BLOCKED`.

## Текущий статус блоков

| Блок | Название из execution_plan.md | Статус | Дата завершения | Commit | Комментарий |
|---:|---|---|---|---|---|
| 1 | Backend foundation и контракты API | DONE | 2026-08-31 17:51:49 +03:00 | `771192a356396b4e138267517e4daa219de707d7` | Выполнены backend skeleton, config, domain-модели, API schemas, domain errors, global error handler и health endpoint. |
| 2 | Ingestion, domain-модели и compact context | DONE | 2026-08-31 18:02:44 +03:00 | `870dcdb9ed076de39a04e464028b2b0c54898c44` | Реализованы ingestion, profiling, compact context, normalize и тесты блока. |
| 3 | `/api/analyze`, session store и deterministic dashboard fallback | DONE | 2026-08-31 18:23:13 +03:00 | `a25b6905a33d0ddaa4d09882653426af7b2e01ad` | Реализованы session store, fallback charts, fallback analysis и `POST /api/analyze`. |
| 4 | Frontend shell, upload UX и первый dashboard | DONE | 2026-08-31 19:19:47 +03:00 | `e53b88f` | Реализованы React/Vite frontend shell, upload UX, typed API client, session state, insight и первый `bar` chart. |
| 5 | LLM analysis с JSON schema и guardrails | DONE | 2026-08-31 19:30:41 +03:00 | `not committed by user request` | Реализованы LLM client, prompt, JSON parsing, validation, подключение в `/api/analyze` и fallback при сбоях LLM. |
| 6 | AI-графики, `/api/ask` и чат по данным | DONE | 2026-08-31 21:03:01 +03:00 | `966800d` | Реализованы line/pie chart data, `/api/ask`, chat service, ask prompt и AskPanel. |

## Подзадачи блока 1

| Подзадача | Задача | Статус | Дата завершения | Commit | Комментарий |
|---:|---|---|---|---|---|
| 1.1 | FastAPI skeleton | DONE | 2026-08-31 17:51:49 +03:00 | `771192a356396b4e138267517e4daa219de707d7` | Создан `app/main.py`, FastAPI app запускается. |
| 1.2 | Config | DONE | 2026-08-31 17:51:49 +03:00 | `771192a356396b4e138267517e4daa219de707d7` | Создан `app/core/config.py` с env-настройками из архитектуры. |
| 1.3 | Domain-модели | DONE | 2026-08-31 17:51:49 +03:00 | `771192a356396b4e138267517e4daa219de707d7` | Создан `app/domain/models.py` с моделями из архитектуры. |
| 1.4 | API schemas | DONE | 2026-08-31 17:51:49 +03:00 | `771192a356396b4e138267517e4daa219de707d7` | Создан `app/api/schemas.py`. |
| 1.5 | Domain errors | DONE | 2026-08-31 17:51:49 +03:00 | `771192a356396b4e138267517e4daa219de707d7` | Создан `app/domain/errors.py`. |
| 1.6 | Global error handler | DONE | 2026-08-31 17:51:49 +03:00 | `771192a356396b4e138267517e4daa219de707d7` | Добавлены handlers в `app/main.py`. |
| 1.7 | Health endpoint | DONE | 2026-08-31 17:51:49 +03:00 | `771192a356396b4e138267517e4daa219de707d7` | Создан `GET /api/health`. |

## Подзадачи блока 2

| Подзадача | Задача | Статус | Дата завершения | Commit | Комментарий |
|---:|---|---|---|---|---|
| 2.1 | Domain-модели | DONE | 2026-08-31 18:02:44 +03:00 | `870dcdb9ed076de39a04e464028b2b0c54898c44` | Модели уже были реализованы в Блоке 1 и переиспользованы без дублирования. |
| 2.2 | `ingest_service.validate_file()` и ограничения формата/размера | DONE | 2026-08-31 18:02:44 +03:00 | `870dcdb9ed076de39a04e464028b2b0c54898c44` | Поддержаны `.csv`, `.xls`, `.xlsx`, controlled errors для формата и размера. |
| 2.3 | `parse_input()` для CSV, Excel первого листа и raw text | DONE | 2026-08-31 18:02:44 +03:00 | `870dcdb9ed076de39a04e464028b2b0c54898c44` | CSV/Excel/raw text приводятся к `pd.DataFrame`. |
| 2.4 | `profiling_service.infer_column_profiles()` и `build_compact_context()` | DONE | 2026-08-31 18:02:44 +03:00 | `870dcdb9ed076de39a04e464028b2b0c54898c44` | Формируются типы колонок, counts, samples и JSON compact context. |
| 2.5 | `normalize_dataframe()` и unit tests | DONE | 2026-08-31 18:02:44 +03:00 | `870dcdb9ed076de39a04e464028b2b0c54898c44` | Сервис возвращает `NormalizedDataset`; плохие входы покрыты controlled errors. |

## Подзадачи блока 3

| Подзадача | Задача | Статус | Дата завершения | Commit | Комментарий |
|---:|---|---|---|---|---|
| 3.1 | `session_store.py`: `create_session()`, `get_session()`, `cleanup_expired_sessions()` | DONE | 2026-08-31 18:23:13 +03:00 | `a25b6905a33d0ddaa4d09882653426af7b2e01ad` | In-memory sessions создаются, читаются по `session_id` и очищаются по TTL. |
| 3.2 | `chart_service.recommend_fallback_charts()` и первый `bar` chart | DONE | 2026-08-31 18:23:13 +03:00 | `a25b6905a33d0ddaa4d09882653426af7b2e01ad` | Для dataset с category+number строится deterministic `PreparedChart`. |
| 3.3 | `analysis_service.fallback_analysis()` | DONE | 2026-08-31 18:23:13 +03:00 | `a25b6905a33d0ddaa4d09882653426af7b2e01ad` | Без LLM возвращаются headline, narrative, observations и chart specs. |
| 3.4 | `POST /api/analyze` на fallback-логике | DONE | 2026-08-31 18:23:13 +03:00 | `a25b6905a33d0ddaa4d09882653426af7b2e01ad` | Файл или текст возвращает `session_id`, dataset summary, analysis и charts. |

## Подзадачи блока 4

| Подзадача | Задача | Статус | Дата завершения | Commit | Комментарий |
|---:|---|---|---|---|---|
| 4.1 | React/Vite frontend shell: `AppShell`, `App`, базовые стили Tailwind | DONE | 2026-08-31 19:19:47 +03:00 | `e53b88f` | Frontend app собирается и показывает рабочий экран продукта, не landing page. |
| 4.2 | `api/client.ts` и типы `dashboard.ts` под backend response | DONE | 2026-08-31 19:19:47 +03:00 | `e53b88f` | Клиент отправляет `multipart/form-data` в `/api/analyze` и читает typed response. |
| 4.3 | `UploadPanel`: file picker, dropzone, raw text, кнопка Analyze | DONE | 2026-08-31 19:19:47 +03:00 | `e53b88f` | Пользователь может выбрать CSV/Excel или вставить текст и запустить анализ. |
| 4.4 | `useDashboardSession`: loading, error, ready, current session | DONE | 2026-08-31 19:19:47 +03:00 | `e53b88f` | UI обрабатывает success/error `/api/analyze` без падения. |
| 4.5 | `InsightHero`, `ChartGrid`, `ChartRenderer` для первого `bar` chart | DONE | 2026-08-31 19:19:47 +03:00 | `e53b88f` | После анализа видны headline, narrative, observations и первый bar chart. |

## Подзадачи блока 5

| Подзадача | Задача | Статус | Дата завершения | Commit | Комментарий |
|---:|---|---|---|---|---|
| 5.1 | `llm_client.complete_json()` с timeout и чтением env | DONE | 2026-08-31 19:30:41 +03:00 | `not committed by user request` | Клиент читает `LOCAL_AI_BASE_URL`, `LOCAL_AI_MODEL`, `OPENAI_API_KEY`, timeout и возвращает parsed JSON или controlled LLM error. |
| 5.2 | `prompts/analysis_prompt.py` с system prompt и builder по `compact_context` | DONE | 2026-08-31 19:30:41 +03:00 | `not committed by user request` | Prompt требует JSON, запрещает внешние факты и ограничивает ответ dataset. |
| 5.3 | `analysis_service.analyze_dataset()`, `parse_analysis_json()`, `validate_analysis()` | DONE | 2026-08-31 19:30:41 +03:00 | `not committed by user request` | Валидный LLM JSON используется; ошибка LLM, невалидный JSON или validation failure уходят в fallback Block 3. |
| 5.4 | Подключить LLM analysis в `/api/analyze` | DONE | 2026-08-31 19:30:41 +03:00 | `not committed by user request` | `/api/analyze` использует LLM analysis как основной путь и сохраняет deterministic fallback при сбоях. |

## Подзадачи блока 6

| Подзадача | Задача | Статус | Дата завершения | Commit | Комментарий |
|---:|---|---|---|---|---|
| 6.1 | Расширить `chart_service.prepare_charts()` для `bar`, `line`, `pie` | DONE | 2026-08-31 21:03:01 +03:00 | `966800d` | Backend готовит 2-3 `PreparedChart`; invalid specs заменяются fallback specs. |
| 6.2 | Обновить `ChartRenderer` под `bar`, `line`, `pie` | DONE | 2026-08-31 21:03:01 +03:00 | `966800d` | UI корректно рендерит разрешенные типы графиков через Recharts. |
| 6.3 | Создать `prompts/ask_prompt.py` и `chat_service.answer_question()` | DONE | 2026-08-31 21:03:01 +03:00 | `966800d` | Service возвращает `answer`, `confidence`, `used_columns` и fallback для ответа вне dataset. |
| 6.4 | Реализовать `POST /api/ask` | DONE | 2026-08-31 21:03:01 +03:00 | `966800d` | Вопрос по `session_id` получает ответ; отсутствующая сессия возвращает controlled error. |
| 6.5 | Реализовать `AskPanel` и client-side chat history | DONE | 2026-08-31 21:03:01 +03:00 | `966800d` | Пользователь задает вопросы и видит историю текущей вкладки. |

## Проверки после завершения

| Проверка | Статус | Результат |
|---|---|---|
| Python compile | DONE | `.venv\Scripts\python.exe -m compileall app` прошел успешно. |
| Health endpoint | DONE | `GET /api/health` вернул `200` и `{ "status": "ok" }`. |
| Global error handler | DONE | `AppError` возвращает JSON `{ "error": { "code", "message" } }`. |
| Config defaults | DONE | Проверены `api_prefix`, `max_upload_size_mb`, `session_ttl_minutes`. |
| Last commit check | DONE | Последний commit: `771192a356396b4e138267517e4daa219de707d7`, `2026-08-31T17:50:50+03:00`, `Добавлена базовая структура backend`. |
| Block 2 Python compile | DONE | `.venv\Scripts\python.exe -m compileall app tests` прошел успешно. |
| Block 2 unit tests | DONE | `.venv\Scripts\python.exe -m pytest tests\test_ingest_service.py -q`: `7 passed`. |
| Block 2 regression health check | DONE | `GET /api/health` вернул `200` и `{ "status": "ok" }`. |
| Block 3 Python compile | DONE | `.venv\Scripts\python.exe -m compileall app tests` прошел успешно. |
| Block 3 unit tests | DONE | `.venv\Scripts\python.exe -m pytest tests -q`: `14 passed`. |
| Block 3 analyze endpoint | DONE | `POST /api/analyze` покрыт тестом CSV happy path, raw text path и controlled `missing_input` error. |
| Block 3 regression health check | DONE | `GET /api/health` вернул `200` и `{ "status": "ok" }`. |
| Architecture fallback clarification | DONE | `docs/mvp_ai_dashboard_architecture_48h.md` уточняет: Block 3 строит fallback без LLM, Block 4 показывает его в UI, Block 5 добавляет LLM поверх fallback. |
| Fallback verification after architecture clarification | DONE | `2026-08-31 19:07:14 +03:00`: compile passed, `pytest tests -q`: `14 passed`, `/api/analyze` fallback check passed. Commit: `35065cc0429ff1e5b69d857dca0fb7677c789ff7`. |
| Block 4 frontend build | DONE | `2026-08-31 19:19:47 +03:00`: `npm.cmd run build` прошел успешно. Vite warning о chunk size оставлен без изменения scope. |
| Block 4 backend regression tests | DONE | `2026-08-31 19:19:47 +03:00`: `.venv\Scripts\python.exe -m pytest tests -q`: `14 passed`. |
| Block 5 backend tests | DONE | `2026-08-31 19:30:41 +03:00`: `.venv\Scripts\python.exe -m pytest tests -q`: `18 passed`. |
| Block 5 frontend regression build | DONE | `2026-08-31 19:30:41 +03:00`: `npm.cmd run build` прошел успешно. Vite warning о chunk size оставлен без изменения scope. |
| Block 5 gitignore check | DONE | `2026-08-31 19:30:41 +03:00`: `.env` игнорируется через `.gitignore`; ранее отслеживаемые `.idea` и `__pycache__` сняты с Git index через `git rm --cached`. |
| Block 6 Python compile | DONE | `2026-08-31 21:03:01 +03:00`: `.venv\Scripts\python.exe -m compileall app tests` прошел успешно. |
| Block 6 backend tests | DONE | `2026-08-31 21:03:01 +03:00`: `.venv\Scripts\python.exe -m pytest tests -q`: `27 passed`. |
| Block 6 frontend build | DONE | `2026-08-31 21:03:01 +03:00`: `npm.cmd run build` прошел успешно. Vite warning о chunk size оставлен без изменения scope. |
