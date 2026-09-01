import { BarChart3 } from "lucide-react";
import type { PropsWithChildren } from "react";

interface AppShellProps extends PropsWithChildren {
  onHome?: () => void;
}

export function AppShell({ children, onHome }: AppShellProps) {
  return (
    <div className="relative h-screen overflow-hidden bg-slate-100 bg-[url('/back.png')] bg-cover bg-center bg-no-repeat text-slate-950">
      <div className="pointer-events-none absolute inset-0 bg-white/38 backdrop-blur-[1px]" aria-hidden="true" />
      <header className="relative z-10 h-16 border-b border-slate-200/55 bg-white/58 backdrop-blur-xl">
        <div className="mx-auto flex h-full max-w-7xl items-center justify-between px-5">
          <button
            type="button"
            onClick={onHome}
            className="flex items-center gap-3 rounded-md text-left outline-none transition hover:opacity-80 focus-visible:ring-4 focus-visible:ring-teal-100"
            aria-label="Вернуться на главную"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-md bg-slate-900 text-white shadow-lg shadow-slate-950/10">
              <BarChart3 className="h-5 w-5" aria-hidden="true" />
            </div>
            <div>
              <p className="text-sm font-semibold uppercase tracking-wide text-teal-700">AI Dashboard</p>
              <h1 className="text-lg font-semibold leading-tight text-slate-950">Рабочая область анализа данных</h1>
            </div>
          </button>
        </div>
      </header>
      <div className="relative z-10 mx-auto h-[calc(100vh-4rem)] max-w-7xl px-5 py-4">{children}</div>
    </div>
  );
}
