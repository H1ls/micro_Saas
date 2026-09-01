# Tech Debt Review

Цель документа: зафиксировать только подтвержденные по текущему коду места, где есть архитектурный мусор, дублирование, лишние функции или нарушение разделения ответственности. Это не план переписывания проекта, а список безопасных точечных улучшений для MVP.

## Исправлено

- P1: orchestration `/api/analyze` вынесен из route в `app/services/dashboard_service.py`; endpoint теперь только принимает HTTP input, вызывает service и возвращает `AnalyzeResponse`.
- P1: дублирующая сборка `AnalyzeResponse` вынесена в `build_analyze_response(session)`.
- P1: raw-text extraction facade разделен на `request_raw_text_extraction()`, `build_raw_text_extraction_result()`, `extraction_to_dataframe()`, `build_raw_text_analysis()` и `build_raw_text_chart_specs()`.
- Safe removal: пустая `_deterministic_extraction()` удалена; при ошибке LLM raw-text extraction явно возвращает `None`, после чего общий analyze flow работает через обычный text dataframe/fallback.
- P2: file-upload error state переведен на общий `MascotEmptyPanel` через `imageSrc`; ручной дубль layout удален.
- Safe removal: неиспользуемый `DegradedStateNotice` удален.
- P3: `RequestValidationError` больше не возвращает `details` в API response.

## 1. Список на безопасное удаление

### 1.1. `frontend/src/components/states.tsx:140` - `DegradedStateNotice`

Статус: кандидат на удаление.

Факт по коду: экспорт `DegradedStateNotice` не используется в `frontend/src`. Поиск по проекту находит только объявление функции.

Почему это мусор: fallback UI сейчас реализован через `FallbackDataState`, а `Dashboard` при `analysis_source === "fallback"` показывает именно его. Старый notice остался как неиспользуемый альтернативный вариант degraded state.

Безопасность удаления: удалить можно после финальной проверки, что компонент не импортируется вне `frontend/src` и не нужен для ближайшего UI-сценария.

### 1.2. `app/services/raw_text_extraction_service.py:134` - `_deterministic_extraction`

Статус: кандидат на удаление или на честную реализацию.

Факт по коду: функция вызывается только внутри `extract_raw_text()` как fallback при `LLMUnavailableError` или `InvalidLLMResponseError`, но всегда возвращает `None`.

Почему это мусор: название обещает deterministic fallback, но фактически fallback отсутствует. Это ухудшает читаемость и создает ложное ощущение надежного raw-text пути без LLM.

Безопасность удаления: если архитектурно raw text без LLM должен просто падать обратно на обычный текстовый dataframe, функцию можно убрать и явно возвращать `None`. Если нужен настоящий fallback, функцию нельзя удалять, ее нужно реализовать отдельной задачей.

### 1.3. `app/services/raw_text_extraction_service.py:62` - `extract_raw_text_dataframe`

Статус: не удалять сразу, но проверить необходимость.

Факт по коду: production-код ее не использует; функция упомянута как compatibility wrapper и возвращает только dataframe из нового `extract_raw_text()`.

Почему это потенциальный мусор: это второй публичный способ вызвать ту же raw-text extraction логику, но с потерей `analysis` и `extraction`.

Безопасность удаления: удалить можно только после обновления/удаления старых тестов или подтверждения, что внешний код не импортирует этот wrapper.

## 2. Список функций, которые можно разделить

### 2.1. `app/api/routes/analyze.py:16` - `analyze_dataset`

Проблема: endpoint стал fat controller.

Факт по коду: route не только принимает HTTP input и возвращает response, но также выбирает raw-text extraction path, вызывает normalization, analysis, chart preparation, session creation и вручную собирает `AnalyzeResponse` в двух ветках.

Почему это нарушает архитектуру: по `docs/ai_execution_rules.md` API layer должен принимать запрос, вызвать service и вернуть HTTP response. Логика сценария upload -> normalize -> analyze -> charts -> session должна быть в service layer.

Минимальное исправление: вынести use case в сервис, например `dashboard_service.analyze_input(file, raw_text, filename) -> AnalyzeResponse` или `AnalysisWorkflowResult`. Route оставить тонким: извлечь `file.file`, `file.filename`, вызвать сервис, вернуть результат.

Приоритет: P1.

### 2.2. `app/services/raw_text_extraction_service.py:40` - `extract_raw_text`

Проблема: функция выполняет несколько задач.

Факт по коду: внутри одной функции есть вызов LLM, parsing/validation, fallback decision, dataframe conversion и построение analysis.

Почему это риск: любое изменение raw-text prompt, fallback или chart generation затрагивает один и тот же участок. Это уже проявилось в доработках, где raw text стал отдельным flow.

Минимальное исправление: оставить публичный facade, но внутри разделить на маленькие шаги: `request_raw_text_extraction`, `build_raw_text_dataset_frame`, `build_raw_text_analysis`. Часть функций уже есть, нужно только убрать смешивание orchestration и преобразований.

Приоритет: P1.

### 2.3. `app/services/raw_text_extraction_service.py:81` - `build_raw_text_analysis`

Проблема: функция одновременно строит fallback chart specs, выбирает LLM chart specs, формирует headline, insight, narrative и observations.

Почему это риск: chart logic для raw text частично живет здесь, хотя общая подготовка chart data живет в `chart_service`. Это допустимая MVP-заплатка, но граница ответственности размыта.

Минимальное исправление: выделить `build_raw_text_chart_specs(extraction)` и `build_raw_text_narrative(extraction)`. Не переносить агрегацию в frontend.

Приоритет: P2.

### 2.4. `frontend/src/components/ChartRenderer.tsx:27` - `ChartRenderer`

Проблема: компонент слишком много знает о видах графиков и UI-вспомогательной логике.

Факт по коду: файл содержит rendering для `bar`, `line`, `pie`, общий frame, tooltip, tick wrapping, форматирование чисел, center metric и selection behavior.

Почему это риск: любые изменения графиков приводят к правкам в одном большом компоненте. Это повышает шанс визуальных регрессий.

Минимальное исправление: разделить внутри `components/charts/` на `BarChartView`, `LineChartView`, `DonutChartView`, `ChartFrame`, `ChartTooltip`. `ChartRenderer` оставить switch-dispatcher по `spec.type`.

Приоритет: P2.

### 2.5. `frontend/src/components/UploadPanel.tsx:12` - `UploadPanel`

Проблема: компонент смешивает layout variants, file input, drag/drop, raw text autosize и submit.

Факт по коду: props `collapsed`, `disabled`, `homeLayout` меняют и layout, и поведение; autosize textarea делается прямой мутацией DOM в `handleRawTextChange`.

Почему это риск: UI upload уже несколько раз менялся, и дальнейшие изменения легко будут ломать мобильное поведение.

Минимальное исправление: вынести `FileDropzone` и `RawTextInput`. `UploadPanel` оставить контейнером формы.

Приоритет: P2.

### 2.6. `frontend/src/api/client.ts:95` - `translateApiError`

Проблема: большой `switch` на коды ошибок.

Факт по коду: все пользовательские тексты ошибок зашиты в один switch.

Почему это риск: при добавлении новых backend error codes функция будет расти, а тексты UI и mapping смешаны с HTTP client.

Минимальное исправление: заменить switch на `ERROR_TRANSLATIONS: Record<string, ...>` и маленькую функцию выбора fallback. Это сохранит KISS и упростит поддержку.

Приоритет: P3.

## 3. Список дублей

### 3.1. Сборка `AnalyzeResponse` дублируется в `app/api/routes/analyze.py`

Факт по коду: response собирается вручную в raw-text ветке и в общей ветке. Поля одинаковые: `session_id`, `analysis_source`, `DatasetSummary`, `analysis`, `charts`.

Почему это дубль: при изменении response contract придется править обе ветки.

Минимальное исправление: вынести helper `build_analyze_response(session)` или вернуть это из orchestration service.

Приоритет: P1, вместе с выносом fat controller.

### 3.2. Логика file/generic error state частично дублируется в `frontend/src/components/states.tsx`

Факт по коду: `MascotEmptyPanel` уже есть для generic/fallback states, но ветка `error.kind === "file_upload"` все еще вручную повторяет контейнер, картинку, текст и кнопки.

Почему это дубль: две реализации одной empty/error layout-схемы будут расходиться по стилям.

Минимальное исправление: расширить `MascotEmptyPanel` параметром `imageSrc` и использовать его для file-upload errors с `/fallback-file.png`.

Приоритет: P2.

### 3.3. `aggregate_for_pie` дублирует `aggregate_for_bar`

Факт по коду: `aggregate_for_pie()` просто вызывает `aggregate_for_bar()`.

Почему это не критично: для MVP pie и bar действительно используют одинаковую группировку.

Минимальное исправление: оставить как есть, если важна явная архитектурная функция из docs. Удалять не стоит, потому что `docs/mvp_ai_dashboard_architecture_48h.md` прямо перечисляет отдельный `aggregate_for_pie`.

Приоритет: P4.

## 4. Список на исправление по приоритету

### P1. Вынести orchestration из `/api/analyze`

Файлы: `app/api/routes/analyze.py`, новый или существующий service layer.

Что сделать: route должен только принять `UploadFile/raw_text`, передать stream/filename в service и вернуть `AnalyzeResponse`. Вся ветвистая логика raw text vs csv/excel должна уйти из route.

Почему первым: это главное нарушение разделения ответственности и самый вероятный источник будущей лапши.

### P1. Разделить raw-text extraction facade

Файл: `app/services/raw_text_extraction_service.py`.

Что сделать: оставить один публичный сценарий, но разделить LLM request, validation, dataframe conversion, analysis/chart-spec synthesis.

Почему первым: raw text сейчас самая быстро меняющаяся часть продукта, а текущий сервис уже совмещает несколько причин для изменений.

### P2. Унифицировать frontend empty/error panels

Файл: `frontend/src/components/states.tsx`.

Что сделать: `MascotEmptyPanel` должен принимать `imageSrc`, а file-upload error должен использовать тот же компонент.

Почему: это маленькое и безопасное DRY-исправление без изменения backend.

### P2. Разделить `ChartRenderer`

Файл: `frontend/src/components/ChartRenderer.tsx`.

Что сделать: вынести view-компоненты графиков и общие helpers в `components/charts/`.

Почему: графики уже стали продуктовой зоной с большим числом UI-правок. Разделение снизит риск регрессий.

### P2. Разделить `UploadPanel`

Файл: `frontend/src/components/UploadPanel.tsx`.

Что сделать: вынести dropzone и raw text input.

Почему: компонент содержит несколько независимых UI-поводов для изменений.

### P3. Упростить `translateApiError`

Файл: `frontend/src/api/client.ts`.

Что сделать: заменить `switch` на таблицу mapping.

Почему: это небольшая уборка, не блокирует MVP.

### P3. Убрать leakage validation details из global error handler

Файл: `app/main.py:23`.

Факт по коду: handler `RequestValidationError` возвращает `"details": exc.errors()`.

Почему это расходится с правилами: `docs/ai_execution_rules.md` запрещает отдавать внутренние exception details пользователю. Для FastAPI validation это не traceback, но все равно внутренние детали схемы. Архитектурный error contract в docs содержит только `code` и `message`.

Минимальное исправление: убрать `details` из response или включать только в dev mode, если такой режим будет явно введен.

### P4. Проверить публичность compatibility helpers

Файл: `app/services/raw_text_extraction_service.py`.

Что сделать: решить, нужен ли `extract_raw_text_dataframe`. Если нужен только тестам, тесты лучше перевести на основной `extract_raw_text`.

Почему: уменьшает количество входов в один и тот же flow.

## 5. Что проверено и не признано проблемой

- `app/services/chart_service.py` содержит `if/elif` по `spec.type`, но сейчас типов всего три. Для MVP это читаемо; registry-dispatch можно отложить.
- `clear_sessions()` используется тестами и не должен удаляться без замены test fixture.
- `parse_analysis_json`, `parse_ask_json`, `aggregate_for_bar`, `aggregate_for_line`, `aggregate_for_pie` используются кодом или тестами и соответствуют архитектуре.
- Frontend не считает backend-метрики dataset: он форматирует и рендерит уже подготовленные chart data, что соответствует разделению ответственности.
- Backend не содержит auth, billing, database, queues, vector RAG или background jobs; по этим ограничениям отклонений не найдено.
