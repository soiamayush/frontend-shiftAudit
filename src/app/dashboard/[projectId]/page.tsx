"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { useRouter, useParams } from "next/navigation";
import { useAuth } from "@/hooks/usAuth";
import { API_ROUTES } from "@/config";
import { AnalysisInsight } from "@/types/project.type";
import { MetricInfo } from "@/components/MetricInfo";
import { CodeChangesPanel } from "@/components/CodeChangesPanel";
import {
  ArrowLeftIcon,
  ArrowPathIcon,
  ChartBarIcon,
  CodeBracketIcon,
} from "@heroicons/react/24/outline";

export default function ProjectAnalysisPage() {
  const router = useRouter();
  const { projectId } = useParams<{ projectId: string }>();
  const { token } = useAuth();

  const [analysis, setAnalysis] = useState<AnalysisInsight[]>([]);
  const [status, setStatus] = useState<"pending" | "complete" | string>("");
  const [rerunning, setRerunning] = useState(false);
  const [rerunStatus, setRerunStatus] = useState("");
  const pollingRef = useRef<NodeJS.Timeout | null>(null);

  const fetchAnalysis = useCallback(async () => {
    if (!token) return;

    const res = await fetch(API_ROUTES.PROJECT_DETAILS(projectId), {
      headers: { Authorization: `Bearer ${token}` },
    });

    const data = await res.json();

    if (!res.ok) return;

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

    setRerunStatus(
      res.ok ? "✅ Analysis started!" : "❌ Failed to start"
    );

    if (res.ok) {
      setStatus("pending");
      setAnalysis([]);
    }

    setTimeout(() => setRerunStatus(""), 3000);
    setRerunning(false);
  }

  useEffect(() => {
    fetchAnalysis();
  }, [fetchAnalysis]);

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
    <div className="relative min-h-screen bg-[#0a0a0f] text-white">

      {/* Background Orbs */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-[-20%] right-[-10%] w-[500px] h-[500px] bg-cyan-500/20 blur-[100px] animate-float-slow" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[450px] h-[450px] bg-blue-500/20 blur-[90px] animate-float-slower" />
      </div>

      <div className="relative z-10 p-6 md:p-8 mt-10">

        {/* Header */}
        <div className="flex justify-between items-center mb-8 border-b border-white/10 pb-4">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.back()}
              className="p-2 rounded-full bg-white/5 hover:bg-white/10 border border-white/10"
            >
              <ArrowLeftIcon className="w-5 h-5 text-gray-300" />
            </button>

            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
                Performance Analysis
              </h1>
              <p className="text-gray-400 text-sm">
                Optimization insights
              </p>
            </div>
          </div>

          <button
            onClick={handleRerun}
            disabled={rerunning}
            className="px-5 py-2 rounded-full cursor-pointer bg-gradient-to-r from-cyan-500 to-blue-500 hover:scale-105 transition flex items-center gap-2"
          >
            <ArrowPathIcon
              className={`w-4 h-4 ${rerunning ? "animate-spin" : ""}`}
            />
            {rerunning ? "Running..." : "Rerun"}
          </button>
        </div>

        {rerunStatus && (
          <div className="mb-4 text-cyan-400 text-sm">
            {rerunStatus}
          </div>
        )}

        {/* Loading */}
        {analysis.length === 0 && status === "pending" && (
          <div className="text-center py-20">
            <div className="w-16 h-16 border-4 border-cyan-500/30 border-t-cyan-500 rounded-full animate-spin mx-auto" />
            <p className="mt-6 text-gray-400">Analyzing...</p>
          </div>
        )}

        {/* Cards */}
        {analysis.map((insight, idx) => (
          <div key={idx} className="mb-8 bg-white/5 rounded-xl border border-white/10">

            {/* Route */}
            <div className="p-5 border-b border-white/10 flex items-center gap-3">
              <CodeBracketIcon className="w-5 h-5 text-cyan-400" />
              <h2 className="text-cyan-400 font-mono">
                {insight.route}
              </h2>
            </div>

            {/* Metrics */}
            <div className="p-5 grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {insight.performanceData.map((metrics, mi) =>
                Object.entries(metrics).map(([name, detail]) => (
                  <div
                    key={name}
                    className="bg-[#111827] p-4 rounded-lg border border-gray-800 hover:border-cyan-500/40"
                  >
                    <div className="flex justify-between">
                      <span>{name}</span>
                      <span className={getScoreColor(detail.value)}>
                        {detail.value}%
                      </span>
                    </div>

                    <ul className="mt-3 text-sm text-gray-400 space-y-1">
                      {detail.recommendedSteps.slice(0, 2).map((s: string, i: number) => (
                        <li key={i}>• {s}</li>
                      ))}
                    </ul>
                  </div>
                ))
              )}
            </div>

            {/* Code changes */}
            {insight.codeChanges && (
              <CodeChangesPanel
                changes={Object.entries(insight.codeChanges).flatMap(
                  ([metric, arr]) =>
                    arr.map((c) => ({
                      ...c,
                      metric,
                    }))
                )}
              />
            )}
          </div>
        ))}
      </div>

      <style jsx>{`
        @keyframes float-slow {
          50% { transform: translate(30px, -20px); }
        }
        @keyframes float-slower {
          50% { transform: translate(-20px, 30px); }
        }
        .animate-float-slow { animation: float-slow 12s infinite; }
        .animate-float-slower { animation: float-slower 15s infinite; }
      `}</style>
    </div>
  );
}