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
    <section className="flex min-h-0 flex-col gap-3 rounded-[28px] border border-[rgba(120,140,180,0.24)] bg-[rgba(219,226,238,0.72)] px-4 py-3 shadow-[0_24px_70px_rgba(31,45,70,0.16),inset_0_1px_0_rgba(255,255,255,0.58)] backdrop-blur-2xl">
      <div className="min-h-[38px] overflow-hidden rounded-2xl border border-[rgba(120,140,180,0.18)] bg-[rgba(248,250,253,0.72)] px-3 py-2 shadow-[inset_0_1px_0_rgba(255,255,255,0.62)]">
        {lastAnswer ? (
          <p className="line-clamp-2 text-sm leading-5 text-[#172033]">{lastAnswer.answer}</p>
        ) : (
          <p className="text-sm leading-5 text-[#667085]">Ответ появится здесь после вопроса.</p>
        )}
      </div>
      <div className="flex min-h-0 items-center gap-4">
        <h2 className="shrink-0 text-base font-semibold text-[#172033]">Вопросы по данным</h2>
        <form onSubmit={handleSubmit} className="flex min-w-0 flex-1 items-center gap-2">
          <input
            value={question}
            onChange={(event) => setQuestion(event.target.value)}
            className="h-11 min-w-0 flex-1 rounded-xl border border-[#E2E7EF] bg-white px-3 text-sm text-[#172033] outline-none transition placeholder:text-[#98A2B3] focus:border-[#C9D3E1] focus:ring-4 focus:ring-[#EEF4FF]"
            placeholder={error || "У какого сегмента самая высокая выручка?"}
            title={error}
          />
          <button
            type="submit"
            disabled={!question.trim() || isLoading}
            className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#356DF3] text-white shadow-[0_8px_30px_rgba(53,109,243,0.20)] transition hover:bg-[#2F61DA] disabled:cursor-not-allowed disabled:bg-[#CBD5E1] disabled:shadow-none"
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
