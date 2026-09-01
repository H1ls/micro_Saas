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
    <div className="dashboard-enter relative grid h-full min-h-0 grid-rows-[minmax(0,1fr)_190px] gap-4">
      {session.analysis_source === "fallback" && (
        <div className="pointer-events-none absolute left-4 right-4 top-4 z-20">
          <DegradedStateNotice />
        </div>
      )}
      <div className="grid min-h-0 gap-4 xl:grid-cols-[minmax(320px,0.9fr)_minmax(0,1.6fr)]">
        <InsightHero analysis={session.analysis} dataset={session.dataset} />
        <ChartGrid charts={session.charts} />
      </div>
      <AskPanel sessionId={session.session_id} />
    </div>
  );
}
