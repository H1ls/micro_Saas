import { Loader2, Send } from "lucide-react";
import { FormEvent, useState } from "react";
import { askDataset } from "../api/client";
import type { AskResponse } from "../types/dashboard";

interface AskPanelProps {
  sessionId: string;
}

export function AskPanel({ sessionId }: AskPanelProps) {
  const [question, setQuestion] = useState("");
  const [lastAnswer, setLastAnswer] = useState<AskResponse | null>(null);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmedQuestion = question.trim();
    if (!trimmedQuestion || isLoading) {
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const response = await askDataset({ session_id: sessionId, question: trimmedQuestion });
      setLastAnswer(response);
      setQuestion("");
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Не удалось ответить на вопрос.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <section className="flex min-h-0 flex-col gap-2 rounded-xl border border-[rgba(148,163,184,0.18)] bg-slate-950/20 px-4 py-3 shadow-[0_24px_80px_rgba(15,23,42,0.24)] ring-1 ring-white/25 backdrop-blur-2xl">
      <div className="min-h-[38px] overflow-hidden rounded-md border border-[rgba(148,163,184,0.14)] bg-white/42 px-3 py-2 shadow-inner shadow-white/20">
        {lastAnswer ? (
          <p className="line-clamp-2 text-sm leading-5 text-slate-800">{lastAnswer.answer}</p>
        ) : (
          <p className="text-sm leading-5 text-slate-600">Ответ появится здесь после вопроса.</p>
        )}
      </div>
      <div className="flex min-h-0 items-center gap-4">
        <h2 className="shrink-0 text-base font-semibold text-slate-950">Вопросы по данным</h2>
        <form onSubmit={handleSubmit} className="flex min-w-0 flex-1 items-center gap-2">
          <input
            value={question}
            onChange={(event) => setQuestion(event.target.value)}
            className="h-11 min-w-0 flex-1 rounded-md border border-[rgba(148,163,184,0.14)] bg-white/82 px-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-500 focus:border-[rgba(148,163,184,0.34)] focus:ring-4 focus:ring-slate-300/25"
            placeholder={error || "У какого сегмента самая высокая выручка?"}
            title={error}
          />
          <button
            type="submit"
            disabled={!question.trim() || isLoading}
            className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-md bg-slate-950 text-white shadow-lg shadow-slate-900/10 transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-300"
            aria-label="Задать вопрос"
            title="Задать вопрос"
          >
            {isLoading ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : <Send className="h-4 w-4" aria-hidden="true" />}
          </button>
        </form>
      </div>
    </section>
  );
}
