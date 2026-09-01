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
      <article className="grid h-full min-h-0 items-center gap-4 rounded-lg border border-white/60 bg-white/45 p-4 shadow-[0_24px_80px_rgba(35,54,73,0.14)] backdrop-blur-2xl sm:grid-cols-[110px_1fr]">
        <img src="/fallback-empty-state.png" alt="" className="mx-auto max-h-32 w-full object-contain drop-shadow-[0_18px_28px_rgba(32,72,88,0.16)]" />
        <div>
        <h3 className="text-base font-semibold text-slate-950">{spec.title}</h3>
        <p className="mt-3 text-sm text-slate-600">Этот график нельзя построить без числовой колонки значений.</p>
        </div>
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
          <LineChart data={data} margin={{ top: 18, right: 18, left: -16, bottom: 64 }}>
            <CartesianGrid stroke="rgba(100, 116, 139, 0.10)" strokeWidth={0.7} strokeDasharray="2 10" vertical={false} />
            <XAxis dataKey={labelKey} tick={renderXAxisTick} tickLine={false} axisLine={false} interval={0} height={72} />
            <YAxis tick={hiddenYAxisTick} tickLine={false} axisLine={false} width={34} />
            <Tooltip
              content={<ChartTooltip labelKey={labelKey} valueKey={valueKey} />}
              cursor={{ stroke: "rgba(20, 184, 166, 0.24)", strokeWidth: 2 }}
              offset={28}
              wrapperStyle={{ pointerEvents: "none" }}
            />
            <Line
              type="monotone"
              dataKey={valueKey}
              stroke="#0f766e"
              strokeWidth={3}
              dot={{ r: 3, fill: "#14b8a6", strokeWidth: 0 }}
              activeDot={{ r: 5, fill: "#f59e0b", stroke: "#fff", strokeWidth: 2 }}
            />
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
            <PieChart margin={{ top: 8, right: 18, left: 18, bottom: 8 }}>
              <Tooltip
                content={<ChartTooltip labelKey={labelKey} valueKey={valueKey} />}
                offset={34}
                wrapperStyle={{ pointerEvents: "none" }}
              />
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
                      fill={selectedLabel === label ? "#f59e0b" : PIE_COLORS[index % PIE_COLORS.length]}
                      fillOpacity={isMuted ? 0.38 : 0.94}
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
        <BarChart data={data} margin={{ top: 28, right: 14, left: -18, bottom: 64 }} onMouseLeave={() => onSelectLabel(null)}>
          <CartesianGrid stroke="rgba(100, 116, 139, 0.10)" strokeWidth={0.7} strokeDasharray="2 10" vertical={false} />
          <XAxis
            dataKey={labelKey}
            height={72}
            interval={0}
            tick={renderXAxisTick}
            tickLine={false}
            axisLine={false}
            minTickGap={8}
          />
          <YAxis tick={hiddenYAxisTick} tickLine={false} axisLine={false} width={34} />
          <Tooltip
            cursor={{ fill: "rgba(15, 23, 42, 0.035)" }}
            content={<ChartTooltip labelKey={labelKey} valueKey={valueKey} />}
            offset={30}
            wrapperStyle={{ pointerEvents: "none" }}
          />
          <Bar dataKey={valueKey} radius={[9, 9, 9, 9]} maxBarSize={54}>
            {data.map((row, index) => {
              const label = String(row[labelKey] ?? "");
              const isMuted = Boolean(selectedLabel && selectedLabel !== label);
              return (
                <Cell
                  key={`${spec.id}-${index}`}
                  fill={selectedLabel === label ? "#f59e0b" : index % 3 === 0 ? "#14b8a6" : index % 3 === 1 ? "#0f766e" : "#475569"}
                  fillOpacity={isMuted ? 0.34 : 0.94}
                  onMouseEnter={() => onSelectLabel(label)}
                />
              );
            })}
            <LabelList dataKey={valueKey} position="top" formatter={formatCompactValue} fill="#334155" fontSize={10} />
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
    <article className="flex min-h-0 flex-col overflow-hidden rounded-lg border border-[rgba(148,163,184,0.14)] bg-white/90 p-4 shadow-xl shadow-slate-900/10 backdrop-blur-2xl">
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
    <div className="translate-x-8 -translate-y-8 rounded-md border border-slate-200 bg-white px-3 py-2 shadow-[0_16px_38px_rgba(15,23,42,0.18)]">
      <p className="max-w-[180px] truncate text-xs font-medium text-slate-600">{String(row[labelKey] ?? "")}</p>
      <p className="mt-1 text-sm font-semibold text-slate-950">{formatCompactValue(row[valueKey])}</p>
    </div>
  );
}

function renderXAxisTick(props: { x?: number; y?: number; payload?: { value?: ChartValue } }) {
  const { x = 0, y = 0, payload } = props;
  const lines = wrapTickLabel(String(payload?.value ?? ""));
  return (
    <g transform={`translate(${x},${y + 8})`}>
      {lines.map((line, index) => (
        <text
          key={`${line}-${index}`}
          x={0}
          y={index * 13}
          textAnchor="middle"
          fill={axisTick.fill}
          fontSize={axisTick.fontSize}
          fontWeight={axisTick.fontWeight}
        >
          {line}
        </text>
      ))}
    </g>
  );
}

function wrapTickLabel(value: string): string[] {
  if (value.length <= 12) {
    return [value];
  }

  const words = value.split(/\s+/).filter(Boolean);
  if (words.length < 2) {
    return value.match(/.{1,12}/g) ?? [value];
  }

  const lines: string[] = [];
  let currentLine = "";
  for (const word of words) {
    const nextLine = currentLine ? `${currentLine} ${word}` : word;
    if (nextLine.length > 14 && currentLine) {
      lines.push(currentLine);
      currentLine = word;
    } else {
      currentLine = nextLine;
    }
    if (lines.length === 3) {
      break;
    }
  }
  if (currentLine && lines.length < 3) {
    lines.push(currentLine);
  }
  return lines.slice(0, 3);
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

const axisTick = { fill: "#334155", fontSize: 11, fontWeight: 500 };
const hiddenYAxisTick = { fill: "rgba(71, 85, 105, 0.26)", fontSize: 10 };
const PIE_COLORS = ["#0f766e", "#14b8a6", "#334155", "#475569", "#64748b", "#0f766e"];
