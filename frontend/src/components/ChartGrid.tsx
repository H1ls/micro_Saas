import type { PreparedChart } from "../types/dashboard";
import { ChartRenderer } from "./ChartRenderer";

interface ChartGridProps {
  charts: PreparedChart[];
}

export function ChartGrid({ charts }: ChartGridProps) {
  if (charts.length === 0) {
    return (
      <section className="rounded-lg border border-slate-200 bg-white p-6 text-sm text-slate-600 shadow-sm">
        No chartable category and numeric columns were found in this dataset.
      </section>
    );
  }

  return (
    <section className="grid gap-5 lg:grid-cols-2">
      {charts.map((chart) => (
        <ChartRenderer key={chart.spec.id} chart={chart} />
      ))}
    </section>
  );
}
