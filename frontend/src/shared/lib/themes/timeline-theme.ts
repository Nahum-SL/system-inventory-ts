export type TimelineTone = "violet" | "amber" | "sky" | "slate";

export const TIMELINE_TONES: Record<
  TimelineTone,
  { marker: string; badge: string }
> = {
  violet: {
    marker:
      "border-violet-400 bg-violet-50 text-violet-700 dark:border-violet-500/70 dark:bg-violet-950/50 dark:text-violet-300",
    badge:
      "border-violet-200 bg-violet-50 text-violet-700 dark:border-violet-900/60 dark:bg-violet-950/30 dark:text-violet-300",
  },
  amber: {
    marker:
      "border-amber-400 bg-amber-50 text-amber-700 dark:border-amber-500/70 dark:bg-amber-950/50 dark:text-amber-300",
    badge:
      "border-amber-200 bg-amber-50 text-amber-800 dark:border-amber-900/60 dark:bg-amber-950/30 dark:text-amber-300",
  },
  sky: {
    marker:
      "border-sky-400 bg-sky-50 text-sky-700 dark:border-sky-500/70 dark:bg-sky-950/50 dark:text-sky-300",
    badge:
      "border-sky-200 bg-sky-50 text-sky-700 dark:border-sky-900/60 dark:bg-sky-950/30 dark:text-sky-300",
  },
  slate: {
    marker:
      "border-slate-300 bg-slate-50 text-slate-600 dark:border-gray-600 dark:bg-gray-800 dark:text-slate-300",
    badge:
      "border-slate-200 bg-slate-50 text-slate-700 dark:border-gray-700 dark:bg-gray-800 dark:text-slate-300",
  },
};

export const TIMELINE_ONGOING_PILL =
  "rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-medium text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300";
