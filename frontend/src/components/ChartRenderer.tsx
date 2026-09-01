import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
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
}

export function ChartRenderer({ chart }: ChartRendererProps) {
  const { spec, data } = chart;

  if (spec.y_key === null) {
    return (
      <article className="rounded-lg border border-white/60 bg-white/45 p-4 shadow-xl shadow-slate-900/10 backdrop-blur-2xl">
        <h3 className="text-base font-semibold text-slate-950">{spec.title}</h3>
        <p className="mt-3 text-sm text-slate-600">Этот график нельзя построить без числовой колонки значений.</p>
      </article>
    );
  }

  if (spec.type === "line") {
    return (
      <ChartFrame title={spec.title} reason={spec.reason}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 8, right: 8, left: -8, bottom: 10 }}>
            <CartesianGrid stroke="rgba(148, 163, 184, 0.45)" strokeDasharray="4 4" vertical={false} />
            <XAxis dataKey={spec.x_key} tick={{ fill: "#475569", fontSize: 11 }} tickLine={false} />
            <YAxis tick={{ fill: "#475569", fontSize: 11 }} tickLine={false} width={56} />
            <Tooltip contentStyle={tooltipStyle} />
            <Line type="monotone" dataKey={spec.y_key} stroke="#2563eb" strokeWidth={3} dot={{ r: 3 }} />
          </LineChart>
        </ResponsiveContainer>
      </ChartFrame>
    );
  }

  if (spec.type === "pie") {
    return (
      <ChartFrame title={spec.title} reason={spec.reason}>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Tooltip contentStyle={tooltipStyle} />
            <Pie data={data} dataKey={spec.y_key} nameKey={spec.x_key} innerRadius="48%" outerRadius="78%" paddingAngle={2}>
              {data.map((_, index) => (
                <Cell key={`${spec.id}-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
      </ChartFrame>
    );
  }

  return (
    <ChartFrame title={spec.title} reason={spec.reason}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 8, right: 8, left: -8, bottom: 10 }}>
          <CartesianGrid stroke="rgba(148, 163, 184, 0.45)" strokeDasharray="4 4" vertical={false} />
          <XAxis
            dataKey={spec.x_key}
            angle={-18}
            height={54}
            interval={0}
            tick={{ fill: "#475569", fontSize: 11 }}
            tickLine={false}
          />
          <YAxis tick={{ fill: "#475569", fontSize: 11 }} tickLine={false} width={56} />
          <Tooltip cursor={{ fill: "rgba(241, 245, 249, 0.55)" }} contentStyle={tooltipStyle} />
          <Bar dataKey={spec.y_key} fill="#0f766e" radius={[6, 6, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </ChartFrame>
  );
}

interface ChartFrameProps {
  title: string;
  reason: string;
  children: ReactNode;
}

function ChartFrame({ title, reason, children }: ChartFrameProps) {
  return (
    <article className="flex min-h-0 flex-col overflow-hidden rounded-lg border border-white/60 bg-white/42 p-4 shadow-2xl shadow-slate-900/10 backdrop-blur-2xl transition duration-300 hover:-translate-y-0.5 hover:bg-white/55">
      <div className="mb-3 shrink-0">
        <h3 className="truncate text-base font-semibold text-slate-950">{title}</h3>
        <p className="mt-1 line-clamp-2 text-xs leading-5 text-slate-600">{reason}</p>
      </div>
      <div className="min-h-0 flex-1">{children}</div>
    </article>
  );
}

const tooltipStyle = {
  borderRadius: 8,
  border: "1px solid rgba(255, 255, 255, 0.7)",
  background: "rgba(255, 255, 255, 0.86)",
  backdropFilter: "blur(16px)",
  boxShadow: "0 8px 24px rgba(15, 23, 42, 0.12)"
};

const PIE_COLORS = ["#0f766e", "#2563eb", "#d97706", "#7c3aed", "#be123c", "#475569"];
