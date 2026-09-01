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

    const minHeight = isWideHome ? 320 : 260;
    const maxHeight = isWideHome ? 520 : 420;
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
        "group z-30 flex flex-col gap-4 border border-white/60 bg-white/45 p-4 shadow-2xl shadow-slate-900/10 backdrop-blur-2xl transition-all duration-500 ease-out",
        collapsed && disabled
          ? "fixed left-1/2 top-20 h-14 w-[min(760px,calc(100vw-40px))] -translate-x-1/2 overflow-hidden rounded-lg"
          : collapsed
            ? "fixed bottom-4 left-4 h-12 w-72 overflow-hidden rounded-lg hover:h-[720px] hover:w-[420px] hover:overflow-y-auto focus-within:h-[720px] focus-within:w-[420px] focus-within:overflow-y-auto"
          : isWideHome
            ? "mx-auto h-auto w-full max-w-[1240px] rounded-lg"
            : "h-full min-h-0 overflow-y-auto rounded-lg"
      ].join(" ")}
    >
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0">
          <h2 className="truncate text-lg font-semibold text-slate-950">Анализ данных</h2>
        </div>
        {collapsed && (
          <span className="shrink-0 rounded-md bg-teal-600/90 px-2 py-1 text-xs font-semibold text-white">
            Input
          </span>
        )}
      </div>

      <div className={isWideHome ? "grid items-stretch gap-4 lg:grid-cols-[320px_minmax(0,900px)]" : "flex flex-col gap-4"}>
        <section className={isWideHome ? "flex min-h-[320px] flex-col gap-3 rounded-lg border border-white/55 bg-white/30 p-3" : "flex h-[260px] shrink-0 flex-col gap-3 rounded-lg border border-white/55 bg-white/30 p-3"}>
          <div
            onDragOver={(event) => {
              event.preventDefault();
              setIsDragging(true);
            }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleDrop}
            className={[
              "flex min-h-0 flex-1 cursor-pointer flex-col items-center justify-center rounded-lg border border-dashed p-4 text-center transition",
            isDragging ? "border-teal-600 bg-teal-50/70" : "border-white/70 bg-white/35 hover:border-teal-500/70 hover:bg-white/55"
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
            <Upload className="h-8 w-8 text-slate-700" aria-hidden="true" />
            <p className="mt-3 text-sm font-medium text-slate-900">Перетащите файл сюда или выберите его</p>
            <p className="mt-1 text-xs text-slate-500">CSV, XLS, XLSX</p>
          </div>

          {file && (
            <div className="flex items-center justify-between gap-3 rounded-md border border-white/60 bg-white/45 px-3 py-3">
              <div className="flex min-w-0 items-center gap-3">
                <FileSpreadsheet className="h-5 w-5 shrink-0 text-teal-700" aria-hidden="true" />
                <span className="truncate text-sm font-medium text-slate-800">{file.name}</span>
              </div>
              <button
                type="button"
                className="rounded-md p-1 text-slate-500 transition hover:bg-white/70 hover:text-slate-800"
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
          <span className="text-sm font-medium text-slate-800">Сырой текст</span>
          <textarea
            ref={textareaRef}
            value={rawText}
            onChange={(event) => handleRawTextChange(event.target.value)}
            placeholder="product,region,revenue&#10;Alpha,North,1200&#10;Beta,South,950"
            className={[
              "resize-none overflow-y-auto rounded-lg border border-white/70 bg-white/55 px-3 py-3 text-sm leading-6 text-slate-900 outline-none transition-[height,border-color,box-shadow,background-color] duration-200 placeholder:text-slate-400 focus:border-teal-600 focus:ring-4 focus:ring-teal-100/70",
              isWideHome ? "h-[320px] min-h-[320px] max-h-[520px]" : "h-[260px] min-h-[260px] max-h-[420px]"
            ].join(" ")}
          />
        </label>
      </div>

      <button
        type="submit"
        disabled={!canSubmit || disabled}
        className="inline-flex h-11 shrink-0 items-center justify-center gap-2 rounded-md bg-slate-950 px-4 text-sm font-semibold text-white shadow-lg shadow-slate-900/10 transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-300"
      >
        {disabled ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : <FileSpreadsheet className="h-4 w-4" aria-hidden="true" />}
        Анализировать
      </button>
    </form>
  );
}
