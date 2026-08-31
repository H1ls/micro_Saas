import type { PreparedChart } from "../types/dashboard";
import { ChartRenderer } from "./ChartRenderer";

interface ChartGridProps {
  charts: PreparedChart[];
}

export function ChartGrid({ charts }: ChartGridProps) {
  if (charts.length === 0) {
    return (
      <section className="rounded-lg border border-amber-200 bg-amber-50 p-6 text-sm leading-6 text-amber-900 shadow-sm">
        No chartable category and numeric columns were found. The insight and Ask panel can still use the uploaded dataset context.
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
