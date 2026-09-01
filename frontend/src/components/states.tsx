import { AlertTriangle, BarChart3, Check, Database, FileSearch, RotateCcw, Sparkles, Upload } from "lucide-react";

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
  const steps = [
    { label: "Читаем данные", icon: FileSearch },
    { label: "Собираем структуру", icon: Database },
    { label: "Готовим инсайт", icon: Sparkles },
  ];

  return (
    <section className="flex h-full min-h-[620px] items-center justify-center overflow-hidden rounded-lg border border-white/55 bg-white/35 p-6 shadow-[0_28px_90px_rgba(37,58,76,0.14)] backdrop-blur-2xl">
      <div className="grid h-full w-full max-w-[1040px] items-center gap-8 lg:grid-cols-[minmax(300px,0.9fr)_minmax(360px,1fr)]">
        <div className="relative flex aspect-[4/3] w-full max-w-[420px] items-center justify-center justify-self-center">
          <div className="absolute inset-8 rounded-full bg-cyan-200/20 blur-3xl" aria-hidden="true" />
          <img
            src="/loading-mascot.png"
            alt="Загрузка анализа данных"
            className="relative h-full w-full object-contain drop-shadow-[0_28px_42px_rgba(21,94,117,0.18)]"
          />
        </div>

        <div className="min-w-0">
          <div className="rounded-lg border border-white/60 bg-white/45 p-5 shadow-inner shadow-white/30 backdrop-blur-xl">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-teal-700">Подготовка dashboard</p>
                <h2 className="mt-2 text-xl font-semibold text-slate-950">Анализируем данные</h2>
              </div>
              <div className="h-2 w-24 overflow-hidden rounded-full bg-slate-200/70">
                <div className="loading-progress h-full rounded-full bg-teal-500" />
              </div>
            </div>

            <div className="mt-5 space-y-3">
              {steps.map((step, index) => {
                const Icon = step.icon;
                return (
                  <div
                    key={step.label}
                    className="loading-step flex items-center gap-3 rounded-lg border border-white/55 bg-white/45 px-3 py-2.5 shadow-sm"
                    style={{ animationDelay: `${index * 900}ms` }}
                  >
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-slate-950 text-white shadow-sm">
                      <Icon className="h-4 w-4" aria-hidden="true" />
                    </span>
                    <span className="min-w-0 flex-1 text-sm font-medium text-slate-800">{step.label}</span>
                    <Check className="h-4 w-4 shrink-0 text-teal-600" aria-hidden="true" />
                  </div>
                );
              })}
            </div>

            <div className="mt-6 grid gap-3 sm:grid-cols-3">
              <div className="loading-skeleton h-16 rounded-lg border border-white/50 bg-white/40" />
              <div className="loading-skeleton h-16 rounded-lg border border-white/50 bg-white/40 [animation-delay:180ms]" />
              <div className="loading-skeleton h-16 rounded-lg border border-white/50 bg-white/40 [animation-delay:360ms]" />
            </div>
            <div className="loading-skeleton mt-3 h-32 rounded-lg border border-white/50 bg-white/40 [animation-delay:540ms]" />
          </div>
        </div>
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
