import type { AnalyzeResponse } from "../types/dashboard";
import { AskPanel } from "./AskPanel";
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
      <AskPanel sessionId={session.session_id} />
    </div>
  );
}
