import { useState } from "react";
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
  const [selectedLabel, setSelectedLabel] = useState<string | null>(null);
  const isFallback = session.analysis_source === "fallback";

  return (
    <div className="dashboard-enter grid h-full min-h-0 grid-rows-[72px_minmax(0,1fr)_122px] gap-4">
      <InsightHero analysis={session.analysis} />
      <div className="charts-rise h-full min-h-0">
        {isFallback ? (
          <FallbackDataState onRetry={onRetry} onUpload={onUpload} />
        ) : (
          <ChartGrid charts={session.charts} selectedLabel={selectedLabel} onSelectLabel={setSelectedLabel} />
        )}
      </div>
      <AskPanel sessionId={session.session_id} />
    </div>
  );
}
