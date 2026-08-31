import type { AnalyzeResponse } from "../types/dashboard";
import { ChartGrid } from "./ChartGrid";
import { InsightHero } from "./InsightHero";

interface DashboardProps {
  session: AnalyzeResponse;
}

export function Dashboard({ session }: DashboardProps) {
  return (
    <div className="space-y-5">
      <InsightHero analysis={session.analysis} dataset={session.dataset} />
      <ChartGrid charts={session.charts} />
    </div>
  );
}
