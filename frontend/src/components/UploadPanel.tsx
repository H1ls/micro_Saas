import { FileSpreadsheet, Loader2, Upload, X } from "lucide-react";
import { DragEvent, FormEvent, useMemo, useRef, useState } from "react";
import type { AnalyzeInput } from "../api/client";

interface UploadPanelProps {
  collapsed?: boolean;
  disabled?: boolean;
  homeLayout?: boolean;
  onAnalyze: (input: AnalyzeInput) => Promise<void>;
}

export function UploadPanel({ collapsed = false, disabled = false, homeLayout = false, onAnalyze }: UploadPanelProps) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [rawText, setRawText] = useState("");
  const [isDragging, setIsDragging] = useState(false);

  const canSubmit = useMemo(() => Boolean(file || rawText.trim()), [file, rawText]);
  const isWideHome = homeLayout && !collapsed;

  function handleDrop(event: DragEvent<HTMLDivElement>) {
    event.preventDefault();
    setIsDragging(false);
    const droppedFile = event.dataTransfer.files.item(0);
    if (droppedFile) {
      setFile(droppedFile);
    }
  }

  function handleRawTextChange(value: string) {
    setRawText(value);

    const textarea = textareaRef.current;
    if (!textarea) {
      return;
    }

    const minHeight = isWideHome ? 300 : 260;
    const maxHeight = isWideHome ? 480 : 420;
    textarea.style.height = `${minHeight}px`;
    textarea.style.height = `${Math.min(Math.max(textarea.scrollHeight, minHeight), maxHeight)}px`;
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!canSubmit || disabled) {
      return;
    }
    void onAnalyze({ file, rawText });
  }

  return (
    <form
      onSubmit={handleSubmit}
      className={[
        "glass-panel glass-key group z-30 flex flex-col gap-6 p-6 transition-all duration-500 ease-out",
        collapsed && disabled
            ? "fixed left-1/2 top-20 h-14 w-[min(760px,calc(100vw-40px))] -translate-x-1/2 overflow-hidden rounded-[24px]"
          : collapsed
            ? "fixed bottom-4 left-4 h-12 w-72 overflow-hidden rounded-[24px] hover:h-[720px] hover:w-[420px] hover:overflow-y-auto focus-within:h-[720px] focus-within:w-[420px] focus-within:overflow-y-auto"
          : isWideHome
            ? "mx-auto h-auto w-full max-w-[1240px] rounded-[28px]"
            : "h-full min-h-0 overflow-y-auto rounded-[28px]"
      ].join(" ")}
    >
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-wide text-[#356DF3]">Input</p>
          <h2 className="truncate text-2xl font-semibold text-[#172033]">Анализ данных</h2>
        </div>
        {collapsed && (
          <span className="shrink-0 rounded-full bg-[#EEF4FF] px-3 py-1 text-xs font-semibold text-[#356DF3]">
            Input
          </span>
        )}
      </div>

      <div className={isWideHome ? "grid items-stretch gap-7 lg:grid-cols-[320px_minmax(0,1fr)]" : "flex flex-col gap-5"}>
        <section className={isWideHome ? "glass-panel-soft flex min-h-[300px] flex-col gap-3 rounded-[24px] p-3" : "glass-panel-soft flex h-[260px] shrink-0 flex-col gap-3 rounded-[24px] p-3"}>
          <div
            onDragOver={(event) => {
              event.preventDefault();
              setIsDragging(true);
            }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleDrop}
            className={[
              "flex min-h-0 flex-1 cursor-pointer flex-col items-center justify-center rounded-[22px] border border-dashed p-4 text-center transition",
              isDragging ? "border-[#356DF3] bg-[#EEF4FF]/86" : "border-[rgba(120,140,180,0.26)] bg-white/56 hover:border-[#4F7CFF] hover:bg-[#EEF4FF]/58"
            ].join(" ")}
            onClick={() => inputRef.current?.click()}
          >
            <input
              ref={inputRef}
              className="hidden"
              type="file"
              accept=".csv,.xls,.xlsx"
              onChange={(event) => setFile(event.target.files?.item(0) ?? null)}
            />
            <Upload className="h-8 w-8 text-[#356DF3]" aria-hidden="true" />
            <p className="mt-4 text-sm font-medium text-[#172033]">Перетащите файл сюда или выберите его</p>
            <p className="mt-1 text-xs font-medium text-[#98A2B3]">CSV, XLS, XLSX</p>
          </div>

          {file && (
            <div className="glass-panel-soft flex items-center justify-between gap-3 rounded-2xl px-3 py-3">
              <div className="flex min-w-0 items-center gap-3">
                <FileSpreadsheet className="h-5 w-5 shrink-0 text-[#356DF3]" aria-hidden="true" />
                <span className="truncate text-sm font-medium text-[#172033]">{file.name}</span>
              </div>
              <button
                type="button"
                className="rounded-lg p-1 text-[#98A2B3] transition hover:bg-[#EEF4FF] hover:text-[#172033]"
                onClick={() => setFile(null)}
                aria-label="Удалить выбранный файл"
                title="Удалить выбранный файл"
              >
                <X className="h-4 w-4" aria-hidden="true" />
              </button>
            </div>
          )}
        </section>

        <label className="flex shrink-0 flex-col gap-2">
          <span className="text-sm font-medium text-[#667085]">Сырой текст</span>
          <textarea
            ref={textareaRef}
            value={rawText}
            onChange={(event) => handleRawTextChange(event.target.value)}
            placeholder="product,region,revenue&#10;Alpha,North,1200&#10;Beta,South,950"
            className={[
              "glass-panel-soft resize-none overflow-y-auto rounded-[24px] px-4 py-3 text-sm font-normal leading-6 text-[#172033] outline-none transition-[height,border-color,box-shadow,background-color] duration-200 placeholder:text-[#98A2B3] focus:border-[rgba(20,184,166,0.30)] focus:bg-white/72 focus:ring-4 focus:ring-[#EEF4FF]",
              isWideHome ? "h-[300px] min-h-[300px] max-h-[480px]" : "h-[260px] min-h-[260px] max-h-[420px]"
            ].join(" ")}
          />
        </label>
      </div>

      <button
        type="submit"
        disabled={!canSubmit || disabled}
        className="mx-auto inline-flex h-12 shrink-0 items-center justify-center gap-2 rounded-xl bg-[#356DF3] px-6 text-sm font-semibold text-white shadow-[0_8px_30px_rgba(53,109,243,0.22)] transition hover:bg-[#2F61DA] disabled:cursor-not-allowed disabled:bg-[#CBD5E1] disabled:shadow-none"
      >
        {disabled ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : <FileSpreadsheet className="h-4 w-4" aria-hidden="true" />}
        Анализировать
      </button>
    </form>
  );
}
