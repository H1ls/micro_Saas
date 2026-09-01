import { Dashboard } from "./components/Dashboard";
import { ErrorState, LoadingState } from "./components/states";
import { UploadPanel } from "./components/UploadPanel";
import { AppShell } from "./components/AppShell";
import { useDashboardSession } from "./state/useDashboardSession";

export default function App() {
  const { analyze, retryLastAnalysis, reset, session, status, error } = useDashboardSession();

  return (
    <AppShell onHome={reset}>
      <div className="relative h-full min-h-0">
        {status === "idle" && (
          <div className="flex h-full min-h-0 items-center">
            <UploadPanel disabled={false} homeLayout onAnalyze={analyze} />
          </div>
        )}
        {status === "loading" && (
          <main className="h-full min-h-0">
            <LoadingState />
          </main>
        )}
        {status === "ready" && session && (
          <main className="h-full min-h-0">
            <Dashboard session={session} onRetry={retryLastAnalysis} onUpload={reset} />
          </main>
        )}
        {status === "error" && (
          <div className="grid h-full min-h-0 gap-6 xl:grid-cols-[420px_minmax(0,1fr)]">
            <UploadPanel disabled={false} onAnalyze={analyze} />
            <main className="min-h-0">
              <ErrorState message={error} onRetry={reset} />
            </main>
          </div>
        )}
      </div>
    </AppShell>
  );
}
