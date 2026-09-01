import { Loader2, MessageSquare, Send } from "lucide-react";
import { FormEvent, useState } from "react";
import { askDataset } from "../api/client";
import type { AskResponse } from "../types/dashboard";

interface AskPanelProps {
  sessionId: string;
}

interface ChatMessage {
  id: string;
  question: string;
  response: AskResponse;
}

export function AskPanel({ sessionId }: AskPanelProps) {
  const [question, setQuestion] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
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
      setMessages((current) => [
        ...current.slice(-2),
        {
          id: crypto.randomUUID(),
          question: trimmedQuestion,
          response
        }
      ]);
      setQuestion("");
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Не удалось ответить на вопрос.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <section className="flex min-h-0 flex-col rounded-lg border border-white/60 bg-white/42 p-4 shadow-2xl shadow-slate-900/10 backdrop-blur-2xl">
      <div className="flex items-center justify-between gap-4">
        <div className="min-w-0">
          <h2 className="truncate text-base font-semibold text-slate-950">Вопросы по данным</h2>
          <p className="truncate text-xs text-slate-600">Ответы ограничены загруженным dataset.</p>
        </div>
        <MessageSquare className="h-5 w-5 shrink-0 text-teal-700" aria-hidden="true" />
      </div>

      <div className="mt-3 grid min-h-0 flex-1 gap-2 md:grid-cols-[minmax(0,1fr)_420px]">
        <div className="min-h-0 overflow-hidden">
          {messages.length === 0 && !error && (
            <div className="flex h-full items-center rounded-md border border-white/60 bg-white/35 px-3 text-sm text-slate-600">
              Задайте вопрос, на который можно ответить по загруженным колонкам и строкам.
            </div>
          )}
          {messages.slice(-1).map((message) => (
            <div key={message.id} className="h-full rounded-md border border-white/60 bg-white/35 p-3">
              <p className="truncate text-sm font-semibold text-slate-950">{message.question}</p>
              <p className="mt-1 line-clamp-2 text-sm leading-6 text-slate-700">{displayAnswer(message.response.answer)}</p>
            </div>
          ))}
          {error && (
            <p className="h-full rounded-md border border-red-200 bg-red-50/80 px-3 py-2 text-sm leading-6 text-red-700">
              {error}
            </p>
          )}
        </div>

        <form onSubmit={handleSubmit} className="flex min-w-0 items-center gap-2">
          <input
            value={question}
            onChange={(event) => setQuestion(event.target.value)}
            className="h-11 min-w-0 flex-1 rounded-md border border-white/70 bg-white/55 px-3 text-sm outline-none transition focus:border-teal-500 focus:ring-4 focus:ring-teal-100"
            placeholder="У какого сегмента самая высокая выручка?"
          />
          <button
            type="submit"
            disabled={!question.trim() || isLoading}
            className="inline-flex h-11 shrink-0 items-center justify-center gap-2 rounded-md bg-slate-950 px-4 text-sm font-semibold text-white shadow-lg shadow-slate-900/10 transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-300"
          >
            {isLoading ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : <Send className="h-4 w-4" aria-hidden="true" />}
            Спросить
          </button>
        </form>
      </div>
    </section>
  );
}

function displayAnswer(answer: string): string {
  if (answer === "I cannot answer this from the uploaded dataset.") {
    return "Не могу ответить на это по загруженному dataset.";
  }
  return answer;
}
