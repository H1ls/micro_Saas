import { Dashboard } from "./components/Dashboard";
import { EmptyState, ErrorState, LoadingState } from "./components/states";
import { UploadPanel } from "./components/UploadPanel";
import { AppShell } from "./components/AppShell";
import { useDashboardSession } from "./state/useDashboardSession";

export default function App() {
  const { analyze, reset, session, status, error } = useDashboardSession();

  return (
    <AppShell>
      <div className="grid min-h-0 gap-6 xl:grid-cols-[420px_minmax(0,1fr)]">
        <UploadPanel disabled={status === "loading"} onAnalyze={analyze} />
        <main className="min-h-[620px]">
          {status === "idle" && <EmptyState />}
          {status === "loading" && <LoadingState />}
          {status === "error" && <ErrorState message={error} onRetry={reset} />}
          {status === "ready" && session && <Dashboard session={session} />}
        </main>
      </div>
    </AppShell>
  );
}
