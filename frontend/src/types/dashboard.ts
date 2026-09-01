export type SourceType = "csv" | "excel" | "text";
export type ColumnType = "number" | "date" | "category" | "text" | "unknown";
export type ChartType = "bar" | "line" | "pie";
export type AnalysisSource = "ai" | "fallback";

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
  y_key: string | null;
  reason: string;
  filter?: Record<string, string> | null;
}

export interface PreparedChart {
  spec: ChartSpec;
  data: Record<string, string | number | null>[];
}

export interface AIAnalysis {
  headline: string;
  insight_summary: string;
  narrative: string;
  key_observations: string[];
  charts: ChartSpec[];
}

export interface AnalyzeResponse {
  session_id: string;
  analysis_source: AnalysisSource;
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

export interface AskRequest {
  session_id: string;
  question: string;
}

export interface AskResponse {
  answer: string;
  confidence: "high" | "medium" | "low" | "none";
  used_columns: string[];
}
