import type { AnalyzeResponse, ApiErrorResponse, AskRequest, AskResponse } from "../types/dashboard";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "";

export interface AnalyzeInput {
  file?: File | null;
  rawText?: string;
}

export type ApiErrorKind = "file_upload" | "ask" | "generic";

export interface TranslatedApiError {
  code: string;
  kind: ApiErrorKind;
  title: string;
  message: string;
}

export class ApiClientError extends Error {
  readonly details: TranslatedApiError;

  constructor(details: TranslatedApiError) {
    super(details.message);
    this.name = "ApiClientError";
    this.details = details;
  }
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
    const fallback = {
      code: "analyze_failed",
      kind: "generic" as const,
      title: "Не удалось проанализировать данные",
      message: "Проверьте данные и попробуйте снова."
    };

    throw new ApiClientError(await readTranslatedError(response, fallback));
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
    const fallback = {
      code: "ask_failed",
      kind: "ask" as const,
      title: "Не удалось ответить на вопрос",
      message: "Попробуйте задать вопрос короче или загрузите данные заново."
    };

    throw new ApiClientError(await readTranslatedError(response, fallback));
  }

  return response.json() as Promise<AskResponse>;
}

async function readTranslatedError(response: Response, fallback: TranslatedApiError): Promise<TranslatedApiError> {
  try {
    const payload = (await response.json()) as ApiErrorResponse;
    return translateApiError(payload, fallback);
  } catch {
    return {
      ...fallback,
      message: response.statusText || fallback.message
    };
  }
}

function translateApiError(payload: ApiErrorResponse, fallback: TranslatedApiError): TranslatedApiError {
  const code = payload.error?.code ?? fallback.code;

  switch (code) {
    case "missing_input":
      return {
        code,
        kind: "file_upload",
        title: "Добавьте данные для анализа",
        message: "Загрузите CSV, XLS, XLSX или вставьте сырой текст."
      };
    case "unsupported_file_type":
      return {
        code,
        kind: "file_upload",
        title: "Этот формат не поддерживается",
        message: "Для MVP доступны только CSV, XLS и XLSX. Выберите другой файл или вставьте данные текстом."
      };
    case "file_too_large":
      return {
        code,
        kind: "file_upload",
        title: "Файл слишком большой",
        message: "Уменьшите файл до лимита MVP и попробуйте загрузить его снова."
      };
    case "empty_dataset":
      return {
        code,
        kind: "file_upload",
        title: "В файле нет данных",
        message: "Загрузите файл с непустыми строками и колонками или вставьте сырой текст."
      };
    case "parse_error":
      return {
        code,
        kind: "file_upload",
        title: "Не удалось прочитать файл",
        message: "Проверьте, что файл не поврежден и содержит обычную таблицу с заголовками."
      };
    case "session_not_found":
      return {
        code,
        kind: "ask",
        title: "Сессия данных не найдена",
        message: "Загрузите данные заново и повторите вопрос."
      };
    case "validation_error":
      return {
        code,
        kind: fallback.kind,
        title: "Запрос не прошел проверку",
        message: "Проверьте данные и попробуйте снова."
      };
    default:
      return {
        ...fallback,
        code,
        message: payload.error?.message ?? fallback.message
      };
  }
}
