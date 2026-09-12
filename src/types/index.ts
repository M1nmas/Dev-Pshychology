export type RoastSeverity = "low" | "medium" | "high";

export interface RoastResult {
  message: string;
  flags: number;
  severity: RoastSeverity;
  observations: string[];
  advice: string;
}

export interface CodeAnalysis {
  flags: number;
  patterns: string[];
  severity: RoastSeverity;
}

export interface RoastRequest {
  code: string;
  variation: number;
}