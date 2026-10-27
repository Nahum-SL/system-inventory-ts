import { cn } from "@/shared/lib/utils";

const TONES = {
  default: {
    value: "text-slate-900 dark:text-slate-100",
    icon: "bg-slate-100 text-slate-600 dark:bg-gray-800 dark:text-slate-300",
    border: "hover:border-slate-300 dark:hover:border-gray-600",
  },
  green: {
    value: "text-emerald-700 dark:text-emerald-400",
    icon: "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-400",
    border: "hover:border-emerald-200 dark:hover:border-emerald-900",
  },
  amber: {
    value: "text-amber-700 dark:text-amber-400",
    icon: "bg-amber-50 text-amber-700 dark:bg-amber-950/50 dark:text-amber-400",
    border: "hover:border-amber-200 dark:hover:border-amber-900",
  },
  red: {
    value: "text-red-700 dark:text-red-400",
    icon: "bg-red-50 text-red-700 dark:bg-red-950/50 dark:text-red-400",
    border: "hover:border-red-200 dark:hover:border-red-900",
  },
  blue: {
    value: "text-blue-700 dark:text-blue-400",
    icon: "bg-blue-50 text-blue-700 dark:bg-blue-950/50 dark:text-blue-400",
    border: "hover:border-blue-200 dark:hover:border-blue-900",
  },
};

interface Props {
  label: string;
  value: number;
  tone?: keyof typeof TONES;
  hint?: string;
}

export default function KpiCard({
  label,
  value,
  tone = "default",
  hint,
}: Props) {
  const styles = TONES[tone];

  return (
    <article
      className={cn(
        "min-w-0 rounded-2xl border bg-white p-4 shadow-sm transition-colors duration-200 sm:p-5",
        "border-slate-200 dark:border-gray-700 dark:bg-gray-900",
        styles.border,
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <p className="text-sm font-medium leading-5 text-slate-600 dark:text-slate-400">
          {label}
        </p>

        <span
          className={cn("size-2.5 shrink-0 rounded-full", styles.icon)}
          aria-hidden="true"
        />
      </div>

      <p
        className={cn(
          "mt-3 wrap-break-word text-3xl font-semibold tracking-tight tabular-nums",
          styles.value,
        )}
      >
        {value.toLocaleString("es-PE")}
      </p>

      {hint && (
        <p className="mt-1 text-xs leading-5 text-slate-500 dark:text-slate-400">
          {hint}
        </p>
      )}
    </article>
  );
}
