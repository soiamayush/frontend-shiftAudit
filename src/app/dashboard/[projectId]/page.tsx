"use client";

import { useEffect, useMemo, useRef, useState, useCallback } from "react";
import { useRouter, useParams } from "next/navigation";
import { useAuth } from "@/hooks/usAuth";
import { API_ROUTES } from "@/config";
import { AnalysisInsight } from "@/types/project.type";
import { CodeChangesPanel } from "@/components/CodeChangesPanel";
import {
  displayMetricValue,
  flattenCodeChanges,
  humanizeRecommendedStep,
  metricStatusTextClass,
} from "@/lib/analysisDisplay";
import {
  ArrowLeftIcon,
  ArrowPathIcon,
  CodeBracketIcon,
  XMarkIcon,
  GlobeAltIcon,
  InformationCircleIcon,
  BoltIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
} from "@heroicons/react/24/outline";
import type { AutoPullRequestResponse, AutoPrMetric } from "@/types/project.type";

/** Browser-only storage for demo UX; PATs are sensitive—revoke if this machine is shared. */
const GITHUB_TOKEN_STORAGE_KEY = "shiftaudit_github_pat_v1";
const LINK_GITHUB_PAT_DOCS =
  "https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/managing-your-personal-access-tokens";
const LINK_GITHUB_CLASSIC_TOKENS = "https://github.com/settings/tokens";
const LINK_GITHUB_FINE_GRAINED_NEW =
  "https://github.com/settings/personal-access-tokens/new";

function routeId(route: string) {
  return `route-${encodeURIComponent(route).replace(/%/g, "_")}`;
}

function routeLabel(route: string) {
  try {
    const u = new URL(route);
    return u.pathname === "/" ? "/ (home)" : u.pathname;
  } catch {
    return route;
  }
}

const METRIC_ICONS: Record<string, string> = {
  FCP: "paint",
  LCP: "image",
  CLS: "layout",
  TBT: "cpu",
};

export default function ProjectAnalysisPage() {
  const router = useRouter();
  const { projectId } = useParams<{ projectId: string }>();
  const { token } = useAuth();

  const [analysis, setAnalysis] = useState<AnalysisInsight[]>([]);
  const [status, setStatus] = useState<"pending" | "complete" | string>("");
  const [rerunning, setRerunning] = useState(false);
  const [rerunStatus, setRerunStatus] = useState("");
  const pollingRef = useRef<NodeJS.Timeout | null>(null);
  const [activeRoute, setActiveRoute] = useState("");

  const [autoPrOpen, setAutoPrOpen] = useState(false);
  const [autoPrRoute, setAutoPrRoute] = useState("");
  const [autoPrMetric, setAutoPrMetric] = useState<AutoPrMetric>("LCP");
  const [autoPrDryRun, setAutoPrDryRun] = useState(true);
  const [autoPrRunning, setAutoPrRunning] = useState(false);
  const [autoPrError, setAutoPrError] = useState("");
  const [autoPrResult, setAutoPrResult] =
    useState<AutoPullRequestResponse | null>(null);
  const [showDryRunHelp, setShowDryRunHelp] = useState(false);
  const [autoPrGithubToken, setAutoPrGithubToken] = useState("");
  const [autoPrRememberGithubToken, setAutoPrRememberGithubToken] =
    useState(true);
  const [showGithubPatHelp, setShowGithubPatHelp] = useState(false);

  useEffect(() => {
    if (!autoPrOpen || typeof window === "undefined") return;
    const saved = localStorage.getItem(GITHUB_TOKEN_STORAGE_KEY);
    if (saved) setAutoPrGithubToken(saved);
  }, [autoPrOpen]);

  const fetchAnalysis = useCallback(async () => {
    if (!token) return;
    const res = await fetch(API_ROUTES.PROJECT_DETAILS(projectId), {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    if (!res.ok) return;
    setAnalysis(
      Array.isArray(data.analysisSummary) ? data.analysisSummary : []
    );
    setStatus(typeof data.status === "string" ? data.status : "");
  }, [projectId, token]);

  const routes = useMemo(
    () => analysis.map((a) => a.route).filter(Boolean),
    [analysis]
  );

  async function handleRerun() {
    if (!token) return;
    setRerunning(true);
    setRerunStatus("Re-running analysis...");
    const res = await fetch(API_ROUTES.RERUN(projectId), {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
    });
    setRerunStatus(res.ok ? "Analysis started!" : "Failed to start");
    if (res.ok) {
      setStatus("pending");
      setAnalysis([]);
    }
    setTimeout(() => setRerunStatus(""), 3000);
    setRerunning(false);
  }

  async function runAutoPr() {
    if (!token || !projectId || !autoPrRoute.trim()) return;
    setAutoPrRunning(true);
    setAutoPrError("");
    setAutoPrResult(null);
    try {
      if (!autoPrDryRun && autoPrRememberGithubToken && autoPrGithubToken.trim()) {
        localStorage.setItem(
          GITHUB_TOKEN_STORAGE_KEY,
          autoPrGithubToken.trim()
        );
      }
      const res = await fetch(API_ROUTES.AUTO_PR, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          projectId,
          route: autoPrRoute.trim(),
          metric: autoPrMetric,
          dryRun: autoPrDryRun,
          ...(autoPrDryRun
            ? {}
            : { githubToken: autoPrGithubToken.trim() || undefined }),
        }),
      });
      const data = await res.json();
      if (!res.ok)
        setAutoPrError(data?.detail || data?.error || "Failed to generate PR");
      else setAutoPrResult(data);
    } catch (e: any) {
      setAutoPrError(e?.message || "Failed to generate PR");
    } finally {
      setAutoPrRunning(false);
    }
  }

  useEffect(() => {
    fetchAnalysis();
  }, [fetchAnalysis]);

  useEffect(() => {
    if (status === "pending")
      pollingRef.current = setInterval(fetchAnalysis, 5000);
    else clearInterval(pollingRef.current!);
    return () => clearInterval(pollingRef.current!);
  }, [status, fetchAnalysis]);

  useEffect(() => {
    if (!routes.length) return;
    const els = routes
      .map((r) => document.getElementById(routeId(r)))
      .filter(Boolean) as HTMLElement[];
    if (!els.length) return;
    const obs = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort(
            (a, b) => (b.intersectionRatio ?? 0) - (a.intersectionRatio ?? 0)
          );
        if (visible.length) {
          const id = visible[0].target.getAttribute("data-route") || "";
          if (id) setActiveRoute(id);
        }
      },
      { root: null, rootMargin: "-20% 0px -70% 0px", threshold: [0.1, 0.25, 0.5] }
    );
    for (const el of els) obs.observe(el);
    return () => obs.disconnect();
  }, [routes]);

  function scrollToRoute(r: string) {
    const el = document.getElementById(routeId(r));
    if (!el) return;
    el.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  return (
    <div className="relative min-h-screen bg-[#060611] text-white overflow-x-hidden">
      {/* Animated background mesh */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-[-20%] right-[-10%] w-[600px] h-[600px] bg-cyan-500/15 blur-[140px] animate-float-slow" />
        <div className="absolute bottom-[-15%] left-[-8%] w-[500px] h-[500px] bg-blue-600/15 blur-[120px] animate-float-slower" />
        <div className="absolute top-[40%] left-[30%] w-[400px] h-[400px] bg-indigo-500/10 blur-[100px] animate-float-medium" />
        <div className="absolute top-[10%] left-[50%] w-[300px] h-[300px] bg-purple-500/8 blur-[80px] animate-float-reverse" />
      </div>

      <div className="relative z-10 p-4 md:p-8 mt-10">
        {/* Header */}
        <div className="flex justify-between items-center mb-8 border-b border-white/[0.06] pb-5">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.back()}
              className="group p-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 cursor-pointer transition-all duration-200 hover:border-cyan-500/30"
            >
              <ArrowLeftIcon className="w-5 h-5 text-gray-400 group-hover:text-cyan-400 transition-colors" />
            </button>
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-cyan-400 via-blue-400 to-indigo-400 bg-clip-text text-transparent">
                Performance Analysis
              </h1>
              <p className="text-gray-500 text-sm mt-0.5">
                AI-powered optimization insights
              </p>
            </div>
          </div>

          <button
            onClick={handleRerun}
            disabled={rerunning}
            className="group px-5 py-2.5 rounded-xl cursor-pointer bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 transition-all duration-300 flex items-center gap-2 shadow-lg shadow-cyan-500/20 hover:shadow-cyan-500/30 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            <ArrowPathIcon
              className={`w-4 h-4 ${rerunning ? "animate-spin" : "group-hover:rotate-180 transition-transform duration-500"}`}
            />
            <span className="font-medium text-sm">
              {rerunning ? "Running..." : "Rerun Analysis"}
            </span>
          </button>
        </div>

        {/* Rerun status toast */}
        {rerunStatus && (
          <div className="mb-6 flex items-center gap-2 text-sm px-4 py-2.5 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-300 animate-fade-in">
            <BoltIcon className="w-4 h-4" />
            {rerunStatus}
          </div>
        )}

        {/* Layout: sidebar + content */}
        <div className="flex flex-col lg:flex-row gap-8 items-start">
          {/* Sidebar */}
          <aside className="hidden lg:block w-[260px] flex-shrink-0 sticky top-20 z-20 self-start" style={{ position: "sticky" }}>
            <div className="bg-[#0d1117]/80 border border-white/[0.06] rounded-2xl p-4 backdrop-blur-xl shadow-2xl shadow-black/40">
              <div className="flex items-center gap-2 mb-4 px-1">
                <GlobeAltIcon className="w-4 h-4 text-cyan-400" />
                <span className="text-sm font-semibold text-gray-200">
                  Routes
                </span>
                <span className="ml-auto text-xs px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-300 border border-cyan-500/20">
                  {routes.length}
                </span>
              </div>

              {routes.length === 0 ? (
                <div className="text-sm text-gray-500 px-1">
                  No routes discovered yet.
                </div>
              ) : (
                <nav className="max-h-[65vh] overflow-auto space-y-1 pr-1 sidebar-scroll">
                  {routes.map((r, i) => {
                    const active = r === activeRoute;
                    return (
                      <button
                        key={r}
                        onClick={() => scrollToRoute(r)}
                        className={[
                          "group w-full text-left px-3 py-2.5 rounded-xl border transition-all duration-200 cursor-pointer relative",
                          active
                            ? "bg-gradient-to-r from-cyan-500/10 to-blue-500/5 border-cyan-500/30 shadow-md shadow-cyan-500/5"
                            : "bg-transparent border-transparent hover:bg-white/[0.03] hover:border-white/[0.08]",
                        ].join(" ")}
                        title={r}
                      >
                        {active && (
                          <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 rounded-full bg-cyan-400" />
                        )}
                        <div className="flex items-center gap-2">
                          <CodeBracketIcon
                            className={`w-3.5 h-3.5 flex-shrink-0 transition-colors ${active ? "text-cyan-400" : "text-gray-600 group-hover:text-gray-400"}`}
                          />
                          <span
                            className={`text-xs font-mono truncate transition-colors ${active ? "text-cyan-200" : "text-gray-400 group-hover:text-gray-200"}`}
                          >
                            {routeLabel(r)}
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </nav>
              )}
            </div>
          </aside>

          {/* Main content */}
          <div className="flex-1 min-w-0">
            {/* Loading */}
            {analysis.length === 0 && status === "pending" && (
              <div className="text-center py-24">
                <div className="relative w-20 h-20 mx-auto">
                  <div className="absolute inset-0 border-4 border-cyan-500/20 rounded-full" />
                  <div className="absolute inset-0 border-4 border-transparent border-t-cyan-500 rounded-full animate-spin" />
                </div>
                <p className="mt-8 text-gray-400 text-sm">
                  Analyzing performance...
                </p>
                <p className="mt-1 text-gray-600 text-xs">
                  This may take a minute
                </p>
              </div>
            )}

            {/* Route cards */}
            {analysis.map((insight, idx) => (
              <section
                key={idx}
                id={routeId(insight.route)}
                data-route={insight.route}
                className="mb-8 bg-[#0d1117]/60 rounded-2xl border border-white/[0.06] backdrop-blur-sm hover:border-white/[0.1] transition-all duration-300 animate-card-in"
                style={{ animationDelay: `${idx * 80}ms` }}
              >
                {/* Route header */}
                <div className="p-5 border-b border-white/[0.06] flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="p-2 rounded-lg bg-cyan-500/10 border border-cyan-500/20">
                      <CodeBracketIcon className="w-4 h-4 text-cyan-400" />
                    </div>
                    <div className="min-w-0">
                      <h2 className="text-white font-semibold text-sm truncate">
                        {routeLabel(insight.route)}
                      </h2>
                      <p className="text-gray-500 text-xs font-mono truncate">
                        {insight.route}
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      setAutoPrOpen(true);
                      setAutoPrRoute(insight.route);
                      setAutoPrMetric("LCP");
                      setAutoPrDryRun(true);
                      setAutoPrError("");
                      setAutoPrResult(null);
                      setShowDryRunHelp(false);
                    }}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-500/10 to-blue-500/10 hover:from-cyan-500/20 hover:to-blue-500/20 border border-cyan-500/20 hover:border-cyan-500/40 text-cyan-300 text-sm font-medium cursor-pointer transition-all duration-200"
                  >
                    <BoltIcon className="w-4 h-4" />
                    Auto PR
                  </button>
                </div>

                {/* Metrics grid */}
                <div className="p-5 grid grid-cols-2 lg:grid-cols-4 gap-3">
                  {insight.performanceData.map((metrics) =>
                    Object.entries(metrics).map(([name, detail]) => (
                      <div
                        key={name}
                        className="group bg-[#0a0e18] p-4 rounded-xl border border-white/[0.06] hover:border-cyan-500/20 transition-all duration-200 cursor-default"
                      >
                        <div className="flex items-center justify-between mb-3">
                          <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                            {name}
                          </span>
                          <span
                            className={`text-lg font-bold tabular-nums ${metricStatusTextClass(detail)}`}
                          >
                            {displayMetricValue(name, detail.value)}
                          </span>
                        </div>
                        <div className="space-y-1.5">
                          {detail.recommendedSteps
                            .slice(0, 2)
                            .map((s: string, i: number) => (
                              <p
                                key={i}
                                className="text-xs text-gray-500 leading-relaxed"
                              >
                                {humanizeRecommendedStep(s)}
                              </p>
                            ))}
                        </div>
                      </div>
                    ))
                  )}
                </div>

                {(() => {
                  const codeChangesList = flattenCodeChanges(
                    insight.codeChanges
                  );
                  if (codeChangesList.length === 0) return null;
                  return <CodeChangesPanel changes={codeChangesList} />;
                })()}
              </section>
            ))}
          </div>
        </div>
      </div>

      {/* Auto PR Modal */}
      {autoPrOpen && (
        <div
          className="fixed inset-0 z-50 flex min-h-full items-center justify-center overflow-y-auto bg-black/70 backdrop-blur-sm p-4 sm:p-6 animate-fade-in"
          onClick={() => setAutoPrOpen(false)}
        >
          <div
            className="bg-[#0d1117] rounded-2xl w-full max-w-5xl border border-white/[0.08] shadow-2xl shadow-black/60 animate-modal-in flex flex-col max-h-[min(92vh,56rem)] my-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal header — stays fixed while body scrolls */}
            <div className="flex justify-between items-start gap-4 p-6 pb-4 flex-shrink-0 border-b border-white/[0.06]">
              <div className="flex items-center gap-3 min-w-0">
                <div className="p-2 rounded-xl bg-gradient-to-br from-cyan-500/10 to-blue-500/10 border border-cyan-500/20 flex-shrink-0">
                  <BoltIcon className="w-5 h-5 text-cyan-400" />
                </div>
                <div className="min-w-0">
                  <h2 className="text-lg font-bold text-white">
                    Auto Pull Request
                  </h2>
                  <p className="text-gray-500 text-xs mt-0.5">
                    Generate a performance fix + open a PR
                  </p>
                </div>
              </div>
              <button
                onClick={() => setAutoPrOpen(false)}
                className="p-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/[0.06] hover:border-white/[0.12] cursor-pointer transition-all duration-200 group flex-shrink-0"
              >
                <XMarkIcon className="w-4 h-4 text-gray-500 group-hover:text-white transition-colors" />
              </button>
            </div>

            <div className="space-y-4 p-6 pt-5 flex-1 min-h-0 overflow-y-auto overscroll-contain sidebar-scroll">
              {/* Dry run help */}
              {showDryRunHelp && (
                <div className="flex items-start gap-3 text-sm bg-cyan-500/5 border border-cyan-500/15 rounded-xl p-4 animate-fade-in">
                  <InformationCircleIcon className="w-5 h-5 text-cyan-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <div className="font-semibold text-cyan-200 text-sm mb-1">
                      What is Dry Run?
                    </div>
                    <p className="text-gray-400 text-xs leading-relaxed">
                      <strong className="text-gray-300">ON</strong>: Only
                      generates and shows the diff. No branch, no commit, no PR
                      is created. Safe to test.
                    </p>
                    <p className="text-gray-400 text-xs leading-relaxed mt-1">
                      <strong className="text-gray-300">OFF</strong>: Creates a
                      real branch, commits the fix, and opens a Pull Request on
                      GitHub. Paste a personal access token in the field below,
                      or set{" "}
                      <code className="text-cyan-300 bg-cyan-500/10 px-1 rounded">
                        GITHUB_TOKEN
                      </code>{" "}
                      on the server.
                    </p>
                    <button
                      className="mt-2.5 text-xs px-3 py-1 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 cursor-pointer transition text-gray-300"
                      onClick={() => setShowDryRunHelp(false)}
                    >
                      Got it
                    </button>
                  </div>
                </div>
              )}

              {/* Route */}
              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1.5 uppercase tracking-wider">
                  Route
                </label>
                <input
                  value={autoPrRoute}
                  onChange={(e) => setAutoPrRoute(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-white/[0.03] border border-white/[0.08] focus:outline-none focus:border-cyan-500/40 focus:ring-1 focus:ring-cyan-500/20 text-sm text-white placeholder-gray-600 transition-all"
                  placeholder="https://example.com/"
                />
              </div>

              {/* Metric + Dry run row */}
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="flex-1">
                  <label className="block text-xs font-medium text-gray-400 mb-1.5 uppercase tracking-wider">
                    Metric
                  </label>
                  <select
                    value={autoPrMetric}
                    onChange={(e) =>
                      setAutoPrMetric(e.target.value as AutoPrMetric)
                    }
                    className="w-full px-4 py-2.5 rounded-xl bg-[#0a0e18] text-white border border-white/[0.08] focus:outline-none focus:border-cyan-500/40 text-sm cursor-pointer transition-all"
                  >
                    <option value="LCP" className="bg-[#0a0e18]">
                      LCP — Largest Contentful Paint
                    </option>
                    <option value="FCP" className="bg-[#0a0e18]">
                      FCP — First Contentful Paint
                    </option>
                    <option value="CLS" className="bg-[#0a0e18]">
                      CLS — Cumulative Layout Shift
                    </option>
                    <option value="TBT" className="bg-[#0a0e18]">
                      TBT — Total Blocking Time
                    </option>
                  </select>
                </div>

                <div className="flex items-end gap-2 pb-0.5">
                  <label className="flex items-center gap-2 text-sm text-gray-300 cursor-pointer select-none px-3 py-2 rounded-xl bg-white/[0.03] border border-white/[0.06] hover:border-white/[0.1] transition-all">
                    <input
                      type="checkbox"
                      checked={autoPrDryRun}
                      onChange={(e) => setAutoPrDryRun(e.target.checked)}
                      className="accent-cyan-500 cursor-pointer"
                    />
                    <span className="text-xs font-medium">Dry run</span>
                  </label>
                  <button
                    type="button"
                    title="What is dry run?"
                    className="p-2 rounded-xl bg-white/[0.03] hover:bg-white/[0.06] border border-white/[0.06] hover:border-cyan-500/20 cursor-pointer transition-all duration-200 group"
                    onClick={() => setShowDryRunHelp((v) => !v)}
                  >
                    <InformationCircleIcon className="w-4 h-4 text-gray-500 group-hover:text-cyan-400 transition-colors" />
                  </button>
                </div>
              </div>

              {/* GitHub PAT (required when not dry run) */}
              <div
                className={`rounded-xl border p-4 space-y-3 transition-colors ${
                  autoPrDryRun
                    ? "border-white/[0.06] bg-white/[0.02]"
                    : "border-amber-500/25 bg-amber-500/[0.06]"
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <label className="block text-xs font-medium text-gray-300 mb-1 uppercase tracking-wider">
                      GitHub personal access token
                      {!autoPrDryRun && (
                        <span className="text-amber-400/90 normal-case font-normal">
                          {" "}
                          · needed unless the API has{" "}
                          <code className="text-[10px] bg-black/30 px-1 rounded">
                            GITHUB_TOKEN
                          </code>
                        </span>
                      )}
                    </label>
                    <p className="text-[11px] text-gray-500 leading-relaxed">
                      {autoPrDryRun
                        ? "Not needed for preview. Turn off Dry run to create a real PR on your repo."
                        : "Use a classic personal access token from an account that can push to this repo (see Help). Or set GITHUB_TOKEN on the API server."}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowGithubPatHelp((v) => !v)}
                    className="shrink-0 text-[11px] px-2 py-1 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-cyan-300/90"
                  >
                    {showGithubPatHelp ? "Hide" : "How to get a token"}
                  </button>
                </div>

                {showGithubPatHelp && (
                  <div className="text-[11px] text-gray-400 space-y-2 border-t border-white/10 pt-3">
                    <p className="leading-relaxed text-gray-300">
                      <strong className="text-white">Which account?</strong> The
                      token must belong to a GitHub user who is allowed to create
                      branches and open pull requests on the repository in your
                      project&apos;s{" "}
                      <code className="text-cyan-200/90 bg-white/5 px-1 rounded">
                        gitUrl
                      </code>{" "}
                      (e.g.{" "}
                      <code className="text-cyan-200/90 bg-white/5 px-1 rounded">
                        github.com/you/your-repo
                      </code>
                      ). Usually that&apos;s <strong>your own account</strong> if
                      you own the repo, or a teammate/org bot with{" "}
                      <strong>write</strong> access—not a random user.
                    </p>
                    <p className="leading-relaxed">
                      ShiftAudit Auto PR is tested with a{" "}
                      <strong className="text-gray-300">classic</strong> personal
                      access token (not fine-grained). GitHub&apos;s API uses the
                      token as &quot;who&quot; is pushing the branch and opening
                      the PR.
                    </p>
                    <ul className="list-disc pl-4 space-y-1.5">
                      <li>
                        <span className="text-gray-300">Recommended — classic PAT:</span>{" "}
                        <a
                          href={LINK_GITHUB_CLASSIC_TOKENS}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-cyan-400 hover:underline underline-offset-2"
                        >
                          github.com/settings/tokens
                        </a>{" "}
                        → <strong className="text-gray-300">Generate new token (classic)</strong>{" "}
                        → enable the{" "}
                        <code className="text-gray-300 bg-white/5 px-1 rounded text-[10px]">
                          repo
                        </code>{" "}
                        scope (private repos) or{" "}
                        <code className="text-gray-300 bg-white/5 px-1 rounded text-[10px]">
                          public_repo
                        </code>{" "}
                        for public-only.
                      </li>
                      <li>
                        <span className="text-gray-300">Docs:</span>{" "}
                        <a
                          href={LINK_GITHUB_PAT_DOCS}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-cyan-400 hover:underline underline-offset-2"
                        >
                          Managing personal access tokens
                        </a>
                      </li>
                      <li>
                        <span className="text-gray-300">Optional — fine-grained:</span>{" "}
                        <a
                          href={LINK_GITHUB_FINE_GRAINED_NEW}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-cyan-400 hover:underline underline-offset-2"
                        >
                          Create a fine-grained token
                        </a>{" "}
                        with <strong className="text-gray-300">Contents</strong> and{" "}
                        <strong className="text-gray-300">Pull requests</strong>{" "}
                        (read/write) on that repo. May work, but classic is what we
                        recommend here.
                      </li>
                    </ul>
                    <p className="text-amber-200/80 leading-relaxed">
                      Treat tokens like passwords. Revoke them in GitHub settings
                      if exposed. This demo can store the token in your browser
                      only if you enable &quot;Remember&quot; below—avoid on
                      shared computers.
                    </p>
                  </div>
                )}

                <input
                  type="password"
                  autoComplete="off"
                  value={autoPrGithubToken}
                  onChange={(e) => setAutoPrGithubToken(e.target.value)}
                  disabled={autoPrDryRun}
                  className="w-full px-4 py-2.5 rounded-xl bg-[#0a0e18] border border-white/[0.08] focus:outline-none focus:border-cyan-500/40 focus:ring-1 focus:ring-cyan-500/20 text-sm text-white placeholder-gray-600 font-mono disabled:opacity-40 disabled:cursor-not-allowed"
                  placeholder={
                    autoPrDryRun
                      ? "Enable when Dry run is off"
                      : "ghp_… or fine-grained token"
                  }
                />
                <label className="flex items-center gap-2 text-[11px] text-gray-400 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={autoPrRememberGithubToken}
                    onChange={(e) =>
                      setAutoPrRememberGithubToken(e.target.checked)
                    }
                    disabled={autoPrDryRun}
                    className="accent-cyan-500 cursor-pointer disabled:opacity-40"
                  />
                  Remember token in this browser (localStorage only)
                </label>
              </div>

              {/* Generate button */}
              <button
                onClick={runAutoPr}
                disabled={autoPrRunning}
                className="w-full mt-1 px-6 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 font-semibold text-sm disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer transition-all duration-300 shadow-lg shadow-cyan-500/20 hover:shadow-cyan-500/30 hover:scale-[1.01] active:scale-[0.99]"
              >
                {autoPrRunning ? (
                  <span className="flex items-center justify-center gap-2">
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Generating...
                  </span>
                ) : (
                  <span className="flex items-center justify-center gap-2">
                    <BoltIcon className="w-4 h-4" />
                    {autoPrDryRun ? "Preview Diff" : "Generate & Create PR"}
                  </span>
                )}
              </button>

              {/* Error */}
              {autoPrError && (
                <div className="flex items-start gap-3 text-sm text-red-300 bg-red-500/5 border border-red-500/15 rounded-xl p-4 animate-fade-in">
                  <ExclamationTriangleIcon className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                  <p className="text-xs leading-relaxed">{autoPrError}</p>
                </div>
              )}

              {/* Result */}
              {autoPrResult && (
                <div className="space-y-3 animate-fade-in">
                  <div className="bg-white/[0.02] border border-white/[0.06] rounded-xl p-4 space-y-2">
                    <div className="flex items-center gap-2 text-sm text-green-300">
                      <CheckCircleIcon className="w-4 h-4" />
                      <span className="font-medium">
                        {autoPrResult.dryRun ? "Dry run complete" : "PR created"}
                      </span>
                    </div>
                    <div className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-1 text-xs">
                      <span className="text-gray-500">Title</span>
                      <span className="text-gray-200 truncate">
                        {autoPrResult.title}
                      </span>
                      <span className="text-gray-500">Branch</span>
                      <span className="text-gray-200 font-mono truncate">
                        {autoPrResult.branch}
                      </span>
                      {autoPrResult.prUrl && (
                        <>
                          <span className="text-gray-500">PR</span>
                          <a
                            href={autoPrResult.prUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="text-cyan-400 hover:text-cyan-300 hover:underline underline-offset-2 cursor-pointer transition-colors truncate"
                          >
                            {autoPrResult.prUrl}
                          </a>
                        </>
                      )}
                    </div>
                  </div>

                  <div className="bg-[#0a0e18] border border-white/[0.06] rounded-xl overflow-hidden">
                    <div className="px-4 py-2.5 border-b border-white/[0.06] flex items-center gap-2">
                      <CodeBracketIcon className="w-4 h-4 text-gray-500" />
                      <span className="text-xs font-medium text-gray-400">
                        Diff
                      </span>
                    </div>
                    <pre className="p-4 text-xs sm:text-sm overflow-x-auto whitespace-pre-wrap break-words text-gray-300 leading-relaxed font-mono">
                      {autoPrResult.diff || "(no diff returned)"}
                    </pre>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        select option {
          background-color: #0a0e18;
          color: #ffffff;
        }
        .sidebar-scroll::-webkit-scrollbar {
          width: 4px;
        }
        .sidebar-scroll::-webkit-scrollbar-track {
          background: transparent;
        }
        .sidebar-scroll::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.08);
          border-radius: 4px;
        }
        .sidebar-scroll::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 255, 255, 0.15);
        }
        @keyframes float-slow {
          0%,
          100% {
            transform: translate(0, 0) scale(1);
          }
          50% {
            transform: translate(40px, -30px) scale(1.05);
          }
        }
        @keyframes float-slower {
          0%,
          100% {
            transform: translate(0, 0) scale(1);
          }
          50% {
            transform: translate(-30px, 25px) scale(1.03);
          }
        }
        @keyframes float-medium {
          0%,
          100% {
            transform: translate(0, 0);
          }
          50% {
            transform: translate(25px, 35px);
          }
        }
        @keyframes float-reverse {
          0%,
          100% {
            transform: translate(0, 0);
          }
          50% {
            transform: translate(-20px, -25px);
          }
        }
        .animate-float-slow {
          animation: float-slow 14s ease-in-out infinite;
        }
        .animate-float-slower {
          animation: float-slower 18s ease-in-out infinite;
        }
        .animate-float-medium {
          animation: float-medium 12s ease-in-out infinite;
        }
        .animate-float-reverse {
          animation: float-reverse 16s ease-in-out infinite;
        }
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(6px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fade-in {
          animation: fade-in 0.25s ease-out;
        }
        @keyframes card-in {
          from {
            opacity: 0;
            transform: translateY(16px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-card-in {
          animation: card-in 0.4s ease-out both;
        }
        @keyframes modal-in {
          from {
            opacity: 0;
            transform: scale(0.97) translateY(8px);
          }
          to {
            opacity: 1;
            transform: scale(1) translateY(0);
          }
        }
        .animate-modal-in {
          animation: modal-in 0.2s ease-out;
        }
      `}</style>
    </div>
  );
}
