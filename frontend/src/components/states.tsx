import { AlertTriangle, BarChart3, Loader2 } from "lucide-react";

export function EmptyState() {
  return (
    <section className="flex h-full min-h-[620px] items-center justify-center rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
      <div className="max-w-md text-center">
        <BarChart3 className="mx-auto h-12 w-12 text-teal-700" aria-hidden="true" />
        <h2 className="mt-4 text-xl font-semibold text-slate-950">Загрузите данные, чтобы собрать dashboard</h2>
        <p className="mt-2 text-sm leading-6 text-slate-600">Загрузите CSV, Excel или сырой текст, чтобы получить инсайт, графики и ответы только по dataset.</p>
      </div>
    </section>
  );
}

export function LoadingState() {
  return (
    <section className="flex h-full min-h-[620px] items-center justify-center rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
      <div className="text-center">
        <Loader2 className="mx-auto h-10 w-10 animate-spin text-teal-700" aria-hidden="true" />
        <h2 className="mt-4 text-xl font-semibold text-slate-950">Анализируем dataset</h2>
        <p className="mt-2 text-sm text-slate-600">Готовим AI narrative, безопасные данные для графиков и контекст сессии.</p>
      </div>
    </section>
  );
}

interface ErrorStateProps {
  message: string;
  onRetry: () => void;
}

export function ErrorState({ message, onRetry }: ErrorStateProps) {
  return (
    <section className="flex h-full min-h-[620px] items-center justify-center rounded-lg border border-red-200 bg-white p-6 shadow-sm">
      <div className="max-w-md text-center">
        <AlertTriangle className="mx-auto h-10 w-10 text-red-600" aria-hidden="true" />
        <h2 className="mt-4 text-xl font-semibold text-slate-950">Не удалось проанализировать данные</h2>
        <p className="mt-2 text-sm leading-6 text-slate-600">{message}</p>
        <p className="mt-2 text-xs leading-5 text-slate-500">Используйте CSV, XLS, XLSX или вставьте текст минимум с одной непустой строкой.</p>
        <button
          type="button"
          onClick={onRetry}
          className="mt-5 inline-flex h-10 items-center justify-center rounded-md border border-slate-300 px-4 text-sm font-semibold text-slate-800 transition hover:bg-slate-50"
        >
          Попробовать снова
        </button>
      </div>
    </section>
  );
}
