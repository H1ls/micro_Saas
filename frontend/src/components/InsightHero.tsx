import { Sparkles } from "lucide-react";
import type { AIAnalysis } from "../types/dashboard";

interface InsightHeroProps {
  analysis: AIAnalysis;
}

export function InsightHero({ analysis }: InsightHeroProps) {
  return (
    <section className="glass-panel glass-key insight-slide flex w-full items-start gap-4 rounded-[28px] px-5 py-5 text-left">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#EEF4FF] text-[#356DF3]">
        <Sparkles className="h-5 w-5" aria-hidden="true" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-xs font-semibold uppercase tracking-wide text-[#356DF3]">Главный инсайт</p>
        <p className="text-[18px] font-semibold leading-7 text-[#172033] sm:text-[20px]">
          {analysis.insight_summary}
        </p>
      </div>
    </section>
  );
}
