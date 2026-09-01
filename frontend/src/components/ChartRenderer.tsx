import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  LabelList,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from "recharts";
import type { ReactNode } from "react";
import type { PreparedChart } from "../types/dashboard";

interface ChartRendererProps {
  chart: PreparedChart;
  selectedLabel: string | null;
  onSelectLabel: (label: string | null) => void;
}

type ChartValue = string | number | null;

export function ChartRenderer({ chart, selectedLabel, onSelectLabel }: ChartRendererProps) {
  const { spec, data } = chart;

  if (spec.y_key === null) {
    return (
      <article className="rounded-lg border border-white/60 bg-white/45 p-4 shadow-xl shadow-slate-900/10 backdrop-blur-2xl">
        <h3 className="text-base font-semibold text-slate-950">{spec.title}</h3>
        <p className="mt-3 text-sm text-slate-600">Этот график нельзя построить без числовой колонки значений.</p>
      </article>
    );
  }

  const valueKey = spec.y_key;
  const labelKey = spec.x_key;
  const centerMetric = getCenterMetric(data, valueKey);

  if (spec.type === "line") {
    return (
      <ChartFrame title={spec.title}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 14, right: 18, left: -8, bottom: 30 }}>
            <CartesianGrid stroke="rgba(100, 116, 139, 0.18)" strokeDasharray="3 8" vertical={false} />
            <XAxis dataKey={labelKey} tick={axisTick} tickLine={false} axisLine={false} interval="preserveStartEnd" />
            <YAxis tick={axisTick} tickLine={false} axisLine={false} width={50} />
            <Tooltip content={<ChartTooltip labelKey={labelKey} valueKey={valueKey} />} cursor={{ stroke: "rgba(20, 184, 166, 0.24)", strokeWidth: 2 }} />
            <Line
              type="monotone"
              dataKey={valueKey}
              stroke="#334155"
              strokeWidth={3}
              dot={{ r: 3, fill: "#14b8a6", strokeWidth: 0 }}
              activeDot={{ r: 5, fill: "#f59e0b", stroke: "#fff", strokeWidth: 2 }}
            >
              <LabelList dataKey={valueKey} position="top" formatter={formatCompactValue} fill="#475569" fontSize={11} />
            </Line>
          </LineChart>
        </ResponsiveContainer>
      </ChartFrame>
    );
  }

  if (spec.type === "pie") {
    return (
      <ChartFrame title={spec.title}>
        <div className="relative h-full min-h-0">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart margin={{ top: 4, right: 8, left: 8, bottom: 4 }}>
              <Tooltip content={<ChartTooltip labelKey={labelKey} valueKey={valueKey} />} />
              <Pie
                data={data}
                dataKey={valueKey}
                nameKey={labelKey}
                innerRadius="58%"
                outerRadius="82%"
                paddingAngle={3}
                onMouseLeave={() => onSelectLabel(null)}
              >
                {data.map((row, index) => {
                  const label = String(row[labelKey] ?? "");
                  const isMuted = Boolean(selectedLabel && selectedLabel !== label);
                  return (
                    <Cell
                      key={`${spec.id}-${index}`}
                      fill={PIE_COLORS[index % PIE_COLORS.length]}
                      fillOpacity={isMuted ? 0.28 : 0.92}
                      stroke={selectedLabel === label ? "#f59e0b" : "rgba(255,255,255,0.78)"}
                      strokeWidth={selectedLabel === label ? 3 : 1}
                      onMouseEnter={() => onSelectLabel(label)}
                    />
                  );
                })}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <p className="text-[11px] font-medium uppercase text-slate-400">Итого</p>
              <p className="text-lg font-semibold text-slate-900">{formatCompactValue(centerMetric)}</p>
            </div>
          </div>
        </div>
      </ChartFrame>
    );
  }

  return (
    <ChartFrame title={spec.title}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 16, right: 12, left: -8, bottom: 34 }} onMouseLeave={() => onSelectLabel(null)}>
          <CartesianGrid stroke="rgba(100, 116, 139, 0.16)" strokeDasharray="3 8" vertical={false} />
          <XAxis
            dataKey={labelKey}
            height={42}
            interval={0}
            tick={axisTick}
            tickLine={false}
            axisLine={false}
            minTickGap={8}
          />
          <YAxis tick={axisTick} tickLine={false} axisLine={false} width={50} />
          <Tooltip cursor={{ fill: "rgba(15, 23, 42, 0.035)" }} content={<ChartTooltip labelKey={labelKey} valueKey={valueKey} />} />
          <Bar dataKey={valueKey} radius={[7, 7, 7, 7]} maxBarSize={54}>
            {data.map((row, index) => {
              const label = String(row[labelKey] ?? "");
              const isMuted = Boolean(selectedLabel && selectedLabel !== label);
              return (
                <Cell
                  key={`${spec.id}-${index}`}
                  fill={selectedLabel === label ? "#f59e0b" : BAR_COLORS[index % BAR_COLORS.length]}
                  fillOpacity={isMuted ? 0.32 : 0.92}
                  onMouseEnter={() => onSelectLabel(label)}
                />
              );
            })}
            <LabelList dataKey={valueKey} position="top" formatter={formatCompactValue} fill="#475569" fontSize={11} />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </ChartFrame>
  );
}

interface ChartFrameProps {
  title: string;
  children: ReactNode;
}

function ChartFrame({ title, children }: ChartFrameProps) {
  return (
    <article className="flex min-h-0 flex-col overflow-hidden rounded-lg border border-white/60 bg-white/46 p-4 shadow-2xl shadow-slate-950/8 backdrop-blur-2xl transition duration-300 hover:-translate-y-0.5 hover:bg-white/58">
      <div className="mb-2 shrink-0">
        <h3 className="truncate text-sm font-semibold text-slate-950">{title}</h3>
      </div>
      <div className="min-h-0 flex-1 pt-1">{children}</div>
    </article>
  );
}

interface ChartTooltipProps {
  active?: boolean;
  payload?: Array<{ value?: ChartValue; payload?: Record<string, ChartValue> }>;
  labelKey: string;
  valueKey: string;
}

function ChartTooltip({ active, payload, labelKey, valueKey }: ChartTooltipProps) {
  if (!active || !payload?.length) {
    return null;
  }

  const row = payload[0].payload ?? {};
  return (
    <div className="rounded-md border border-white/70 bg-white/88 px-3 py-2 shadow-2xl shadow-slate-950/12 backdrop-blur-2xl">
      <p className="max-w-[180px] truncate text-xs font-medium text-slate-500">{String(row[labelKey] ?? "")}</p>
      <p className="mt-1 text-sm font-semibold text-slate-950">{formatCompactValue(row[valueKey])}</p>
    </div>
  );
}

function getCenterMetric(data: Array<Record<string, ChartValue>>, valueKey: string): number {
  return data.reduce((sum, row) => sum + Number(row[valueKey] ?? 0), 0);
}

function formatCompactValue(value: ChartValue): string {
  const numberValue = Number(value);
  if (!Number.isFinite(numberValue)) {
    return String(value ?? "");
  }
  return new Intl.NumberFormat("ru-RU", { maximumFractionDigits: 1, notation: "compact" }).format(numberValue);
}

const axisTick = { fill: "#64748b", fontSize: 11 };
const BAR_COLORS = ["#334155", "#475569", "#64748b", "#14b8a6", "#f59e0b", "#fb7185"];
const PIE_COLORS = ["#334155", "#14b8a6", "#f59e0b", "#fb7185", "#64748b", "#0f766e"];
