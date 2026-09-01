import { Sparkles } from "lucide-react";
import type { AIAnalysis } from "../types/dashboard";

interface InsightHeroProps {
  analysis: AIAnalysis;
}

export function InsightHero({ analysis }: InsightHeroProps) {
  return (
    <section className="insight-slide flex min-h-0 items-center gap-4 overflow-hidden rounded-lg border border-white/60 bg-white/42 px-5 py-4 shadow-2xl shadow-slate-900/10 backdrop-blur-2xl">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-teal-600/90 text-white shadow-lg shadow-teal-900/10">
        <Sparkles className="h-5 w-5" aria-hidden="true" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-xs font-semibold uppercase tracking-wide text-teal-700">Главный инсайт</p>
        <p className="truncate text-[20px] font-semibold leading-7 text-slate-950">{analysis.insight_summary}</p>
      </div>
    </section>
  );
}
