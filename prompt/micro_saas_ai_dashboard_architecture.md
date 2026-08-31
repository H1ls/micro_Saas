# Micro-SaaS AI Dashboard - Architecture Map

## Assumptions

- Current repository is a Python project, not a ready frontend app.
- MVP should stay lightweight: no auth, no billing, no user database, no vector RAG, no background queues.
- Recommended implementation stack: FastAPI backend + static React/Vite frontend or server-rendered static assets.
- Existing `db/llm.py` can be reused as the starting point for LLM calls, but should be moved behind a small service layer and configured through environment variables.

## Target File Structure

```text
app/
  main.py
  api/
    routes/
      analyze.py
      ask.py
    schemas.py
  services/
    ingest_service.py
    analysis_service.py
    chart_service.py
    chat_service.py
    llm_client.py
  parsers/
    csv_parser.py
    excel_parser.py
    text_parser.py
  domain/
    models.py
    errors.py
  prompts/
    analysis_prompt.py
    ask_prompt.py
  frontend/
    src/
      App.tsx
      api/client.ts
      components/
        upload/UploadPanel.tsx
        dashboard/DashboardLayout.tsx
        dashboard/HeroInsight.tsx
        charts/ChartRenderer.tsx
        charts/BarChartCard.tsx
        charts/LineChartCard.tsx
        charts/PieChartCard.tsx
        chat/AskDataPanel.tsx
        states/EmptyState.tsx
        states/ErrorState.tsx
        states/LoadingSkeleton.tsx
      state/useDashboardSession.ts
      types/dashboard.ts
  .env.example
  README.md
```

## Block 1 - Upload And Data Preparation

| Subtask | Place | Class / Function |
|---|---|---|
| Main app screen | `frontend/src/App.tsx` | `App()` |
| Upload layout | `frontend/src/components/upload/UploadPanel.tsx` | `UploadPanel()` |
| Drag and drop | `frontend/src/components/upload/UploadPanel.tsx` | `handleDrop()`, `handleDragOver()` |
| File picker button | `frontend/src/components/upload/UploadPanel.tsx` | `handleFileSelect()` |
| Raw text textarea | `frontend/src/components/upload/UploadPanel.tsx` | `handleTextChange()` |
| Start analysis | `frontend/src/components/upload/UploadPanel.tsx` | `handleAnalyzeClick()` |
| Session UI state | `frontend/src/state/useDashboardSession.ts` | `useDashboardSession()` |
| File validation | `services/ingest_service.py` | `validate_upload_file()` |
| CSV parsing | `parsers/csv_parser.py` | `parse_csv_file()` |
| Excel parsing | `parsers/excel_parser.py` | `parse_excel_file()` |
| Text parsing | `parsers/text_parser.py` | `parse_raw_text()` |
| Unified data shape | `domain/models.py` | `NormalizedDataset`, `ColumnProfile` |
| Data normalization | `services/ingest_service.py` | `normalize_dataset()` |
| Column type detection | `services/ingest_service.py` | `infer_column_profiles()` |
| LLM compact context | `services/ingest_service.py` | `build_dataset_summary()` |
| Upload errors | `domain/errors.py` | `UnsupportedFileTypeError`, `FileTooLargeError`, `ParseError` |
| Analyze endpoint | `api/routes/analyze.py` | `analyze_dataset()` |
| API request/response schemas | `api/schemas.py` | `AnalyzeResponse`, `UploadSource` |

## Block 2 - AI Analysis And Hero Narrative

| Subtask | Place | Class / Function |
|---|---|---|
| LLM endpoint wiring | `api/routes/analyze.py` | `analyze_dataset()` |
| LLM client | `services/llm_client.py` | `LLMClient`, `complete_json()` |
| Environment config | `services/llm_client.py` | `get_llm_client()` |
| Analysis system prompt | `prompts/analysis_prompt.py` | `ANALYSIS_SYSTEM_PROMPT` |
| User prompt builder | `prompts/analysis_prompt.py` | `build_analysis_prompt()` |
| Analysis orchestration | `services/analysis_service.py` | `analyze_normalized_dataset()` |
| Structured AI schema | `domain/models.py` | `AIAnalysis`, `MetricInsight`, `ChartSpec` |
| Validate AI JSON | `services/analysis_service.py` | `parse_ai_analysis_response()` |
| Invalid JSON fallback | `services/analysis_service.py` | `build_fallback_analysis()` |
| Hallucination guard | `services/analysis_service.py` | `validate_analysis_against_dataset()` |
| Hero widget | `frontend/src/components/dashboard/HeroInsight.tsx` | `HeroInsight()` |
| Hero skeleton | `frontend/src/components/states/LoadingSkeleton.tsx` | `HeroSkeleton()` |

## Block 3 - AI Charts And Visual Dashboard

| Subtask | Place | Class / Function |
|---|---|---|
| Chart config schema | `domain/models.py` | `ChartSpec`, `ChartType` |
| Chart recommendation rules | `prompts/analysis_prompt.py` | `CHART_SELECTION_RULES` |
| Chart data preparation | `services/chart_service.py` | `prepare_chart_data()` |
| Category aggregation | `services/chart_service.py` | `aggregate_by_category()` |
| Numeric aggregation | `services/chart_service.py` | `summarize_numeric_values()` |
| Time sorting | `services/chart_service.py` | `sort_time_series()` |
| Null handling | `services/chart_service.py` | `filter_empty_chart_values()` |
| Chart rendering switch | `frontend/src/components/charts/ChartRenderer.tsx` | `ChartRenderer()` |
| Bar chart | `frontend/src/components/charts/BarChartCard.tsx` | `BarChartCard()` |
| Line chart | `frontend/src/components/charts/LineChartCard.tsx` | `LineChartCard()` |
| Pie chart | `frontend/src/components/charts/PieChartCard.tsx` | `PieChartCard()` |
| Dashboard layout | `frontend/src/components/dashboard/DashboardLayout.tsx` | `DashboardLayout()` |
| No chart data state | `frontend/src/components/states/EmptyState.tsx` | `NoChartsEmptyState()` |

## Block 4 - Ask The Data, States, Verification

| Subtask | Place | Class / Function |
|---|---|---|
| Chat UI | `frontend/src/components/chat/AskDataPanel.tsx` | `AskDataPanel()` |
| Chat input state | `frontend/src/components/chat/AskDataPanel.tsx` | `handleQuestionChange()` |
| Submit question | `frontend/src/components/chat/AskDataPanel.tsx` | `handleSubmitQuestion()` |
| Chat history | `frontend/src/state/useDashboardSession.ts` | `addChatMessage()`, `clearChatHistory()` |
| Ask endpoint | `api/routes/ask.py` | `ask_dataset()` |
| Ask prompt | `prompts/ask_prompt.py` | `ASK_SYSTEM_PROMPT`, `build_ask_prompt()` |
| Ask orchestration | `services/chat_service.py` | `answer_dataset_question()` |
| Missing info fallback | `services/chat_service.py` | `build_unknown_answer()` |
| Empty states | `frontend/src/components/states/EmptyState.tsx` | `UploadEmptyState()`, `ChatEmptyState()` |
| Error states | `frontend/src/components/states/ErrorState.tsx` | `ErrorState()` |
| Retry action | `frontend/src/components/states/ErrorState.tsx` | `onRetry` prop |
| API client | `frontend/src/api/client.ts` | `analyzeDataset()`, `askDataset()` |
| End-to-end checks | `tests/e2e/` or `frontend/e2e/` | `csv-analysis.spec.ts`, `text-analysis.spec.ts` |
| Backend unit tests | `tests/` | `test_ingest_service.py`, `test_chart_service.py`, `test_analysis_service.py` |
| Environment example | `.env.example` | `OPENAI_API_KEY`, `LLM_BASE_URL`, `LLM_MODEL` |
| Project docs | `README.md` | Setup, supported formats, MVP limits |

## Data Contracts

### `NormalizedDataset`

```python
class NormalizedDataset(BaseModel):
    source_type: Literal["csv", "excel", "text"]
    name: str | None
    columns: list[ColumnProfile]
    rows: list[dict[str, Any]]
    row_count: int
    column_count: int
    compact_context: str
```

### `AIAnalysis`

```python
class AIAnalysis(BaseModel):
    headline: str
    narrative: str
    key_observations: list[str]
    metrics: list[MetricInsight]
    charts: list[ChartSpec]
```

### `ChartSpec`

```python
class ChartSpec(BaseModel):
    title: str
    type: Literal["bar", "line", "pie"]
    x_key: str
    y_key: str
    description: str | None = None
```

## Improved Execution Order

The original recommended order is directionally good, but I would move Excel later, and move error contracts earlier. Without typed errors and response schemas, frontend states and LLM fallbacks become harder to add cleanly.

1. Define backend contracts: `NormalizedDataset`, `AIAnalysis`, `ChartSpec`, shared API schemas.
2. Build CSV + raw text ingestion end-to-end.
3. Add normalization, column type inference, and compact LLM context.
4. Add one `/api/analyze` endpoint with a temporary deterministic fallback response.
5. Build the first complete UI path: upload -> analyze -> hero widget -> one bar chart.
6. Replace fallback analysis with real LLM call and strict JSON validation.
7. Add hallucination guards and invalid JSON fallback.
8. Add chart recommendation schema to the prompt.
9. Add universal `ChartRenderer`.
10. Add line and pie chart rendering.
11. Add `/api/ask` and Ask the Data UI.
12. Add missing-answer fallback for Ask the Data.
13. Add Excel parsing.
14. Add full Loading / Empty / Error states.
15. Add visual polish and micro-interactions.
16. Run end-to-end checks for CSV, Excel, text, bad files, empty data, and out-of-context questions.
17. Add `.env.example`, README, remove debug output, verify production build.

## Suggested Adjustment To MVP Scope

- Keep RAG out of the MVP. The uploaded dataset is the whole context for both analysis and chat.
- Do not start with charts chosen by the LLM only. First generate at least one deterministic chart from numeric/category columns, then let the LLM recommend better charts once the renderer is stable.
- Add Excel after CSV/text are fully working. Excel parsing has more edge cases and should not block the first end-to-end demo.
- Treat structured JSON validation as a core feature, not cleanup. It is the main boundary that keeps the UI from breaking.

## First Implementation Slice

The smallest useful vertical slice:

1. `parsers/csv_parser.py::parse_csv_file()`
2. `parsers/text_parser.py::parse_raw_text()`
3. `services/ingest_service.py::normalize_dataset()`
4. `api/routes/analyze.py::analyze_dataset()`
5. `frontend/src/components/upload/UploadPanel.tsx::UploadPanel()`
6. `frontend/src/components/dashboard/HeroInsight.tsx::HeroInsight()`
7. `frontend/src/components/charts/BarChartCard.tsx::BarChartCard()`

After this slice, the product can already demonstrate the main promise: user input becomes a dashboard with narrative and at least one visual.
