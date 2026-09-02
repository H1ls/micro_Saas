# AI Dashboard MVP

Micro-SaaS MVP, который превращает CSV, Excel или обычный текст в небольшой AI-дашборд.  
В приложении нет авторизации, биллинга, базы данных, очередей, векторного поиска и фоновых задач.

## Стек

- Backend: Python, FastAPI, Pydantic, pandas, OpenAI-compatible client
- Frontend: React, Vite, TypeScript, Tailwind CSS, Recharts
- Хранение: in-memory сессии датасетов с TTL

## Установка

Создайте `.env` из шаблона:

```powershell
Copy-Item .env.example .env
```

Установите зависимости backend:

```powershell
.venv\Scripts\python.exe -m pip install -r requirements.txt
```

Установите зависимости frontend:

```powershell
cd frontend
npm.cmd install
```

## Запуск

Backend:

```powershell
.venv\Scripts\python.exe -m uvicorn app.main:app --reload
```

Frontend:

```powershell
cd frontend
npm.cmd run dev
```

Откройте в браузере:

```text
http://localhost:5173/
```

Vite проксирует запросы `/api/*` на `http://127.0.0.1:8000`, поэтому для локального MVP отдельная настройка CORS для backend не требуется.

## LLM

Для локального OpenAI-compatible сервера:

```env
LOCAL_AI_BASE_URL=http://127.0.0.1:1234/v1
LOCAL_AI_MODEL=qwen3.5-9b
OPENAI_API_KEY=local
```

Если LLM недоступна, возвращает невалидный JSON или ссылается на несуществующие столбцы, `/api/analyze` использует детерминированный fallback-анализ, а `/api/ask` возвращает:

```text
Я не могу ответить на этот вопрос на основе загруженного датасета.
```

## Поддерживаемые форматы

- CSV: `.csv`
- Excel: `.xls`, `.xlsx`, используется только первый лист
- Raw text: вставленный структурированный текст или построчные заметки

Минимальный пример:

```csv
date,segment,revenue
2026-01-01,SMB,100
2026-01-02,Enterprise,250
2026-01-03,SMB,150
```

## API

Анализ:

```powershell
Invoke-RestMethod `
  -Uri "http://127.0.0.1:8000/api/analyze" `
  -Method Post `
  -Form @{ raw_text = "segment,revenue`nSMB,100`nEnterprise,250`n" }
```

Вопрос по данным:

```powershell
Invoke-RestMethod `
  -Uri "http://127.0.0.1:8000/api/ask" `
  -Method Post `
  -ContentType "application/json" `
  -Body '{"session_id":"SESSION_ID_FROM_ANALYZE","question":"Какой сегмент имеет наибольшую выручку?"}'
```

## Примеры вопросов

- Какой сегмент имеет наибольшую выручку?
- Что изменилось со временем?
- Какая категория вносит наибольший вклад?
- Какие столбцы использовались для ответа?

## Ограничения MVP

- Нет авторизации, биллинга и постоянной истории
- Нет базы данных; сессии сбрасываются при перезапуске backend
- Нет vector RAG и embeddings
- Нет фоновых задач
- Поддержка Excel намеренно упрощена: только первый лист и стандартные таблицы
- Ответы LLM ограничены prompt-инструкциями и валидацией кода, но fallback остается слоем надежности

## Проверки

```powershell
.venv\Scripts\python.exe -m compileall app tests
.venv\Scripts\python.exe -m pytest tests -q
cd frontend
npm.cmd run build
```
