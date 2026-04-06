"use client";

import React from "react";
import { DiffEditor } from "@monaco-editor/react";
import { MetricInfo } from "./MetricInfo";


export type Change = {
  file: string;
  startLine: number;
  endLine: number;
  oldCode: string;
  newCode: string;
  explanation?: string;
  metric?: string; // <-- add metric
};

export function CodeChangesPanel({ changes }: { changes: Change[] }) {
  const defineTheme = (monaco: typeof import('monaco-editor')) => {
    monaco.editor.defineTheme("my-dark", {
      base: "vs-dark",
      inherit: true,
      rules: [{ token: "", background: "111827" }],
      colors: {
        "editor.background": "#111827",
        "editorGutter.background": "#111827",
        "diffEditor.insertedTextBackground": "#064e3b33",
        "diffEditor.removedTextBackground": "#7f1d1d33",
      },
    });
  };

  const handleEditorWillMount = (monaco: typeof import('monaco-editor')) => {
    defineTheme(monaco);
  };

  const getEditorHeight = (code: string) => {
    const lines = code.split("\n").length;
    return `${Math.min(lines * 20 + 40, 600)}px`; // Cap at 600px
  };

  return (
    <div className="space-y-8">
      {changes.map((chg, idx) => (
        <div key={idx} className="space-y-2">
          {chg.metric && (
            <h3 className="text-lg font-medium text-purple-300">
              {chg.metric} <MetricInfo metric={chg.metric} />{" "}
            </h3>
          )}
          <div className="flex justify-between items-center text-xs text-gray-400">
            <span>
              {chg.file} (lines {chg.startLine}–{chg.endLine})
            </span>
            <button
              className="text-blue-400 hover:underline cursor-pointer"
              onClick={() => navigator.clipboard.writeText(chg.newCode)}
            >
              Copy New
            </button>
          </div>

          <div className="border border-gray-700 rounded-lg overflow-hidden">
            <DiffEditor
              height={getEditorHeight(chg.newCode)}
              language="javascript"
              original={chg.oldCode}
              modified={chg.newCode}
              theme="my-dark"
              options={{
                renderSideBySide: true,
                readOnly: true,
                minimap: { enabled: false },
                lineNumbers: "on",
                scrollBeyondLastLine: false,
                wordWrap: "on",
                automaticLayout: true,
                scrollbar: {
                  vertical: "hidden",
                  horizontal: "hidden",
                  verticalScrollbarSize: 0,
                  horizontalScrollbarSize: 0,
                },
              }}
              beforeMount={handleEditorWillMount}
            />
          </div>

          {chg.explanation && (
            <p className="italic text-gray-400">{chg.explanation}</p>
          )}
        </div>
      ))}
    </div>
  );
}
