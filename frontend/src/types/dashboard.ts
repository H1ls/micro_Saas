export type SourceType = "csv" | "excel" | "text";
export type ColumnType = "number" | "datetime" | "category" | "text" | "unknown";
export type ChartType = "bar" | "line" | "pie";

export interface ColumnProfile {
  name: string;
  type: ColumnType;
  non_null_count: number;
  sample_values: string[];
}

export interface DatasetSummary {
  source_type: SourceType;
  filename: string | null;
  row_count: number;
  column_count: number;
  columns: ColumnProfile[];
}

export interface ChartSpec {
  id: string;
  title: string;
  type: ChartType;
  x_key: string;
  y_key: string;
  reason: string;
}

export interface PreparedChart {
  spec: ChartSpec;
  data: Record<string, string | number | null>[];
}

export interface AIAnalysis {
  headline: string;
  narrative: string;
  observations: string[];
  chart_specs: ChartSpec[];
}

export interface AnalyzeResponse {
  session_id: string;
  dataset: DatasetSummary;
  analysis: AIAnalysis;
  charts: PreparedChart[];
}

export interface ApiErrorResponse {
  error?: {
    code?: string;
    message?: string;
  };
}
