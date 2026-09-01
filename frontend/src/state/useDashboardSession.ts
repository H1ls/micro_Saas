import { useCallback, useState } from "react";
import { analyzeDataset, type AnalyzeInput } from "../api/client";
import type { AnalyzeResponse } from "../types/dashboard";

type DashboardStatus = "idle" | "loading" | "ready" | "error";

export function useDashboardSession() {
  const [status, setStatus] = useState<DashboardStatus>("idle");
  const [session, setSession] = useState<AnalyzeResponse | null>(null);
  const [error, setError] = useState<string>("");
  const [lastInput, setLastInput] = useState<AnalyzeInput | null>(null);

  const analyze = useCallback(async (input: AnalyzeInput) => {
    setStatus("loading");
    setError("");
    setLastInput(input);

    try {
      const result = await analyzeDataset(input);
      setSession(result);
      setStatus("ready");
    } catch (caught) {
      setSession(null);
      setError(caught instanceof Error ? caught.message : "Не удалось проанализировать dataset.");
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
    setError("");
    setLastInput(null);
  }, []);

  return { analyze, retryLastAnalysis, reset, session, status, error };
}
