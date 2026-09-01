import { BarChart3 } from "lucide-react";
import type { PropsWithChildren } from "react";

export function AppShell({ children }: PropsWithChildren) {
  return (
    <div className="h-screen overflow-hidden bg-[radial-gradient(circle_at_top_left,#dff7f1_0,#eef4ff_34%,#f8fafc_66%)] text-slate-950">
      <header className="h-16 border-b border-white/50 bg-white/45 backdrop-blur-xl">
        <div className="mx-auto flex h-full max-w-7xl items-center justify-between px-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-md bg-teal-600/90 text-white shadow-lg shadow-teal-900/10">
              <BarChart3 className="h-5 w-5" aria-hidden="true" />
            </div>
            <div>
              <p className="text-sm font-semibold uppercase tracking-wide text-teal-700">AI Dashboard</p>
              <h1 className="text-lg font-semibold leading-tight text-slate-950">Рабочая область анализа данных</h1>
            </div>
          </div>
          <span className="hidden rounded-md border border-white/60 bg-white/55 px-3 py-1 text-sm font-medium text-teal-800 shadow-sm backdrop-blur-xl sm:inline-flex">
            AI с fallback
          </span>
        </div>
      </header>
      <div className="mx-auto h-[calc(100vh-4rem)] max-w-7xl px-5 py-4">{children}</div>
    </div>
  );
}
