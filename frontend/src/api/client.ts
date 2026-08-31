import type { AnalyzeResponse, ApiErrorResponse, AskRequest, AskResponse } from "../types/dashboard";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "";

export interface AnalyzeInput {
  file?: File | null;
  rawText?: string;
}

export async function analyzeDataset(input: AnalyzeInput): Promise<AnalyzeResponse> {
  const body = new FormData();

  if (input.file) {
    body.append("file", input.file);
  }

  const rawText = input.rawText?.trim();
  if (rawText) {
    body.append("raw_text", rawText);
  }

  const response = await fetch(`${API_BASE_URL}/api/analyze`, {
    method: "POST",
    body
  });

  if (!response.ok) {
    let message = "Не удалось проанализировать dataset. Проверьте данные и попробуйте снова.";

    try {
      const payload = (await response.json()) as ApiErrorResponse;
      message = translateApiError(payload, message);
    } catch {
      message = response.statusText || message;
    }

    throw new Error(message);
  }

  return response.json() as Promise<AnalyzeResponse>;
}

export async function askDataset(request: AskRequest): Promise<AskResponse> {
  const response = await fetch(`${API_BASE_URL}/api/ask`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(request)
  });

  if (!response.ok) {
    let message = "Не удалось ответить на вопрос.";

    try {
      const payload = (await response.json()) as ApiErrorResponse;
      message = translateApiError(payload, message);
    } catch {
      message = response.statusText || message;
    }

    throw new Error(message);
  }

  return response.json() as Promise<AskResponse>;
}

function translateApiError(payload: ApiErrorResponse, fallback: string): string {
  switch (payload.error?.code) {
    case "missing_input":
      return "Загрузите CSV, XLS, XLSX или вставьте сырой текст.";
    case "unsupported_file_type":
      return "Поддерживаются только CSV, XLS и XLSX.";
    case "file_too_large":
      return "Файл слишком большой для MVP. Уменьшите файл и попробуйте снова.";
    case "empty_dataset":
      return "Dataset пустой. Загрузите другой файл или вставьте данные.";
    case "parse_error":
      return "Не удалось прочитать файл. Проверьте формат и структуру данных.";
    case "session_not_found":
      return "Сессия dataset не найдена. Загрузите данные заново.";
    case "validation_error":
      return "Запрос не прошел валидацию. Проверьте данные и попробуйте снова.";
    default:
      return payload.error?.message ?? fallback;
  }
}
