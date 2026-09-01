import { useCallback, useState } from "react";
import { ApiClientError, analyzeDataset, type AnalyzeInput, type TranslatedApiError } from "../api/client";
import type { AnalyzeResponse } from "../types/dashboard";

type DashboardStatus = "idle" | "loading" | "ready" | "error";

const DEFAULT_ANALYZE_ERROR: TranslatedApiError = {
  code: "analyze_failed",
  kind: "generic",
  title: "Не удалось проанализировать данные",
  message: "Проверьте данные и попробуйте снова."
};

export function useDashboardSession() {
  const [status, setStatus] = useState<DashboardStatus>("idle");
  const [session, setSession] = useState<AnalyzeResponse | null>(null);
  const [error, setError] = useState<TranslatedApiError | null>(null);
  const [lastInput, setLastInput] = useState<AnalyzeInput | null>(null);

  const analyze = useCallback(async (input: AnalyzeInput) => {
    setStatus("loading");
    setError(null);
    setLastInput(input);

    try {
      const result = await analyzeDataset(input);
      setSession(result);
      setStatus("ready");
    } catch (caught) {
      setSession(null);
      setError(caught instanceof ApiClientError ? caught.details : DEFAULT_ANALYZE_ERROR);
      setStatus("error");
    }
  }, []);

  const retryLastAnalysis = useCallback(() => {
    if (!lastInput) {
      return;
    }

    void analyze(lastInput);
  }, [analyze, lastInput]);

  const reset = useCallback(() => {
    setStatus("idle");
    setSession(null);
    setError(null);
    setLastInput(null);
  }, []);

  return { analyze, retryLastAnalysis, reset, session, status, error };
}
