import { Database, FileText } from "lucide-react";
import type { ReactNode } from "react";
import type { AIAnalysis, DatasetSummary } from "../types/dashboard";

interface InsightHeroProps {
  analysis: AIAnalysis;
  dataset: DatasetSummary;
}

export function InsightHero({ analysis, dataset }: InsightHeroProps) {
  return (
    <section className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
        <div className="max-w-3xl">
          <p className="text-sm font-semibold uppercase tracking-wide text-teal-700">Main insight</p>
          <h2 className="mt-2 text-2xl font-semibold leading-tight text-slate-950">{analysis.headline}</h2>
          <p className="mt-3 text-sm leading-6 text-slate-600">{analysis.narrative}</p>
        </div>
        <div className="grid min-w-[220px] grid-cols-2 gap-3">
          <Metric icon={<Database className="h-4 w-4" />} label="Rows" value={dataset.row_count.toLocaleString()} />
          <Metric icon={<FileText className="h-4 w-4" />} label="Columns" value={dataset.column_count.toLocaleString()} />
        </div>
      </div>

      {analysis.observations.length > 0 && (
        <div className="mt-5 grid gap-3 md:grid-cols-2">
          {analysis.observations.slice(0, 4).map((observation) => (
            <div key={observation} className="rounded-md border border-slate-200 bg-slate-50 px-4 py-3 text-sm leading-6 text-slate-700">
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
    <div className="rounded-md border border-slate-200 bg-slate-50 p-3">
      <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-slate-500">
        {icon}
        {label}
      </div>
      <div className="mt-2 text-xl font-semibold text-slate-950">{value}</div>
    </div>
  );
}
