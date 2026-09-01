import type { PreparedChart } from "../types/dashboard";
import { ChartRenderer } from "./ChartRenderer";
import { MascotEmptyPanel } from "./states";

interface ChartGridProps {
  charts: PreparedChart[];
  selectedLabel: string | null;
  onSelectLabel: (label: string | null) => void;
}

export function ChartGrid({ charts, selectedLabel, onSelectLabel }: ChartGridProps) {
  if (charts.length === 0) {
    return (
      <MascotEmptyPanel
        title="Графики не построены"
        message="AI не нашел надежную пару категориальной и числовой колонки для визуализации. Инсайт и вопросы могут использовать загруженный dataset, но графики скрыты."
      />
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
