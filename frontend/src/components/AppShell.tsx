import { BarChart3 } from "lucide-react";
import type { PropsWithChildren } from "react";

interface AppShellProps extends PropsWithChildren {
  onHome?: () => void;
}

export function AppShell({ children, onHome }: AppShellProps) {
  return (
    <div className="relative h-screen overflow-hidden bg-[#EEF3F9] font-sans text-[#172033]">
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_18%_12%,rgba(79,124,255,0.13),transparent_32%),radial-gradient(circle_at_82%_18%,rgba(139,92,246,0.10),transparent_30%),linear-gradient(180deg,#F2F6FB_0%,#EAF1F8_100%)]"
        aria-hidden="true"
      />
      <header className="relative z-10 h-16 border-b border-[rgba(156,174,205,0.32)] bg-white/72 shadow-[0_8px_30px_rgba(31,45,70,0.04)] backdrop-blur-2xl">
        <div className="mx-auto flex h-full max-w-7xl items-center justify-between px-5">
          <button
            type="button"
            onClick={onHome}
            className="flex items-center gap-3 rounded-xl text-left outline-none transition hover:opacity-80 focus-visible:ring-4 focus-visible:ring-[#EEF4FF]"
            aria-label="Вернуться на главную"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#356DF3] text-white shadow-[0_8px_30px_rgba(53,109,243,0.18)]">
              <BarChart3 className="h-5 w-5" aria-hidden="true" />
            </div>
            <div>
              <p className="text-sm font-semibold uppercase tracking-wide text-[#356DF3]">AI Dashboard</p>
              <h1 className="text-lg font-semibold leading-tight text-[#172033]">Рабочая область анализа данных</h1>
            </div>
          </button>
        </div>
      </header>
      <div className="relative z-10 mx-auto h-[calc(100vh-4rem)] max-w-7xl px-5 py-4">
        <div
          className="glass-panel-soft pointer-events-none absolute inset-x-3 bottom-3 top-3 rounded-[28px]"
          aria-hidden="true"
        />
        <div className="relative h-full min-h-0">{children}</div>
      </div>
    </div>
  );
}
