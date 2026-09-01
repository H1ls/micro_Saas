import type { AnalyzeResponse } from "../types/dashboard";
import { AskPanel } from "./AskPanel";
import { ChartGrid } from "./ChartGrid";
import { InsightHero } from "./InsightHero";
import { DegradedStateNotice } from "./states";

interface DashboardProps {
  session: AnalyzeResponse;
}

export function Dashboard({ session }: DashboardProps) {
  return (
    <div className="dashboard-enter relative grid h-full min-h-0 grid-rows-[72px_minmax(0,1fr)_76px] gap-4">
      {session.analysis_source === "fallback" && (
        <div className="pointer-events-none absolute left-4 right-4 top-4 z-20">
          <DegradedStateNotice />
        </div>
      )}
      <InsightHero analysis={session.analysis} />
      <ChartGrid charts={session.charts} />
      <AskPanel sessionId={session.session_id} />
    </div>
  );
}
