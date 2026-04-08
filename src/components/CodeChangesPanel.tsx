"use client";

import React, { useMemo, useState } from "react";
import dynamic from "next/dynamic";
import { InformationCircleIcon } from "@heroicons/react/24/outline";
import { inferEditorLanguage, type CodeChangeWithMetric } from "@/lib/analysisDisplay";

const DiffEditor = dynamic(
  async () => (await import("@monaco-editor/react")).DiffEditor,
  { ssr: false, loading: () => <div className="h-32 animate-pulse rounded bg-gray-900/80" /> }
);

const METRIC_COLORS: Record<string, string> = {
  FCP: "text-amber-300 border-amber-500/40 bg-amber-500/10",
  LCP: "text-rose-300 border-rose-500/40 bg-rose-500/10",
  CLS: "text-violet-300 border-violet-500/40 bg-violet-500/10",
  TBT: "text-cyan-300 border-cyan-500/40 bg-cyan-500/10",
};

function copyFallback(text: string) {
  void navigator.clipboard.writeText(text);
}

function buildUnifiedSnippet(oldCode: string, newCode: string): string {
  return [
    "--- original",
    ...oldCode.split("\n").map((l) => ` ${l}`),
    "+++ suggested",
    ...newCode.split("\n").map((l) => ` ${l}`),
  ].join("\n");
}

export function CodeChangesPanel({ changes }: { changes: CodeChangeWithMetric[] }) {
  const [openIdx, setOpenIdx] = useState<number | null>(0);

  const list = useMemo(
    () =>
      changes.map((c, i) => ({
        ...c,
        key: i,
        identical: (c.oldCode ?? "").trim() === (c.newCode ?? "").trim(),
        lang: inferEditorLanguage(c.file),
      })),
    [changes]
  );

  if (list.length === 0) return null;

  return (
    <div className="border-t border-white/10 bg-black/20">
      <div className="p-5 pb-2">
        <h3 className="text-lg font-semibold text-white flex items-center gap-2">
          <span className="bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
            Suggested code changes
          </span>
          <span className="text-xs font-normal text-gray-500">
            ({list.length} suggestion{list.length === 1 ? "" : "s"})
          </span>
        </h3>
        <p className="text-sm text-gray-500 mt-1">
          Review diffs in context, then copy the suggested version or apply in your editor.
        </p>
      </div>

      <div className="p-5 pt-2 space-y-6">
        {list.map((chg) => {
          const badge =
            METRIC_COLORS[chg.metric] ??
            "text-gray-300 border-white/20 bg-white/5";
          const expanded = openIdx === chg.key;
          return (
            <article
              key={chg.key}
              className="rounded-xl border border-white/10 bg-[#0f1419] overflow-hidden"
            >
              <button
                type="button"
                onClick={() => setOpenIdx(expanded ? null : chg.key)}
                className="w-full flex items-start justify-between gap-3 p-4 text-left hover:bg-white/[0.03] transition"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <span
                      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-semibold border ${badge}`}
                    >
                      {chg.metric}
                      <InformationCircleIcon className="w-3.5 h-3.5 opacity-70" title="" />
                    </span>
                    {chg.identical && (
                      <span className="text-xs text-amber-200/90 bg-amber-500/15 border border-amber-500/30 px-2 py-0.5 rounded">
                        Same snippet — read explanation
                      </span>
                    )}
                  </div>
                  <p className="font-mono text-sm text-cyan-200/90 truncate" title={chg.file}>
                    {chg.file}{" "}
                    <span className="text-gray-500">
                      (lines {chg.startLine}–{chg.endLine})
                    </span>
                  </p>
                </div>
                <span className="shrink-0 text-xs text-gray-500">
                  {expanded ? "Hide" : "Show"}
                </span>
              </button>

              {expanded && (
                <div className="px-4 pb-4 space-y-3 border-t border-white/5 pt-3">
                  <div className="flex flex-wrap gap-2 justify-end">
                    <button
                      type="button"
                      className="text-xs px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/15 text-gray-200"
                      onClick={() => copyFallback(chg.newCode)}
                    >
                      Copy suggested
                    </button>
                    <button
                      type="button"
                      className="text-xs px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/15 text-gray-200"
                      onClick={() => copyFallback(chg.oldCode)}
                    >
                      Copy original
                    </button>
                    <button
                      type="button"
                      className="text-xs px-3 py-1.5 rounded-lg bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-200 border border-cyan-500/30"
                      onClick={() =>
                        copyFallback(buildUnifiedSnippet(chg.oldCode, chg.newCode))
                      }
                    >
                      Copy unified diff
                    </button>
                  </div>

                  <div className="border border-gray-700/80 rounded-lg overflow-hidden">
                    <DiffEditor
                      height={Math.min(
                        520,
                        Math.max(
                          180,
                          Math.max(
                            chg.oldCode.split("\n").length,
                            chg.newCode.split("\n").length
                          ) *
                            18 +
                            48
                        )
                      )}
                      language={chg.lang}
                      original={chg.oldCode}
                      modified={chg.newCode}
                      theme="vs-dark"
                      options={{
                        renderSideBySide: true,
                        readOnly: true,
                        minimap: { enabled: false },
                        lineNumbers: "on",
                        scrollBeyondLastLine: false,
                        wordWrap: "on",
                        automaticLayout: true,
                        fontSize: 13,
                        renderOverviewRuler: false,
                      }}
                    />
                  </div>

                  {chg.explanation && (
                    <div className="rounded-lg bg-blue-500/10 border border-blue-500/20 px-4 py-3 text-sm text-gray-300">
                      <span className="text-blue-300/90 font-medium">Why: </span>
                      {chg.explanation}
                    </div>
                  )}
                </div>
              )}
            </article>
          );
        })}
      </div>
    </div>
  );
}
