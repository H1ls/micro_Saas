import type { PreparedChart } from "../types/dashboard";
import { ChartRenderer } from "./ChartRenderer";

interface ChartGridProps {
  charts: PreparedChart[];
  selectedLabel: string | null;
  onSelectLabel: (label: string | null) => void;
}

export function ChartGrid({ charts, selectedLabel, onSelectLabel }: ChartGridProps) {
  if (charts.length === 0) {
    return (
      <section className="flex min-h-0 items-center justify-center rounded-lg border border-amber-200/70 bg-amber-50/50 p-6 text-center text-sm leading-6 text-amber-950 shadow-xl shadow-amber-950/5 backdrop-blur-2xl">
        Не найдены подходящие категориальные и числовые колонки для графиков. Инсайт и вопросы все еще могут использовать контекст загруженного dataset.
      </section>
    );
  }

  return (
    <section className="grid h-full min-h-0 gap-4" style={{ gridTemplateColumns: `repeat(${Math.min(charts.length, 3)}, minmax(0, 1fr))` }}>
      {charts.slice(0, 3).map((chart) => (
        <ChartRenderer
          key={chart.spec.id}
          chart={chart}
          selectedLabel={selectedLabel}
          onSelectLabel={onSelectLabel}
        />
      ))}
    </section>
  );
}
