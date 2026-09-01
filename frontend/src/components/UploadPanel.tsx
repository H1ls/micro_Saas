import { FileSpreadsheet, Loader2, Upload, X } from "lucide-react";
import { DragEvent, FormEvent, useMemo, useRef, useState } from "react";
import type { AnalyzeInput } from "../api/client";

interface UploadPanelProps {
  collapsed?: boolean;
  disabled?: boolean;
  onAnalyze: (input: AnalyzeInput) => Promise<void>;
}

export function UploadPanel({ collapsed = false, disabled = false, onAnalyze }: UploadPanelProps) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [rawText, setRawText] = useState("");
  const [isDragging, setIsDragging] = useState(false);

  const canSubmit = useMemo(() => Boolean(file || rawText.trim()), [file, rawText]);

  function handleDrop(event: DragEvent<HTMLDivElement>) {
    event.preventDefault();
    setIsDragging(false);
    const droppedFile = event.dataTransfer.files.item(0);
    if (droppedFile) {
      setFile(droppedFile);
    }
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
        collapsed
          ? "fixed bottom-4 left-4 h-12 w-72 overflow-hidden rounded-lg hover:h-[440px] hover:w-[380px] focus-within:h-[440px] focus-within:w-[380px]"
          : "h-full min-h-0 rounded-lg"
      ].join(" ")}
    >
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0">
          <h2 className="truncate text-lg font-semibold text-slate-950">Анализ данных</h2>
          <p className={collapsed ? "hidden text-sm leading-6 text-slate-600 group-hover:block group-focus-within:block" : "mt-1 text-sm leading-6 text-slate-600"}>
            Загрузите CSV или Excel либо вставьте структурированный текст.
          </p>
        </div>
        {collapsed && (
          <span className="shrink-0 rounded-md bg-teal-600/90 px-2 py-1 text-xs font-semibold text-white">
            Input
          </span>
        )}
      </div>

      <div
        onDragOver={(event) => {
          event.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        className={[
          "flex min-h-[132px] cursor-pointer flex-col items-center justify-center rounded-lg border border-dashed p-4 text-center transition",
          isDragging ? "border-teal-500 bg-teal-50/75" : "border-white/70 bg-white/35 hover:border-teal-400 hover:bg-white/55"
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
        <Upload className="h-8 w-8 text-teal-700" aria-hidden="true" />
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

      <label className="flex min-h-0 flex-1 flex-col gap-2">
        <span className="text-sm font-medium text-slate-800">Сырой текст</span>
        <textarea
          value={rawText}
          onChange={(event) => setRawText(event.target.value)}
          placeholder="product,region,revenue&#10;Alpha,North,1200&#10;Beta,South,950"
          className="min-h-[120px] flex-1 resize-none rounded-lg border border-white/70 bg-white/55 px-3 py-3 text-sm leading-6 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-teal-500 focus:ring-4 focus:ring-teal-100"
        />
      </label>

      <button
        type="submit"
        disabled={!canSubmit || disabled}
        className="inline-flex h-11 items-center justify-center gap-2 rounded-md bg-slate-950 px-4 text-sm font-semibold text-white shadow-lg shadow-slate-900/10 transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-300"
      >
        {disabled ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : <FileSpreadsheet className="h-4 w-4" aria-hidden="true" />}
        Анализировать
      </button>
    </form>
  );
}
