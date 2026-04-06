// MetricInfo.tsx
import { useState } from "react";
import { Dialog } from "@headlessui/react";

const METRIC_DEFINITIONS: Record<string, { title: string; body: string }> = {
  FCP: {
    title: "First Contentful Paint",
    body: `FCP measures the time from when the page starts loading to when any part of the
    page's content is painted. Aim for < 1.8s for a “Good” score.`,
  },
  LCP: {
    title: "Largest Contentful Paint",
    body: `LCP tracks when the largest text or image is visible. It’s a great user-perceived
    load speed marker. Aim for < 2.5s.`,
  },
  CLS: {
    title: "Cumulative Layout Shift",
    body: `CLS sums all unexpected layout shifts that occur during a page’s lifecycle.
    Scores under 0.1 are considered good.`,
  },
  TBT: {
    title: "Total Blocking Time",
    body: `TBT measures how long the main thread was blocked between FCP and Time to
    Interactive. Lower is better—aim for < 300ms.`,
  },
};

export function MetricInfo({
  metric,
}: {
  metric: keyof typeof METRIC_DEFINITIONS;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const def = METRIC_DEFINITIONS[metric];

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        aria-label={`What is ${metric}?`}
        className="inline-flex ml-1 items-center justify-center w-4 h-4 border border-gray-500 rounded-full italic text-gray-400 hover:text-gray-200 hover:border-gray-300 text-xs cursor-pointer">
        i
      </button>

      <Dialog
        open={isOpen}
        onClose={() => setIsOpen(false)}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-md"
      >
        <Dialog.Panel className="bg-white dark:bg-gray-900 max-w-sm p-6 rounded-lg">
          <Dialog.Title className="text-lg font-semibold">
            {def.title}
          </Dialog.Title>
          <Dialog.Description className="mt-2 text-sm text-white-500">
            {def.body}
          </Dialog.Description>
          <button
            onClick={() => setIsOpen(false)}
            className="mt-4 text-blue-400 hover:underline cursor-pointer"
          >
            Close
          </button>
        </Dialog.Panel>
      </Dialog>
    </>
  );
}
