import { Sparkles } from "lucide-react";
import { useState } from "react";
import type { AIAnalysis } from "../types/dashboard";

interface InsightHeroProps {
  analysis: AIAnalysis;
}

export function InsightHero({ analysis }: InsightHeroProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <button
      type="button"
      onClick={() => setIsExpanded((current) => !current)}
      className={`insight-slide flex min-h-0 w-full items-center gap-4 overflow-hidden rounded-lg border border-white/60 bg-white/48 px-5 py-4 text-left shadow-2xl shadow-slate-950/8 backdrop-blur-2xl transition-[max-height,background-color] duration-300 hover:bg-white/56 ${
        isExpanded ? "max-h-44" : "max-h-[72px]"
      }`}
      aria-expanded={isExpanded}
      title={isExpanded ? "Свернуть главный инсайт" : "Показать весь главный инсайт"}
    >
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-slate-900 text-white shadow-lg shadow-slate-950/10">
        <Sparkles className="h-5 w-5" aria-hidden="true" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-xs font-semibold uppercase tracking-wide text-teal-700">Главный инсайт</p>
        <p className={`${isExpanded ? "line-clamp-none" : "truncate"} text-[20px] font-semibold leading-7 text-slate-950`}>
          {analysis.insight_summary}
        </p>
      </div>
    </button>
  );
}
