"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { useRouter, useParams } from "next/navigation";
import { useAuth } from "@/hooks/usAuth";
import { API_ROUTES } from "@/config";
import { AnalysisInsight } from "@/types/project.type";
import { MetricInfo } from "@/components/MetricInfo";
import { CodeChangesPanel } from "@/components/CodeChangesPanel";
import { ArrowLeftIcon, ArrowPathIcon, ChartBarIcon, CodeBracketIcon } from "@heroicons/react/24/outline";

export default function ProjectAnalysisPage() {
  const router = useRouter();
  const { projectId } = useParams<{ projectId: string }>();
  const { token } = useAuth();

  const [analysis, setAnalysis] = useState<AnalysisInsight[]>([]);
  const [status, setStatus] = useState<"pending" | "complete" | string>("");
  const [rerunning, setRerunning] = useState(false);
  const [rerunStatus, setRerunStatus] = useState("");
  const [selectedMetric, setSelectedMetric] = useState<string | null>(null);
  const pollingRef = useRef<NodeJS.Timeout | null>(null);

  const fetchAnalysis = useCallback(async () => {
    if (!token) return;
    const res = await fetch(API_ROUTES.PROJECT_DETAILS(projectId), {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    if (!res.ok) {
      console.error(data);
      return;
    }
    setAnalysis(Array.isArray(data.analysisSummary) ? data.analysisSummary : []);
    setStatus(typeof data.status === "string" ? data.status : "");
  }, [projectId, token]);

  async function handleRerun() {
    if (!token) return;
    setRerunning(true);
    setRerunStatus("🔄 Re-running analysis...");
    const res = await fetch(API_ROUTES.RERUN(projectId), {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
    });
    setRerunStatus(res.ok ? "✅ Analysis started successfully!" : "❌ Failed to start analysis.");
    if (res.ok) {
      setStatus("pending");
      setAnalysis([]);
      setTimeout(() => setRerunStatus(""), 3000);
    }
    setRerunning(false);
  }

  useEffect(() => {
    fetchAnalysis();
  }, [projectId, token, fetchAnalysis]);

  useEffect(() => {
    if (status === "pending") {
      pollingRef.current = setInterval(fetchAnalysis, 5000);
    } else {
      clearInterval(pollingRef.current!);
    }
    return () => clearInterval(pollingRef.current!);
  }, [status, fetchAnalysis]);

  const getScoreColor = (value: number) => {
    if (value >= 90) return "text-green-400";
    if (value >= 70) return "text-yellow-400";
    return "text-red-400";
  };

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-[#0a0a0f] via-[#0f0f1a] to-[#0a0a0f]">
      {/* Animated background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-[-20%] right-[-10%] w-[500px] h-[500px] bg-[#8B5CF6] rounded-full mix-blend-screen filter blur-[100px] opacity-20 animate-float-slow" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[450px] h-[450px] bg-[#06B6D4] rounded-full mix-blend-screen filter blur-[90px] opacity-20 animate-float-slower" />
      </div>

      <div className="relative z-10 p-6 md:p-8 mt-10">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8 pb-4 border-b border-white/10">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.back()}
              className="group p-2 cursor-pointer rounded-full bg-white/5 hover:bg-white/10 border border-white/10 transition-all hover:scale-105"
            >
              <ArrowLeftIcon className="w-5 h-5 text-gray-300 group-hover:text-white" />
            </button>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-white">Performance Analysis</h1>
              <p className="text-gray-400 text-sm mt-1">Detailed insights and optimization recommendations</p>
            </div>
          </div>
          <button
            onClick={handleRerun}
            disabled={rerunning}
            className="group px-5 py-2 rounded-full bg-gradient-to-r from-purple-600 to-blue-600 text-white font-semibold shadow-lg shadow-purple-500/25 hover:shadow-purple-500/40 transition-all hover:scale-105 disabled:opacity-50 flex items-center gap-2"
          >
            <ArrowPathIcon className={`w-4 h-4 ${rerunning ? "animate-spin" : "group-hover:rotate-180 transition-transform duration-500"}`} />
            {rerunning ? "Running..." : "Rerun Analysis"}
          </button>
        </div>

        {rerunStatus && (
          <div className="mb-6 p-3 rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-400 text-sm">
            {rerunStatus}
          </div>
        )}

        {/* Loading State */}
        {analysis.length === 0 && status === "pending" && (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="relative">
              <div className="w-16 h-16 border-4 border-purple-500/30 border-t-purple-500 rounded-full animate-spin" />
              <div className="absolute inset-0 flex items-center justify-center">
                <ChartBarIcon className="w-6 h-6 text-purple-400 animate-pulse" />
              </div>
            </div>
            <p className="mt-6 text-gray-400 font-medium">Analyzing your website...</p>
            <p className="text-sm text-gray-500">This may take a few moments</p>
          </div>
        )}

        {/* Analysis Cards */}
        {analysis.map((insight, idx) => (
          <div
            key={idx}
            className="mb-8 bg-white/[0.03] backdrop-blur-sm rounded-2xl border border-white/10 overflow-hidden hover:border-purple-500/30 transition-all duration-300"
          >
            {/* Route Header */}
            <div className="p-6 bg-gradient-to-r from-purple-500/10 to-transparent border-b border-white/10">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-purple-500/20 flex items-center justify-center">
                  <CodeBracketIcon className="w-4 h-4 text-purple-400" />
                </div>
                <h2 className="text-xl font-semibold text-purple-400 font-mono">
                  {insight.route}
                </h2>
              </div>
            </div>

            {/* Metrics Grid */}
            <div className="p-6">
              {insight.performanceData.map((metrics, mi) => (
                <div key={mi} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                  {Object.entries(metrics).map(([name, detail]) => (
                    <div
                      key={name}
                      className="group relative bg-[#111827]/50 rounded-xl border border-gray-800 hover:border-purple-500/40 transition-all duration-300 hover:shadow-lg hover:shadow-purple-500/10 overflow-hidden"
                    >
                      <div className="p-5">
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <h3 className="text-base font-semibold text-gray-200">
                              {name}
                            </h3>
                            <div className="flex items-center gap-1 mt-1">
                              <MetricInfo metric={name} />
                            </div>
                          </div>
                          <div className={`text-2xl font-bold ${getScoreColor(detail.value)}`}>
                            {detail.value}
                            {typeof detail.value === "number" && !name.includes("Time") && "%"}
                          </div>
                        </div>

                        <div className="mt-4 pt-3 border-t border-gray-800">
                          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">
                            Recommended Actions
                          </p>
                          <ul className="space-y-1.5">
                            {detail.recommendedSteps.slice(0, 3).map((step: string, si: number) => (
                              <li key={si} className="text-sm text-gray-400 flex items-start gap-2">
                                <span className="text-purple-400 mt-0.5">▹</span>
                                <span>{step}</span>
                              </li>
                            ))}
                            {detail.recommendedSteps.length > 3 && (
                              <li className="text-xs text-purple-400 hover:text-purple-300 cursor-pointer">
                                + {detail.recommendedSteps.length - 3} more recommendations
                              </li>
                            )}
                          </ul>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ))}
            </div>

            {/* Code Changes Panel */}
            {insight.codeChanges && (
              <div className="border-t border-white/10 bg-black/20">
                <CodeChangesPanel
                  changes={Object.entries(insight.codeChanges).flatMap(
                    ([metric, arr]: [
                      string,
                      Array<{
                        file: string;
                        startLine: number;
                        endLine: number;
                        oldCode: string;
                        newCode: string;
                        explanation?: string;
                      }>
                    ]) =>
                      arr.map((c) => ({
                        file: c.file,
                        startLine: c.startLine,
                        endLine: c.endLine,
                        oldCode: c.oldCode,
                        newCode: c.newCode,
                        explanation: c.explanation,
                        metric: metric,
                      }))
                  )}
                />
              </div>
            )}
          </div>
        ))}

        {/* Polling Indicator */}
        {status === "pending" && analysis.length > 0 && (
          <div className="fixed bottom-6 right-6 flex items-center gap-3 px-4 py-2 rounded-full bg-black/50 backdrop-blur-md border border-purple-500/30">
            <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse" />
            <span className="text-sm text-gray-300">Updating analysis...</span>
          </div>
        )}

        {/* No Results */}
        {analysis.length === 0 && status === "complete" && (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-20 h-20 mb-4 rounded-full bg-yellow-500/20 flex items-center justify-center">
              <ChartBarIcon className="w-10 h-10 text-yellow-400" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">No routes found</h3>
            <p className="text-gray-400">We couldn't detect any routes to analyze</p>
          </div>
        )}
      </div>

      <style jsx>{`
        @keyframes float-slow {
          0%, 100% { transform: translate(0, 0) scale(1); }
          50% { transform: translate(30px, -20px) scale(1.05); }
        }
        @keyframes float-slower {
          0%, 100% { transform: translate(0, 0) scale(1); }
          50% { transform: translate(-20px, 30px) scale(1.08); }
        }
        .animate-float-slow { animation: float-slow 12s infinite ease-in-out; }
        .animate-float-slower { animation: float-slower 15s infinite ease-in-out; }
      `}</style>
    </div>
  );
}