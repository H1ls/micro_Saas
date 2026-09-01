import type { PreparedChart } from "../types/dashboard";
import { ChartRenderer } from "./ChartRenderer";

interface ChartGridProps {
  charts: PreparedChart[];
}

export function ChartGrid({ charts }: ChartGridProps) {
  if (charts.length === 0) {
    return (
      <section className="flex min-h-0 items-center justify-center rounded-lg border border-amber-200/80 bg-amber-50/55 p-6 text-center text-sm leading-6 text-amber-900 shadow-xl shadow-amber-900/5 backdrop-blur-2xl">
        Не найдены подходящие категориальные и числовые колонки для графиков. Инсайт и вопросы всё еще могут использовать контекст загруженного dataset.
      </section>
    );
  }

  return (
    <section className="grid min-h-0 gap-4" style={{ gridTemplateColumns: `repeat(${Math.min(charts.length, 3)}, minmax(0, 1fr))` }}>
      {charts.slice(0, 3).map((chart) => (
        <ChartRenderer key={chart.spec.id} chart={chart} />
      ))}
    </section>
  );
}
