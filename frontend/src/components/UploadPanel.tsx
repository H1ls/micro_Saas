import { FileSpreadsheet, Loader2, Upload, X } from "lucide-react";
import { DragEvent, FormEvent, useMemo, useRef, useState } from "react";
import type { AnalyzeInput } from "../api/client";

interface UploadPanelProps {
  disabled?: boolean;
  onAnalyze: (input: AnalyzeInput) => Promise<void>;
}

export function UploadPanel({ disabled = false, onAnalyze }: UploadPanelProps) {
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
    <form onSubmit={handleSubmit} className="flex h-full min-h-[620px] flex-col gap-5 rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
      <div>
        <h2 className="text-xl font-semibold text-slate-950">Analyze data</h2>
        <p className="mt-1 text-sm leading-6 text-slate-600">Upload CSV or Excel, or paste structured text.</p>
      </div>

      <div
        onDragOver={(event) => {
          event.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        className={[
          "flex min-h-[180px] cursor-pointer flex-col items-center justify-center rounded-lg border border-dashed p-5 text-center transition",
          isDragging ? "border-teal-500 bg-teal-50" : "border-slate-300 bg-slate-50 hover:border-teal-500"
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
        <Upload className="h-9 w-9 text-teal-700" aria-hidden="true" />
        <p className="mt-3 text-sm font-medium text-slate-900">Drop a file here or browse</p>
        <p className="mt-1 text-xs text-slate-500">CSV, XLS, XLSX</p>
      </div>

      {file && (
        <div className="flex items-center justify-between gap-3 rounded-md border border-slate-200 bg-slate-50 px-3 py-3">
          <div className="flex min-w-0 items-center gap-3">
            <FileSpreadsheet className="h-5 w-5 shrink-0 text-teal-700" aria-hidden="true" />
            <span className="truncate text-sm font-medium text-slate-800">{file.name}</span>
          </div>
          <button
            type="button"
            className="rounded-md p-1 text-slate-500 hover:bg-slate-200 hover:text-slate-800"
            onClick={() => setFile(null)}
            aria-label="Remove selected file"
            title="Remove selected file"
          >
            <X className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>
      )}

      <label className="flex min-h-0 flex-1 flex-col gap-2">
        <span className="text-sm font-medium text-slate-800">Raw text</span>
        <textarea
          value={rawText}
          onChange={(event) => setRawText(event.target.value)}
          placeholder="product,region,revenue&#10;Alpha,North,1200&#10;Beta,South,950"
          className="min-h-[180px] flex-1 resize-none rounded-lg border border-slate-300 bg-white px-3 py-3 text-sm leading-6 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-teal-500 focus:ring-4 focus:ring-teal-100"
        />
      </label>

      <button
        type="submit"
        disabled={!canSubmit || disabled}
        className="inline-flex h-11 items-center justify-center gap-2 rounded-md bg-slate-950 px-4 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-300"
      >
        {disabled ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : <BarChartIcon />}
        Analyze
      </button>
    </form>
  );
}

function BarChartIcon() {
  return <FileSpreadsheet className="h-4 w-4" aria-hidden="true" />;
}
