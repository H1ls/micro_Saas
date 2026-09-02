import { Check, Database, FileSearch, RotateCcw, Sparkles, Upload } from "lucide-react";
import type { TranslatedApiError } from "../api/client";

export function EmptyState() {
  return (
    <MascotEmptyPanel
      title="Загрузите данные, чтобы собрать dashboard"
      message="Загрузите CSV, Excel или сырой текст, чтобы получить инсайт, графики и ответы только по dataset."
      compact={false}
    />
  );
}

interface MascotEmptyPanelProps {
  title: string;
  message: string;
  secondaryMessage?: string;
  onRetry?: () => void;
  onUpload?: () => void;
  imageSrc?: string;
  compact?: boolean;
}

export function MascotEmptyPanel({
  title,
  message,
  secondaryMessage,
  onRetry,
  onUpload,
  imageSrc = "/fallback-empty-state.png",
  compact = true,
}: MascotEmptyPanelProps) {
  return (
    <section className="glass-panel min-h-0 overflow-hidden rounded-[28px] p-5">
      <div className="glass-panel-soft grid h-full min-h-0 items-center gap-6 rounded-[24px] p-5 md:grid-cols-[minmax(130px,0.55fr)_minmax(180px,1fr)]">
        <div className="flex h-full min-h-0 items-center justify-center">
          <img
            src={imageSrc}
            alt=""
            className={`${compact ? "max-h-44 max-w-[220px]" : "max-h-full max-w-[360px]"} w-full object-contain drop-shadow-[0_24px_36px_rgba(31,45,70,0.12)]`}
          />
        </div>
        <div className="flex min-h-0 flex-col justify-center">
          <h2 className={`${compact ? "text-lg" : "text-2xl"} font-semibold text-[#172033]`}>{title}</h2>
          <p className="mt-3 max-w-xl text-sm leading-6 text-[#667085]">{message}</p>
          {secondaryMessage && <p className="mt-2 max-w-xl text-sm leading-6 text-[#98A2B3]">{secondaryMessage}</p>}
          {(onRetry || onUpload) && (
            <div className="mt-5 flex flex-col gap-3 sm:flex-row">
              {onRetry && (
                <button
                  type="button"
                  onClick={onRetry}
                  className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-[#E2E7EF] bg-white px-4 text-sm font-semibold text-[#172033] shadow-[0_8px_30px_rgba(31,45,70,0.04)] transition hover:-translate-y-0.5 hover:bg-[#FAFBFD]"
                >
                  <RotateCcw className="h-4 w-4" aria-hidden="true" />
                  Попробовать снова
                </button>
              )}
              {onUpload && (
                <button
                  type="button"
                  onClick={onUpload}
                  className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-[#356DF3] px-4 text-sm font-semibold text-white shadow-[0_8px_30px_rgba(53,109,243,0.20)] transition hover:-translate-y-0.5 hover:bg-[#2F61DA]"
                >
                  <Upload className="h-4 w-4" aria-hidden="true" />
                  Загрузить файл
                </button>
              )}
            </div>
          )}
        </div>
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
    <section className="glass-panel glass-key flex h-full min-h-0 items-center justify-center overflow-hidden rounded-[28px] p-5">
      <div className="glass-panel-soft grid h-[min(550px,100%)] w-full max-w-[940px] items-center gap-7 overflow-hidden rounded-[24px] p-6 md:grid-cols-[minmax(220px,0.78fr)_minmax(320px,1fr)]">
        <div className="relative flex h-full min-h-0 items-center justify-center">
          <div className="absolute inset-10 rounded-full bg-[#EEF4FF] blur-3xl" aria-hidden="true" />
          <img
            src="/loading-mascot.png"
            alt="Загрузка анализа данных"
            className="relative max-h-[360px] w-full object-contain drop-shadow-[0_28px_42px_rgba(31,45,70,0.14)]"
          />
        </div>

        <div className="flex min-h-0 flex-col justify-center">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#356DF3]">Подготовка dashboard</p>
              <h2 className="mt-2 text-xl font-semibold text-[#172033]">Анализируем данные</h2>
            </div>
            <div className="h-2 w-24 overflow-hidden rounded-full bg-[#EEF4FF]">
              <div className="loading-progress h-full rounded-full bg-[#356DF3]" />
            </div>
          </div>

          <p className="mt-3 max-w-xl text-sm leading-6 text-[#667085]">
            Проверяем входные данные, выделяем структуру, собираем короткую сводку и готовим безопасные данные для графиков.
          </p>

          <div className="mt-6 space-y-3">
            {steps.map((step, index) => {
              const Icon = step.icon;
              return (
                <div
                  key={step.label}
                  className="glass-panel-soft loading-step flex items-center gap-3 rounded-2xl px-3 py-2.5"
                  style={{ animationDelay: `${index * 900}ms` }}
                >
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-[#EEF4FF] text-[#356DF3]">
                    <Icon className="h-4 w-4" aria-hidden="true" />
                  </span>
                  <span className="min-w-0 flex-1 text-sm font-medium text-[#172033]">{step.label}</span>
                  <Check className="h-4 w-4 shrink-0 text-[#17A673]" aria-hidden="true" />
                </div>
              );
            })}
          </div>
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
    <MascotEmptyPanel
      title="ИИ не собрал надежные графики"
      message="Данные загружены, но AI не вернул валидную структуру для dashboard или ответ не прошел проверку. Чтобы не показывать сомнительную визуализацию, графики скрыты."
      secondaryMessage="Можно повторить анализ с теми же данными или загрузить другой файл."
      onRetry={onRetry}
      onUpload={onUpload}
      compact={false}
    />
  );
}

interface ErrorStateProps {
  error: TranslatedApiError;
  onRetry: () => void;
  onUpload: () => void;
}

export function ErrorState({ error, onRetry, onUpload }: ErrorStateProps) {
  if (error.kind === "file_upload") {
    return (
      <MascotEmptyPanel
        title={error.title}
        message={error.message}
        secondaryMessage="Подойдут обычные CSV, XLS или XLSX с табличными данными. PDF и поврежденные файлы не анализируются в MVP."
        onRetry={onRetry}
        onUpload={onUpload}
        imageSrc="/fallback-file.png"
        compact={false}
      />
    );
  }

  return (
    <MascotEmptyPanel
      title={error.title}
      message={error.message}
      secondaryMessage="Внутренние детали ошибки скрыты. Проверьте данные и попробуйте снова."
      onRetry={onRetry}
      onUpload={onUpload}
      compact={false}
    />
  );
}
