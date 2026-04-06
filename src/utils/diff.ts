// utils/diff.ts
import { generateDiffFile, DiffFile } from "@git-diff-view/file";

/**
 * Returns a fully-initialized DiffFile instance,
 * ready to render with <DiffView diffFile={...} />.
 */
export function makeDiffFile(
  fileName: string,
  oldCode: string,
  newCode: string,
  fileLang = "tsx"
): DiffFile {
  const df = generateDiffFile(
    fileName,    // oldFileName
    oldCode,     // old content
    fileName,    // newFileName
    newCode,     // new content
    fileLang,    // old file language
    fileLang     // new file language
  );  // no annotations here

  df.initTheme("dark");      // set dark theme
  df.init();                 // parse diff metadata
  df.buildSplitDiffLines();  // prepare side-by-side hunks

  return df;
}

import { parseDiff } from "react-diff-view";
import { createTwoFilesPatch } from "diff";

/**
 * Generate a Git-style unified-diff string and parse into file-level hunks.
 */
export function makeParsedDiff(
  fileName: string,
  oldCode: string,
  newCode: string,
  context = 3
) {
  const rawPatch = createTwoFilesPatch(
    fileName,
    fileName,
    oldCode,
    newCode,
    "", "",
    { context }
  );  
  // Normalize file paths for parseDiff:
  const normalized = rawPatch
    .replace(/^--- .+/m, `--- a/${fileName}`)
    .replace(/^\+\+\+ .+/m, `+++ b/${fileName}`);
  const full = `diff --git a/${fileName} b/${fileName}\n${normalized}`;
  const files = parseDiff(full);
  if (!files.length) throw new Error(`No diff parsed for ${fileName}`);
  return files[0];
}

