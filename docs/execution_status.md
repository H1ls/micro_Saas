# Execution Status

Перед началом любого блока нужно проверить этот файл. Если блок уже имеет статус `DONE`, не выполнять его повторно и не менять код автоматически. Вместо этого сообщить: `Блок N уже завершен`, показать дату завершения и commit.

Допустимые статусы: `NOT STARTED`, `IN PROGRESS`, `DONE`, `BLOCKED`.

## Текущий статус блоков

| Блок | Название из execution_plan.md | Статус | Дата завершения | Commit | Комментарий |
|---:|---|---|---|---|---|
| 1 | Backend foundation и контракты API | DONE | 2026-08-31 17:51:49 +03:00 | `771192a356396b4e138267517e4daa219de707d7` | Выполнены backend skeleton, config, domain-модели, API schemas, domain errors, global error handler и health endpoint. |
| 2 | Ingestion, domain-модели и compact context | DONE | 2026-08-31 18:02:44 +03:00 | `870dcdb9ed076de39a04e464028b2b0c54898c44` | Реализованы ingestion, profiling, compact context, normalize и тесты блока. |
| 3 | `/api/analyze`, session store и deterministic dashboard fallback | DONE | 2026-08-31 18:23:13 +03:00 | pending commit | Реализованы session store, fallback charts, fallback analysis и `POST /api/analyze`. |

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
| 3.1 | `session_store.py`: `create_session()`, `get_session()`, `cleanup_expired_sessions()` | DONE | 2026-08-31 18:23:13 +03:00 | pending commit | In-memory sessions создаются, читаются по `session_id` и очищаются по TTL. |
| 3.2 | `chart_service.recommend_fallback_charts()` и первый `bar` chart | DONE | 2026-08-31 18:23:13 +03:00 | pending commit | Для dataset с category+number строится deterministic `PreparedChart`. |
| 3.3 | `analysis_service.fallback_analysis()` | DONE | 2026-08-31 18:23:13 +03:00 | pending commit | Без LLM возвращаются headline, narrative, observations и chart specs. |
| 3.4 | `POST /api/analyze` на fallback-логике | DONE | 2026-08-31 18:23:13 +03:00 | pending commit | Файл или текст возвращает `session_id`, dataset summary, analysis и charts. |

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
