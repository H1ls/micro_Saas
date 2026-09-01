import { Loader2, Send } from "lucide-react";
import { FormEvent, useState } from "react";
import { askDataset } from "../api/client";

interface AskPanelProps {
  sessionId: string;
}

export function AskPanel({ sessionId }: AskPanelProps) {
  const [question, setQuestion] = useState("");
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
      await askDataset({ session_id: sessionId, question: trimmedQuestion });
      setQuestion("");
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Не удалось ответить на вопрос.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <section className="flex min-h-0 items-center gap-4 rounded-lg border border-white/60 bg-white/42 px-4 py-3 shadow-2xl shadow-slate-900/10 backdrop-blur-2xl">
      <h2 className="shrink-0 text-base font-semibold text-slate-950">Вопросы по данным</h2>
      <form onSubmit={handleSubmit} className="flex min-w-0 flex-1 items-center gap-2">
        <input
          value={question}
          onChange={(event) => setQuestion(event.target.value)}
          className="h-11 min-w-0 flex-1 rounded-md border border-white/70 bg-white/55 px-3 text-sm outline-none transition focus:border-teal-500 focus:ring-4 focus:ring-teal-100"
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
    </section>
  );
}
