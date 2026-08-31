import { Loader2, Send } from "lucide-react";
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
        ...current,
        {
          id: crypto.randomUUID(),
          question: trimmedQuestion,
          response
        }
      ]);
      setQuestion("");
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Question could not be answered.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex flex-col gap-1">
        <h2 className="text-lg font-semibold text-slate-950">Ask the data</h2>
        <p className="text-sm leading-6 text-slate-600">Answers are constrained to the uploaded dataset.</p>
      </div>

      <div className="mt-4 space-y-3">
        {messages.map((message) => (
          <div key={message.id} className="rounded-md border border-slate-200 bg-slate-50 p-4">
            <p className="text-sm font-semibold text-slate-950">{message.question}</p>
            <p className="mt-2 text-sm leading-6 text-slate-700">{message.response.answer}</p>
            <div className="mt-3 flex flex-wrap gap-2 text-xs text-slate-500">
              <span className="rounded-md bg-white px-2 py-1">Confidence: {message.response.confidence}</span>
              {message.response.used_columns.map((column) => (
                <span key={column} className="rounded-md bg-white px-2 py-1">
                  {column}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>

      {error && <p className="mt-4 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}

      <form onSubmit={handleSubmit} className="mt-4 flex flex-col gap-3 sm:flex-row">
        <input
          value={question}
          onChange={(event) => setQuestion(event.target.value)}
          className="min-h-11 flex-1 rounded-md border border-slate-300 px-3 text-sm outline-none transition focus:border-teal-500 focus:ring-4 focus:ring-teal-100"
          placeholder="Which segment has the highest revenue?"
        />
        <button
          type="submit"
          disabled={!question.trim() || isLoading}
          className="inline-flex h-11 items-center justify-center gap-2 rounded-md bg-slate-950 px-4 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-300"
        >
          {isLoading ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : <Send className="h-4 w-4" aria-hidden="true" />}
          Ask
        </button>
      </form>
    </section>
  );
}
