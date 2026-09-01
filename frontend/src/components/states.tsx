import { AlertTriangle, BarChart3, Loader2, RotateCcw, Upload } from "lucide-react";

export function EmptyState() {
  return (
    <section className="flex h-full min-h-[620px] items-center justify-center rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
      <div className="max-w-md text-center">
        <BarChart3 className="mx-auto h-12 w-12 text-teal-700" aria-hidden="true" />
        <h2 className="mt-4 text-xl font-semibold text-slate-950">Загрузите данные, чтобы собрать dashboard</h2>
        <p className="mt-2 text-sm leading-6 text-slate-600">
          Загрузите CSV, Excel или сырой текст, чтобы получить инсайт, графики и ответы только по dataset.
        </p>
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
        <p className="mt-2 text-sm text-slate-600">
          Готовим AI narrative, безопасные данные для графиков и контекст сессии.
        </p>
      </div>
    </section>
  );
}

export function DegradedStateNotice() {
  return (
    <section className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 shadow-sm">
      <div className="flex gap-3">
        <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-amber-700" aria-hidden="true" />
        <div>
          <h2 className="text-sm font-semibold text-amber-950">Анализ построен в fallback-режиме</h2>
          <p className="mt-1 text-sm leading-6 text-amber-900">
            AI не вернул валидный ответ или был недоступен, поэтому dashboard собран детерминированно по структуре dataset.
            Графики и значения рассчитаны backend-кодом по загруженным данным.
          </p>
        </div>
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
        <h2 className="mt-4 text-xl font-semibold text-slate-950">Не удалось прочитать данные</h2>
        <p className="mt-2 text-sm leading-6 text-slate-600">{message}</p>
        <p className="mt-2 text-xs leading-5 text-slate-500">
          Используйте CSV, XLS, XLSX или вставьте текст с непустыми строками. Внутренние детали ошибки скрыты.
        </p>
        <div className="mt-5 flex flex-col justify-center gap-3 sm:flex-row">
          <button
            type="button"
            onClick={onRetry}
            className="inline-flex h-10 items-center justify-center gap-2 rounded-md border border-slate-300 px-4 text-sm font-semibold text-slate-800 transition hover:bg-slate-50"
          >
            <RotateCcw className="h-4 w-4" aria-hidden="true" />
            Retry
          </button>
          <button
            type="button"
            onClick={onRetry}
            className="inline-flex h-10 items-center justify-center gap-2 rounded-md bg-teal-600 px-4 text-sm font-semibold text-white transition hover:bg-teal-700"
          >
            <Upload className="h-4 w-4" aria-hidden="true" />
            Try another file
          </button>
        </div>
      </div>
    </section>
  );
}
