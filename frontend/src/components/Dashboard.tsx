import type { AnalyzeResponse } from "../types/dashboard";
import { AskPanel } from "./AskPanel";
import { ChartGrid } from "./ChartGrid";
import { InsightHero } from "./InsightHero";
import { FallbackDataState } from "./states";

interface DashboardProps {
  session: AnalyzeResponse;
  onRetry: () => void;
  onUpload: () => void;
}

export function Dashboard({ session, onRetry, onUpload }: DashboardProps) {
  const isFallback = session.analysis_source === "fallback";

  return (
    <div className="dashboard-enter grid h-full min-h-0 grid-rows-[72px_minmax(0,1fr)_76px] gap-4">
      <InsightHero analysis={session.analysis} />
      {isFallback ? <FallbackDataState onRetry={onRetry} onUpload={onUpload} /> : <ChartGrid charts={session.charts} />}
      <AskPanel sessionId={session.session_id} />
    </div>
  );
}
