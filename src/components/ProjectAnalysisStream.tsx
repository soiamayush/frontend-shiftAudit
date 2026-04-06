// components/ProjectAnalysisStream.tsx
"use client";

import { useEffect, useState } from "react";
import { API_ROUTES } from "@/config";
import { AnalysisInsight } from "@/types/project.type";

interface Props {
  projectId: string;
  token: string;
  initialAnalysis: AnalysisInsight[];
  initialStatus: "pending" | "complete";
}

interface MetricDetail {
  value: string | number;
  recommendedSteps: string[];
}

// interface PerformanceMetrics {
//   [key: string]: MetricDetail;
// }

export default function ProjectAnalysisStream({
  projectId,
  token,
  initialAnalysis,
  initialStatus,
}: Props) {
  const [analysis, setAnalysis] = useState<AnalysisInsight[]>(initialAnalysis);
  const [status, setStatus] = useState(initialStatus);

  useEffect(() => {
    if (status === "complete") return;

    const es = new EventSource(
      `${API_ROUTES.PROJECT_STREAM(projectId)}?token=${encodeURIComponent(
        token
      )}`
    );

    es.addEventListener("analysisUpdate", (e) => {
      const insight = JSON.parse((e as MessageEvent).data) as AnalysisInsight;
      setAnalysis((prev) => [...prev, insight]);
    });
    es.addEventListener("complete", () => {
      setStatus("complete");
      es.close();
    });
    es.onerror = () => {
      console.error("SSE error");
      es.close();
    };

    return () => es.close();
  }, [projectId, token, status]);

  // Loading
  if (analysis.length === 0 && status === "pending") {
    return (
      <div className="flex flex-col items-center py-12">
        <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
        <p className="mt-4 text-gray-400">Preparing analysis…</p>
      </div>
    );
  }

  // No routes
  if (analysis.length === 0 && status === "complete") {
    return <p className="text-gray-400">No routes found for analysis.</p>;
  }

  // Results
  return (
    <div className="space-y-8">
      {analysis.map((insight, idx) => (
        <div
          key={idx}
          className="bg-[#1a1a2e]/70 backdrop-blur-md p-6 rounded-xl shadow-lg"
        >
          <h2 className="text-xl font-semibold text-blue-400 mb-4">
            Route: {insight.route}
          </h2>
          {insight.performanceData.map((metrics, i) => (
            <div
              key={i}
              className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4"
            >
              {Object.entries(metrics).map(([key, detail]) => (
                <div
                  key={key}
                  className="bg-[#111827] p-4 rounded-lg border border-gray-700"
                >
                  <h3 className="text-lg font-medium text-purple-300">
                    {key}
                  </h3>
                  <p className="text-sm text-gray-300">
                    Value:{" "}
                    <span className="font-semibold text-white">
                      {(detail as MetricDetail).value}
                    </span>
                  </p>
                  <p className="mt-2 text-sm text-gray-400">
                    Recommended Steps:
                  </p>
                  <ul className="list-disc list-inside text-sm text-gray-500">
                    {(detail as MetricDetail).recommendedSteps.map(
                      (step: string, j: number) => <li key={j}>{step}</li>
                    )}
                  </ul>
                </div>
              ))}
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}
