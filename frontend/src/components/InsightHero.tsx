import { Database, FileText, Sparkles } from "lucide-react";
import type { ReactNode } from "react";
import type { AIAnalysis, DatasetSummary } from "../types/dashboard";

interface InsightHeroProps {
  analysis: AIAnalysis;
  dataset: DatasetSummary;
}

export function InsightHero({ analysis, dataset }: InsightHeroProps) {
  return (
    <section className="insight-slide flex min-h-0 flex-col overflow-hidden rounded-lg border border-white/60 bg-white/42 p-5 shadow-2xl shadow-slate-900/10 backdrop-blur-2xl">
      <div className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-teal-700">
        <Sparkles className="h-4 w-4" aria-hidden="true" />
        Главный инсайт
      </div>

      <div className="mt-4 min-h-0 flex-1">
        <h2 className="text-balance text-[clamp(1.5rem,2.3vw,2.75rem)] font-semibold leading-tight text-slate-950">
          {analysis.headline}
        </h2>
        <p className="mt-4 rounded-lg border border-white/60 bg-white/50 p-4 text-[clamp(1rem,1.25vw,1.35rem)] font-medium leading-7 text-slate-800 shadow-sm">
          {analysis.insight_summary}
        </p>
        <p className="mt-4 line-clamp-4 text-sm leading-6 text-slate-600">{analysis.narrative}</p>
      </div>

      <div className="mt-4 grid shrink-0 grid-cols-2 gap-3">
        <Metric icon={<Database className="h-4 w-4" />} label="Строки" value={dataset.row_count.toLocaleString()} />
        <Metric icon={<FileText className="h-4 w-4" />} label="Колонки" value={dataset.column_count.toLocaleString()} />
      </div>

      {analysis.key_observations.length > 0 && (
        <div className="mt-3 grid shrink-0 gap-2">
          {analysis.key_observations.slice(0, 2).map((observation) => (
            <div key={observation} className="truncate rounded-md border border-white/60 bg-white/40 px-3 py-2 text-sm text-slate-700">
              {observation}
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

interface MetricProps {
  icon: ReactNode;
  label: string;
  value: string;
}

function Metric({ icon, label, value }: MetricProps) {
  return (
    <div className="rounded-md border border-white/60 bg-white/45 p-3 shadow-sm backdrop-blur-xl">
      <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-slate-500">
        {icon}
        {label}
      </div>
      <div className="mt-2 text-xl font-semibold text-slate-950">{value}</div>
    </div>
  );
}
