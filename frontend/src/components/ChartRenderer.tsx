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
      <article className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
        <h3 className="text-base font-semibold text-slate-950">{spec.title}</h3>
        <p className="mt-3 text-sm text-slate-600">This chart cannot be rendered without a numeric value column.</p>
      </article>
    );
  }

  if (spec.type === "line") {
    return (
      <ChartFrame title={spec.title} reason={spec.reason}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 12, right: 12, left: 0, bottom: 28 }}>
            <CartesianGrid stroke="#e2e8f0" strokeDasharray="4 4" vertical={false} />
            <XAxis dataKey={spec.x_key} tick={{ fill: "#475569", fontSize: 12 }} tickLine={false} />
            <YAxis tick={{ fill: "#475569", fontSize: 12 }} tickLine={false} width={64} />
            <Tooltip contentStyle={tooltipStyle} />
            <Line type="monotone" dataKey={spec.y_key} stroke="#2563eb" strokeWidth={2} dot={{ r: 3 }} />
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
            <Pie data={data} dataKey={spec.y_key} nameKey={spec.x_key} innerRadius={72} outerRadius={124} paddingAngle={2}>
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
          <BarChart data={data} margin={{ top: 12, right: 12, left: 0, bottom: 28 }}>
            <CartesianGrid stroke="#e2e8f0" strokeDasharray="4 4" vertical={false} />
            <XAxis
              dataKey={spec.x_key}
              angle={-20}
              height={68}
              interval={0}
              tick={{ fill: "#475569", fontSize: 12 }}
              tickLine={false}
            />
            <YAxis tick={{ fill: "#475569", fontSize: 12 }} tickLine={false} width={64} />
            <Tooltip
              cursor={{ fill: "#f1f5f9" }}
              contentStyle={tooltipStyle}
            />
            <Bar dataKey={spec.y_key} fill="#0f766e" radius={[4, 4, 0, 0]} />
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
    <article className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
      <div className="mb-4">
        <h3 className="text-base font-semibold text-slate-950">{title}</h3>
        <p className="mt-1 text-sm leading-6 text-slate-600">{reason}</p>
      </div>
      <div className="h-[360px] w-full">{children}</div>
    </article>
  );
}

const tooltipStyle = {
  borderRadius: 8,
  border: "1px solid #cbd5e1",
  boxShadow: "0 8px 24px rgba(15, 23, 42, 0.12)"
};

const PIE_COLORS = ["#0f766e", "#2563eb", "#d97706", "#7c3aed", "#be123c", "#475569"];
