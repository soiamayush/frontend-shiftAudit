import type {
  AnalysisInsight,
  CodeChange,
  MetricDetail,
} from "@/types/project.type";

export type CodeChangeWithMetric = CodeChange & { metric: string };

const PSI_USER_COPY =
  "PageSpeed metrics aren’t available for this route right now. Try again later, or audit fewer URLs in one run.";

/**
 * Replace raw worker/CrUX/API wording with short copy for end users.
 */
export function humanizeRecommendedStep(step: string): string {
  const s = String(step ?? "").trim();
  if (!s) return s;
  const lower = s.toLowerCase();
  const mentionsPsi =
    lower.includes("pagespeed") ||
    lower.includes("psi_max_urls") ||
    lower.includes(" pagespeed ");
  const technical =
    /\b429\b/.test(lower) ||
    lower.includes("too many requests") ||
    lower.includes("quota") ||
    lower.includes("circuit open") ||
    lower.includes("rate limit") ||
    lower.includes("rate-limit") ||
    lower.includes("not sent to google") ||
    lower.includes("page_speed_api") ||
    lower.includes("pagespeed insights api") ||
    (lower.includes("google cloud") && lower.includes("pagespeed")) ||
    (lower.includes("skipped") && lower.includes("pagespeed"));
  if (mentionsPsi && technical) return PSI_USER_COPY;
  return s;
}

/** API may omit metrics or send empty arrays. */
export function flattenCodeChanges(
  codeChanges: AnalysisInsight["codeChanges"] | unknown
): CodeChangeWithMetric[] {
  if (!codeChanges || typeof codeChanges !== "object") return [];
  const out: CodeChangeWithMetric[] = [];
  for (const [metric, arr] of Object.entries(codeChanges as Record<string, unknown>)) {
    if (!Array.isArray(arr)) continue;
    for (const item of arr) {
      if (!item || typeof item !== "object") continue;
      const c = item as CodeChange;
      if (!c.file) continue;
      out.push({ ...c, metric: metric.toUpperCase() });
    }
  }
  return out;
}

export function displayMetricValue(metricKey: string, raw: string): string {
  const v = String(raw ?? "").trim();
  if (!v || /^n\/a$/i.test(v)) return v || "—";
  if (v.includes("%")) return v;
  const m = metricKey.toUpperCase();
  if (m === "CLS") return v;
  if (m === "TBT" && !/\bms\b/i.test(v)) return v.endsWith("s") ? v : `${v} ms`;
  return v;
}

const EXT_LANG: [RegExp, string][] = [
 [/\.tsx?$/i, "typescript"],
  [/\.jsx?$/i, "javascript"],
  [/\.vue$/i, "html"],
  [/\.s?css$/i, "scss"],
  [/\.html?$/i, "html"],
  [/\.json$/i, "json"],
  [/\.py$/i, "python"],
  [/\.md$/i, "markdown"],
];

/** Color class from LLM/status hints in recommendedSteps. */
export function metricStatusTextClass(detail: MetricDetail): string {
  const blob = detail.recommendedSteps.join(" ");
  if (/needs improvement/i.test(blob)) return "text-red-400";
  if (/moderate/i.test(blob)) return "text-yellow-400";
  if (/good/i.test(blob)) return "text-green-400";
  return "text-cyan-200";
}

export function inferEditorLanguage(filePath: string): string {
  const f = filePath.split("/").pop() ?? filePath;
  for (const [re, lang] of EXT_LANG) {
    if (re.test(f)) return lang;
  }
  return "plaintext";
}
