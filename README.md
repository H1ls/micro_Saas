# AI Dashboard MVP

Micro-SaaS MVP that turns CSV, Excel or raw text into a small AI dashboard. The app has no auth, billing, database, queues, vector search or background jobs.

## Stack

- Backend: Python, FastAPI, Pydantic, pandas, OpenAI-compatible client
- Frontend: React, Vite, TypeScript, Tailwind CSS, Recharts
- Storage: in-memory dataset sessions with TTL

## Setup

Create `.env` from the template:

```powershell
Copy-Item .env.example .env
```

Install backend dependencies:

```powershell
.venv\Scripts\python.exe -m pip install -r requirements.txt
```

Install frontend dependencies:

```powershell
cd frontend
npm.cmd install
```

## Run

Backend:

```powershell
.venv\Scripts\python.exe -m uvicorn app.main:app --reload
```

Frontend:

```powershell
cd frontend
npm.cmd run dev
```

Open:

```text
http://localhost:5173/
```

Vite proxies `/api/*` to `http://127.0.0.1:8000`, so the browser does not need backend CORS for local MVP use.

## LLM

For a local OpenAI-compatible server:

```env
LOCAL_AI_BASE_URL=http://127.0.0.1:1234/v1
LOCAL_AI_MODEL=qwen3.5-9b
OPENAI_API_KEY=local
```

If the LLM is unavailable, returns invalid JSON, or references invalid columns, `/api/analyze` uses deterministic fallback analysis and `/api/ask` returns:

```text
I cannot answer this from the uploaded dataset.
```

## Input Formats

- CSV: `.csv`
- Excel: `.xls`, `.xlsx`, first sheet only
- Raw text: pasted structured text or line-based notes

Minimal sample:

```csv
date,segment,revenue
2026-01-01,SMB,100
2026-01-02,Enterprise,250
2026-01-03,SMB,150
```

## API

Analyze:

```powershell
Invoke-RestMethod `
  -Uri "http://127.0.0.1:8000/api/analyze" `
  -Method Post `
  -Form @{ raw_text = "segment,revenue`nSMB,100`nEnterprise,250`n" }
```

Ask:

```powershell
Invoke-RestMethod `
  -Uri "http://127.0.0.1:8000/api/ask" `
  -Method Post `
  -ContentType "application/json" `
  -Body '{"session_id":"SESSION_ID_FROM_ANALYZE","question":"Which segment has the highest revenue?"}'
```

## Example Questions

- Which segment has the highest revenue?
- What changed over time?
- Which category contributes the most?
- Which columns were used for the answer?

## MVP Limits

- No auth, billing or persistent history
- No database; sessions reset when backend restarts
- No vector RAG or embeddings
- No background jobs
- Excel support is intentionally simple: first sheet, standard tables
- LLM answers are constrained by prompt and code validation, but fallback remains the reliability layer

## Checks

```powershell
.venv\Scripts\python.exe -m compileall app tests
.venv\Scripts\python.exe -m pytest tests -q
cd frontend
npm.cmd run build
```
