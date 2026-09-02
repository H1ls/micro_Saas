import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  LabelList,
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
type ChartRow = Record<string, ChartValue>;

export function ChartRenderer({ chart, selectedLabel, onSelectLabel }: ChartRendererProps) {
  const { spec, data } = chart;

  if (spec.y_key === null) {
    return (
      <article className="glass-panel grid h-full min-h-0 min-w-0 items-center gap-4 rounded-[28px] p-5 sm:grid-cols-[110px_1fr]">
        <img src="/fallback-empty-state.png" alt="" className="mx-auto max-h-32 w-full object-contain drop-shadow-[0_18px_28px_rgba(31,45,70,0.12)]" />
        <div>
          <h3 className="text-base font-semibold text-[#172033]">{spec.title}</h3>
          <p className="mt-3 text-sm text-[#667085]">Этот график нельзя построить без числовой колонки значений.</p>
        </div>
      </article>
    );
  }

  const valueKey = spec.y_key;
  const labelKey = spec.x_key;

  if (spec.type === "line") {
    return <LineChartView chartId={spec.id} title={spec.title} data={data} labelKey={labelKey} valueKey={valueKey} />;
  }

  if (spec.type === "pie") {
    return (
      <DonutChartView
        title={spec.title}
        data={data}
        labelKey={labelKey}
        valueKey={valueKey}
        selectedLabel={selectedLabel}
        onSelectLabel={onSelectLabel}
      />
    );
  }

  return (
    <BarChartView
      chartId={spec.id}
      title={spec.title}
      data={data}
      labelKey={labelKey}
      valueKey={valueKey}
      selectedLabel={selectedLabel}
      onSelectLabel={onSelectLabel}
    />
  );
}

function LineChartView({
  chartId,
  title,
  data,
  labelKey,
  valueKey,
}: {
  chartId: string;
  title: string;
  data: ChartRow[];
  labelKey: string;
  valueKey: string;
}) {
  const chartData = normalizeChartRows(data, valueKey);
  const safeChartId = chartId.replace(/[^a-zA-Z0-9_-]/g, "-");
  const strokeId = `${safeChartId}-line-stroke`;
  const areaId = `${safeChartId}-line-area`;

  return (
    <ChartFrame title={title}>
      <div className="relative h-[190px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{ top: 22, right: 18, left: -18, bottom: 36 }}>
            <defs>
              <linearGradient id={strokeId} x1="0" x2="1" y1="0" y2="0">
                <stop offset="0%" stopColor="#356DF3" />
                <stop offset="100%" stopColor="#8B5CF6" />
              </linearGradient>
              <linearGradient id={areaId} x1="0" x2="0" y1="0" y2="1">
                <stop offset="0%" stopColor="#4F7CFF" stopOpacity={0.18} />
                <stop offset="100%" stopColor="#8B5CF6" stopOpacity={0.02} />
              </linearGradient>
            </defs>
            <CartesianGrid stroke="rgba(120,140,180,0.13)" strokeWidth={0.6} strokeDasharray="2 10" vertical={false} />
            <XAxis dataKey={labelKey} tick={renderXAxisTick} tickLine={false} axisLine={false} interval={0} height={46} />
            <YAxis tick={hiddenYAxisTick} tickLine={false} axisLine={false} width={34} domain={[0, "dataMax"]} />
            <Tooltip
              content={<ChartTooltip labelKey={labelKey} valueKey={valueKey} />}
              cursor={{ stroke: "rgba(53,109,243,0.16)", strokeWidth: 1.5 }}
              offset={34}
              wrapperStyle={{ pointerEvents: "none" }}
            />
            <Area
              type="monotone"
              dataKey={valueKey}
              stroke={`url(#${strokeId})`}
              strokeWidth={3}
              fill={`url(#${areaId})`}
              dot={{ r: 3.2, fill: "#FFFFFF", stroke: "#4F7CFF", strokeWidth: 2 }}
              activeDot={{ r: 5.4, fill: "#FFFFFF", stroke: "#8B5CF6", strokeWidth: 2.5 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </ChartFrame>
  );
}

function DonutChartView({
  title,
  data,
  labelKey,
  valueKey,
  selectedLabel,
  onSelectLabel,
}: {
  title: string;
  data: ChartRow[];
  labelKey: string;
  valueKey: string;
  selectedLabel: string | null;
  onSelectLabel: (label: string | null) => void;
}) {
  const chartData = normalizeChartRows(data, valueKey);
  const total = getCenterMetric(chartData, valueKey);

  return (
    <ChartFrame title={title}>
      <div className="grid min-h-0 items-center gap-4 md:grid-cols-[minmax(150px,1fr)_minmax(120px,0.72fr)]">
        <div className="relative h-[190px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart margin={{ top: 4, right: 8, left: 8, bottom: 4 }}>
              <Tooltip
                content={<ChartTooltip labelKey={labelKey} valueKey={valueKey} total={total} />}
                offset={36}
                wrapperStyle={{ pointerEvents: "none" }}
              />
              <Pie
                data={chartData}
                dataKey={valueKey}
                nameKey={labelKey}
                innerRadius={54}
                outerRadius={76}
                paddingAngle={3}
                cornerRadius={8}
                onMouseLeave={() => onSelectLabel(null)}
              >
                {chartData.map((row, index) => {
                  const label = String(row[labelKey] ?? "");
                  const isMuted = Boolean(selectedLabel && selectedLabel !== label);
                  return (
                    <Cell
                      key={`${label}-${index}`}
                      fill={selectedLabel === label ? "#F5A524" : DONUT_COLORS[index % DONUT_COLORS.length]}
                      fillOpacity={isMuted ? 0.36 : 0.96}
                      stroke="rgba(255,255,255,0.9)"
                      strokeWidth={1.5}
                      onMouseEnter={() => onSelectLabel(label)}
                    />
                  );
                })}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <p className="text-2xl font-semibold text-[#172033]">{formatCompactValue(total)}</p>
              <p className="text-[11px] font-medium uppercase text-[#98A2B3]">Total</p>
            </div>
          </div>
        </div>

        <div className="flex min-w-0 flex-col gap-2">
          {chartData.slice(0, 6).map((row, index) => {
            const label = String(row[labelKey] ?? "");
            const value = Number(row[valueKey] ?? 0);
            const percent = total > 0 ? Math.round((value / total) * 100) : 0;
            const isMuted = Boolean(selectedLabel && selectedLabel !== label);
            return (
              <button
                key={`${label}-${index}`}
                type="button"
                onMouseEnter={() => onSelectLabel(label)}
                onMouseLeave={() => onSelectLabel(null)}
                className={`flex min-w-0 items-center gap-2 rounded-xl px-2 py-1.5 text-left transition ${isMuted ? "opacity-45" : "opacity-100"} hover:bg-white/48`}
              >
                <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ backgroundColor: DONUT_COLORS[index % DONUT_COLORS.length] }} />
                <span className="min-w-0 flex-1 truncate text-xs font-medium text-[#667085]">{label}</span>
                <span className="shrink-0 text-xs font-semibold text-[#172033]">{percent}%</span>
              </button>
            );
          })}
        </div>
      </div>
    </ChartFrame>
  );
}

function BarChartView({
  chartId,
  title,
  data,
  labelKey,
  valueKey,
  selectedLabel,
  onSelectLabel,
}: {
  chartId: string;
  title: string;
  data: ChartRow[];
  labelKey: string;
  valueKey: string;
  selectedLabel: string | null;
  onSelectLabel: (label: string | null) => void;
}) {
  const chartData = normalizeChartRows(data, valueKey);
  const useHorizontal = chartData.length > 7;
  const chartHeight = useHorizontal ? Math.max(190, chartData.length * 30 + 38) : 190;
  const topLabel = getTopLabel(chartData, labelKey, valueKey);
  const safeChartId = chartId.replace(/[^a-zA-Z0-9_-]/g, "-");
  const gradientId = `${safeChartId}-bar-gradient`;
  const activeGradientId = `${safeChartId}-bar-gradient-active`;

  return (
    <ChartFrame title={title}>
      <div className="w-full" style={{ height: chartHeight }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={chartData}
          layout={useHorizontal ? "vertical" : "horizontal"}
          margin={useHorizontal ? { top: 10, right: 34, left: 8, bottom: 10 } : { top: 20, right: 16, left: -18, bottom: 38 }}
          barCategoryGap={useHorizontal ? "28%" : "42%"}
          onMouseLeave={() => onSelectLabel(null)}
        >
          <defs>
            <linearGradient id={gradientId} x1="0" x2={useHorizontal ? "1" : "0"} y1={useHorizontal ? "0" : "1"} y2={useHorizontal ? "0" : "0"}>
              <stop offset="0%" stopColor="#4F7CFF" />
              <stop offset="58%" stopColor="#5B6CF9" />
              <stop offset="100%" stopColor="#8B5CF6" />
            </linearGradient>
            <linearGradient id={activeGradientId} x1="0" x2={useHorizontal ? "1" : "0"} y1={useHorizontal ? "0" : "1"} y2={useHorizontal ? "0" : "0"}>
              <stop offset="0%" stopColor="#45BFE8" />
              <stop offset="55%" stopColor="#4F7CFF" />
              <stop offset="100%" stopColor="#675FF5" />
            </linearGradient>
          </defs>
          <CartesianGrid stroke="rgba(120,140,180,0.13)" strokeWidth={0.6} strokeDasharray="2 10" vertical={false} />
          {useHorizontal ? (
            <>
              <XAxis type="number" tick={hiddenYAxisTick} tickLine={false} axisLine={false} domain={[0, "dataMax"]} />
              <YAxis dataKey={labelKey} type="category" width={86} tick={renderYAxisTick} tickLine={false} axisLine={false} interval={0} />
            </>
          ) : (
            <>
              <XAxis dataKey={labelKey} height={46} interval={0} tick={renderXAxisTick} tickLine={false} axisLine={false} minTickGap={8} />
              <YAxis tick={hiddenYAxisTick} tickLine={false} axisLine={false} width={34} domain={[0, "dataMax"]} />
            </>
          )}
          <Tooltip
            cursor={{ fill: "rgba(53,109,243,0.035)" }}
            content={<ChartTooltip labelKey={labelKey} valueKey={valueKey} />}
            offset={34}
            wrapperStyle={{ pointerEvents: "none" }}
          />
          <Bar dataKey={valueKey} minPointSize={3} radius={useHorizontal ? [0, 10, 10, 0] : [10, 10, 10, 10]} barSize={useHorizontal ? 16 : undefined} maxBarSize={useHorizontal ? 18 : 40}>
            {chartData.map((row, index) => {
              const label = String(row[labelKey] ?? "");
              const isActive = selectedLabel === label || (!selectedLabel && label === topLabel);
              const isMuted = Boolean(selectedLabel && selectedLabel !== label);
              return (
                <Cell
                  key={`${label}-${index}`}
                  fill={isActive ? `url(#${activeGradientId})` : `url(#${gradientId})`}
                  fillOpacity={isMuted ? 0.34 : isActive ? 0.98 : 0.78}
                  onMouseEnter={() => onSelectLabel(label)}
                />
              );
            })}
            <LabelList
              dataKey={valueKey}
              position={useHorizontal ? "right" : "top"}
              formatter={formatCompactValue}
              fill="#667085"
              fontSize={10}
              fontWeight={600}
            />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
      </div>
    </ChartFrame>
  );
}

interface ChartFrameProps {
  title: string;
  children: ReactNode;
}

function ChartFrame({ title, children }: ChartFrameProps) {
  return (
    <article className="glass-panel flex min-w-0 flex-col overflow-hidden rounded-[28px] p-5">
      <div className="mb-3 shrink-0">
        <h3 className="truncate text-sm font-semibold text-[#172033]">{title}</h3>
      </div>
      <div className="min-h-0 pt-1">{children}</div>
    </article>
  );
}

interface ChartTooltipProps {
  active?: boolean;
  payload?: Array<{ value?: ChartValue; payload?: ChartRow }>;
  labelKey: string;
  valueKey: string;
  total?: number;
}

function ChartTooltip({ active, payload, labelKey, valueKey, total }: ChartTooltipProps) {
  if (!active || !payload?.length) {
    return null;
  }

  const row = payload[0].payload ?? {};
  const value = row[valueKey];
  const numberValue = Number(value ?? 0);
  const percent = total && total > 0 && Number.isFinite(numberValue) ? Math.round((numberValue / total) * 100) : null;

  return (
    <div className="translate-x-8 -translate-y-8 rounded-2xl border border-white/70 bg-white/72 px-3 py-2 shadow-[0_14px_34px_rgba(31,45,70,0.14)] backdrop-blur-xl">
      <p className="max-w-[180px] truncate text-xs font-medium text-[#667085]">{String(row[labelKey] ?? "")}</p>
      <p className="mt-1 text-sm font-semibold text-[#172033]">{formatCompactValue(value)}</p>
      {percent !== null && <p className="mt-0.5 text-[11px] font-medium text-[#98A2B3]">{percent}% от total</p>}
    </div>
  );
}

function renderXAxisTick(props: { x?: number; y?: number; payload?: { value?: ChartValue } }) {
  const { x = 0, y = 0, payload } = props;
  const lines = wrapTickLabel(formatAxisLabel(payload?.value));
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

function renderYAxisTick(props: { x?: number; y?: number; payload?: { value?: ChartValue } }) {
  const { x = 0, y = 0, payload } = props;
  return (
    <text x={x - 6} y={y + 4} textAnchor="end" fill={axisTick.fill} fontSize={axisTick.fontSize} fontWeight={axisTick.fontWeight}>
      {truncateLabel(String(payload?.value ?? ""), 14)}
    </text>
  );
}

function formatAxisLabel(value: ChartValue | undefined): string {
  const raw = String(value ?? "");
  const isoDate = /^(\d{4})-(\d{2})-(\d{2})/.exec(raw);
  if (!isoDate) {
    return raw;
  }

  const month = Number(isoDate[2]);
  const day = isoDate[3];
  const monthLabels = ["янв", "фев", "мар", "апр", "май", "июн", "июл", "авг", "сен", "окт", "ноя", "дек"];
  return `${day} ${monthLabels[month - 1] ?? ""}`.trim();
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

function truncateLabel(value: string, maxLength: number): string {
  return value.length > maxLength ? `${value.slice(0, maxLength - 1)}…` : value;
}

function normalizeChartRows(data: ChartRow[], valueKey: string): ChartRow[] {
  return data.map((row) => {
    const rawValue = row[valueKey];
    const numericValue = typeof rawValue === "number" ? rawValue : Number(String(rawValue ?? "").replace(/\s/g, "").replace(",", "."));
    return {
      ...row,
      [valueKey]: Number.isFinite(numericValue) ? numericValue : 0,
    };
  });
}

function getCenterMetric(data: ChartRow[], valueKey: string): number {
  return data.reduce((sum, row) => sum + Number(row[valueKey] ?? 0), 0);
}

function getTopLabel(data: ChartRow[], labelKey: string, valueKey: string): string | null {
  const top = data.reduce<ChartRow | null>((currentTop, row) => {
    if (!currentTop) {
      return row;
    }
    return Number(row[valueKey] ?? 0) > Number(currentTop[valueKey] ?? 0) ? row : currentTop;
  }, null);
  return top ? String(top[labelKey] ?? "") : null;
}

function formatCompactValue(value: ChartValue): string {
  const numberValue = Number(value);
  if (!Number.isFinite(numberValue)) {
    return String(value ?? "");
  }
  return new Intl.NumberFormat("ru-RU", { maximumFractionDigits: 1, notation: "compact" }).format(numberValue);
}

const axisTick = { fill: "#667085", fontSize: 11, fontWeight: 500 };
const hiddenYAxisTick = { fill: "rgba(102,112,133,0.34)", fontSize: 10, fontWeight: 500 };
const DONUT_COLORS = ["#356DF3", "#5B6CF9", "#45BFE8", "#8267F5"];
