import type { AnalyzeResponse, ApiErrorResponse } from "../types/dashboard";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "http://127.0.0.1:8000";

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
    let message = "Analysis failed. Check the dataset and try again.";

    try {
      const payload = (await response.json()) as ApiErrorResponse;
      message = payload.error?.message ?? message;
    } catch {
      message = response.statusText || message;
    }

    throw new Error(message);
  }

  return response.json() as Promise<AnalyzeResponse>;
}
