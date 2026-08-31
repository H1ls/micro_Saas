import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import type { PreparedChart } from "../types/dashboard";

interface ChartRendererProps {
  chart: PreparedChart;
}

export function ChartRenderer({ chart }: ChartRendererProps) {
  const { spec, data } = chart;

  if (spec.type !== "bar") {
    return (
      <article className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
        <h3 className="text-base font-semibold text-slate-950">{spec.title}</h3>
        <p className="mt-3 text-sm text-slate-600">This chart type will be rendered in a later block.</p>
      </article>
    );
  }

  return (
    <article className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
      <div className="mb-4">
        <h3 className="text-base font-semibold text-slate-950">{spec.title}</h3>
        <p className="mt-1 text-sm leading-6 text-slate-600">{spec.reason}</p>
      </div>
      <div className="h-[360px] w-full">
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
              contentStyle={{
                borderRadius: 8,
                border: "1px solid #cbd5e1",
                boxShadow: "0 8px 24px rgba(15, 23, 42, 0.12)"
              }}
            />
            <Bar dataKey={spec.y_key} fill="#0f766e" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </article>
  );
}
