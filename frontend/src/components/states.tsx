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

interface FallbackDataStateProps {
  onRetry: () => void;
  onUpload: () => void;
}

export function FallbackDataState({ onRetry, onUpload }: FallbackDataStateProps) {
  return (
    <section className="min-h-0 overflow-hidden rounded-lg border border-white/60 bg-white/45 p-4 shadow-[0_24px_80px_rgba(35,54,73,0.14)] backdrop-blur-2xl">
      <div className="grid h-full min-h-0 items-center gap-6 rounded-lg border border-white/50 bg-white/35 p-5 shadow-inner shadow-white/30 lg:grid-cols-[minmax(220px,0.72fr)_minmax(280px,1fr)]">
        <div className="flex h-full min-h-0 items-center justify-center">
          <img
            src="/fallback-empty-state.png"
            alt=""
            className="max-h-full w-full max-w-[360px] object-contain drop-shadow-[0_24px_36px_rgba(32,72,88,0.18)]"
          />
        </div>
        <div className="flex min-h-0 flex-col justify-center">
          <p className="text-xs font-semibold uppercase text-teal-700">Fallback mode</p>
          <h2 className="mt-2 text-2xl font-semibold text-slate-950">ИИ не собрал надежные графики</h2>
          <p className="mt-3 max-w-xl text-sm leading-6 text-slate-600">
            Данные загружены, но AI не вернул валидную структуру для dashboard или ответ не прошел проверку. Чтобы не
            показывать сомнительную визуализацию, графики скрыты.
          </p>
          <p className="mt-2 max-w-xl text-sm leading-6 text-slate-500">
            Можно повторить анализ с теми же данными или загрузить другой файл.
          </p>
          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <button
              type="button"
              onClick={onRetry}
              className="inline-flex h-11 items-center justify-center gap-2 rounded-md border border-white/70 bg-white/55 px-4 text-sm font-semibold text-slate-800 shadow-sm transition hover:-translate-y-0.5 hover:bg-white/80"
            >
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Попробовать снова
            </button>
            <button
              type="button"
              onClick={onUpload}
              className="inline-flex h-11 items-center justify-center gap-2 rounded-md bg-teal-600 px-4 text-sm font-semibold text-white shadow-lg shadow-teal-900/15 transition hover:-translate-y-0.5 hover:bg-teal-700"
            >
              <Upload className="h-4 w-4" aria-hidden="true" />
              Загрузить файл
            </button>
          </div>
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
