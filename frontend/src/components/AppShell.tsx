import { BarChart3 } from "lucide-react";
import type { PropsWithChildren } from "react";

export function AppShell({ children }: PropsWithChildren) {
  return (
    <div className="min-h-screen bg-[#f6f8fb] text-slate-950">
      <header className="border-b border-slate-200 bg-white/90">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-md bg-teal-600 text-white">
              <BarChart3 className="h-5 w-5" aria-hidden="true" />
            </div>
            <div>
              <p className="text-sm font-semibold uppercase tracking-wide text-teal-700">AI Dashboard</p>
              <h1 className="text-lg font-semibold leading-tight text-slate-950">Рабочая область анализа данных</h1>
            </div>
          </div>
          <span className="hidden rounded-md border border-teal-200 bg-teal-50 px-3 py-1 text-sm font-medium text-teal-800 sm:inline-flex">
            AI с fallback
          </span>
        </div>
      </header>
      <div className="mx-auto max-w-7xl px-5 py-6">{children}</div>
    </div>
  );
}
