import { AlertTriangle, BarChart3, RotateCcw, Upload } from "lucide-react";

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
    <section className="flex h-full min-h-[620px] items-center justify-center overflow-hidden rounded-lg border border-white/55 bg-white/35 p-6 shadow-[0_28px_90px_rgba(37,58,76,0.14)] backdrop-blur-2xl">
      <div className="relative flex aspect-[4/3] w-full max-w-[420px] items-center justify-center">
        <div className="absolute inset-8 rounded-full bg-cyan-200/20 blur-3xl" aria-hidden="true" />
        <img
          src="/loading-mascot.png"
          alt="Загрузка анализа данных"
          className="relative h-full w-full object-contain drop-shadow-[0_28px_42px_rgba(21,94,117,0.18)]"
        />
        <svg className="pointer-events-none absolute inset-0 h-full w-full" viewBox="0 0 420 320" aria-hidden="true">
          <defs>
            <filter id="loadingPieGlow" x="-35%" y="-35%" width="170%" height="170%">
              <feGaussianBlur stdDeviation="3.2" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>
          <g filter="url(#loadingPieGlow)" opacity="0.82">
            <path d="M298 178 L298 111 A67 67 0 0 1 356 145 Z" fill="#ff766d" fillOpacity="0.42" stroke="#ff8b82" strokeWidth="3">
              <animateTransform attributeName="transform" type="translate" values="34 -18;34 -18;0 0;0 0;34 -18" keyTimes="0;0.12;0.34;0.74;1" dur="2s" repeatCount="indefinite" />
            </path>
            <path d="M298 178 L356 145 A67 67 0 0 1 329 235 Z" fill="#3ba7ff" fillOpacity="0.42" stroke="#62c7ff" strokeWidth="3">
              <animateTransform attributeName="transform" type="translate" values="42 32;42 32;42 32;0 0;42 32" keyTimes="0;0.25;0.42;0.62;1" dur="2s" repeatCount="indefinite" />
            </path>
            <path d="M298 178 L329 235 A67 67 0 0 1 242 216 Z" fill="#ffd05a" fillOpacity="0.46" stroke="#ffd76e" strokeWidth="3">
              <animateTransform attributeName="transform" type="translate" values="-30 38;-30 38;-30 38;0 0;-30 38" keyTimes="0;0.42;0.55;0.72;1" dur="2s" repeatCount="indefinite" />
            </path>
            <path d="M298 178 L242 216 A67 67 0 0 1 298 111 Z" fill="#23d7d0" fillOpacity="0.38" stroke="#67fff5" strokeWidth="3">
              <animate attributeName="opacity" values="0.45;0.76;0.45" dur="2s" repeatCount="indefinite" />
            </path>
            <circle cx="298" cy="178" r="68" fill="none" stroke="#ffffff" strokeOpacity="0.55" strokeWidth="2">
              <animate attributeName="opacity" values="0;0;0.8;0" keyTimes="0;0.62;0.76;1" dur="2s" repeatCount="indefinite" />
            </circle>
          </g>
        </svg>
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
            Повторить
          </button>
          <button
            type="button"
            onClick={onRetry}
            className="inline-flex h-10 items-center justify-center gap-2 rounded-md bg-teal-600 px-4 text-sm font-semibold text-white transition hover:bg-teal-700"
          >
            <Upload className="h-4 w-4" aria-hidden="true" />
            Загрузить другой файл
          </button>
        </div>
      </div>
    </section>
  );
}
