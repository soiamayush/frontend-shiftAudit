"use client";
import { useEffect, useState } from "react";


// 
export default function Home() {
  const [website, setWebsite] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState(0);
  const [response, setResponse] = useState<{ analysis: string } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const loadingMessages = [
    "Analysing the website...",
    "Processing the information...",
    "Preparing insights...",
  ];

  useEffect(() => {
    if (isLoading) {
      const timeouts: NodeJS.Timeout[] = [];

      for (let i = 1; i < loadingMessages.length; i++) {
        const timeout = setTimeout(() => setLoadingStep(i), i * 2000);
        timeouts.push(timeout);
      }

      return () => timeouts.forEach(clearTimeout);
    } else {
      setLoadingStep(0);
    }
  }, [isLoading,loadingMessages.length]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!website.trim()) return;

    setIsLoading(true);
    setError(null);
    setResponse(null);

    try {
      const response = await fetch("/api/analysis/analyze", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ website }),
      });

      if (!response.ok) {
        throw new Error("Failed to analyze website");
      }

      const data = await response.json();
      setResponse(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="min-h-screen text-white p-8 flex items-center justify-center flex-col bg-[linear-gradient(to_right,#000000,#063372)]">
      <div className="max-w-4xl w-full">
        <h1 className="text-4xl font-bold text-center mb-8 bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 bg-clip-text text-transparent animate-pulse">
          Shift Audit AI
        </h1>

        <form onSubmit={handleSubmit} className="mb-8">
          <div className="relative">
            <input
              type="url"
              value={website}
              onChange={(e) => setWebsite(e.target.value)}
              placeholder="Enter website URL..."
              className="w-full px-4 py-3 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white placeholder-black-400"
            />
            <button
              type="submit"
              className="absolute right-3 top-1/2 transform -translate-y-1/2 px-6 py-2 bg-gradient-to-r from-blue-500/90 to-purple-500/90 backdrop-blur-md border border-white/10 text-white rounded-lg hover:brightness-110 hover:shadow-lg active:scale-[0.98] transition-all cursor-pointer"
            >
              Analyze
            </button>
          </div>
        </form>

        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700 shadow-lg min-h-[200px]">
          <h2 className="text-xl font-semibold mb-4 text-blue-400">
            Analysis Results
          </h2>

          {isLoading ? (
            <div className="text-center animate-pulse text-white font-medium text-lg">
              {loadingMessages[loadingStep]}
            </div>
          ) : response?.analysis ? (
            <div className="whitespace-pre-wrap text-sm leading-relaxed space-y-4">
              {response.analysis}
            </div>
          ) : error ? (
            <p className="text-red-500">{error}</p>
          ) : null}
        </div>
      </div>
    </main>
  );
}
