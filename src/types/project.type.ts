export interface MetricDetail {
  /** The measured metric value, e.g. "1.2 s" or "150 ms" */
  value: string;
  /** Actionable steps to improve this metric */
  recommendedSteps: string[];
}

/**
 * All performance metrics for a page.
 */
export interface PerformanceMetrics {
  FCP: MetricDetail; // First Contentful Paint
  LCP: MetricDetail; // Largest Contentful Paint
  CLS: MetricDetail; // Cumulative Layout Shift
  TBT: MetricDetail; // Total Blocking Time
}

/**
 * One analysis record for a given route.
 */
export interface AnalysisInsight {
  /** The URL or route that was analyzed */
  route: string;
  /** Array of performance metrics for that route */
  performanceData: PerformanceMetrics[];
  /** Per-metric suggested edits from the analyzer (keys may be a subset of FCP/LCP/CLS/TBT). */
  codeChanges?: Partial<Record<keyof PerformanceMetrics, CodeChange[]>>;
}

/**
 * Payload when creating a new project.
 */
export interface CreateProjectRequest {
  /** The website URL to analyze */
  website: string;
  /** A human‑readable name (can be same as website) */
  name: string;
  /** The ID of the user creating this project */
  userId: string;
}

/**
 * Payload when requesting details for a specific project.
 */
export interface GetProjectDetailsRequest {
  projectId: string;
  userId: string;
}

/**
 * The shape of a project returned by API.
 */

export interface CodeChange {
  file: string;
  startLine: number;
  endLine: number;
  oldCode: string;
  newCode: string;
  explanation: string;
}
export interface ProjectResponse {
  id: string;
  name: string;
  website: string;
  gitUrl?: string,
  analysisSummary: AnalysisInsight[];
  status: string;
  createdAt: Date;
  updatedAt: Date;
}

export type RerunResponse = {
  message: string;
};

export type AutoPrMetric = "LCP" | "FCP" | "CLS" | "TBT";

export type AutoPullRequestResponse = {
  ok: boolean;
  dryRun: boolean;
  title: string;
  branch: string;
  prUrl?: string | null;
  diff: string;
  changedFiles: string[];
};
