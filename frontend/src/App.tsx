import { Dashboard } from "./components/Dashboard";
import { EmptyState, ErrorState, LoadingState } from "./components/states";
import { UploadPanel } from "./components/UploadPanel";
import { AppShell } from "./components/AppShell";
import { useDashboardSession } from "./state/useDashboardSession";

export default function App() {
  const { analyze, retryLastAnalysis, reset, session, status, error } = useDashboardSession();
  const isCollapsedUpload = status === "loading" || status === "ready";

  return (
    <AppShell>
      <div className="relative h-full min-h-0">
        {isCollapsedUpload ? (
          <>
            <UploadPanel collapsed disabled={status === "loading"} onAnalyze={analyze} />
            <main className="h-full min-h-0">
              {status === "loading" && <LoadingState />}
              {status === "ready" && session && (
                <Dashboard session={session} onRetry={retryLastAnalysis} onUpload={reset} />
              )}
            </main>
          </>
        ) : (
          <div className="grid h-full min-h-0 gap-6 xl:grid-cols-[420px_minmax(0,1fr)]">
            <UploadPanel disabled={false} onAnalyze={analyze} />
            <main className="min-h-0">
              {status === "idle" && <EmptyState />}
              {status === "error" && <ErrorState message={error} onRetry={reset} />}
            </main>
          </div>
        )}
      </div>
    </AppShell>
  );
}
