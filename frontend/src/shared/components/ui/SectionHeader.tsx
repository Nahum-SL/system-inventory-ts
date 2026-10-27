import type { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";

export interface SectionHeaderProps {
  title: string;
  description?: string;
  icon: LucideIcon;
  actions?: ReactNode;
}

export default function SectionHeader({
  title,
  description,
  icon: Icon,
  actions,
}: SectionHeaderProps) {
  return (
    <header className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
      <div className="flex min-w-0 items-start gap-3">
        <div className="flex size-11 shrink-0 items-center justify-center rounded-xl border border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-900/60 dark:bg-amber-950/40 dark:text-amber-300">
          <Icon size={22} aria-hidden="true" />
        </div>

        <div className="min-w-0">
          <h1 className="text-xl font-semibold tracking-tight text-slate-900 dark:text-slate-100">
            {title}
          </h1>

          {description && (
            <p className="mt-1 text-sm leading-5 text-slate-500 dark:text-slate-400">
              {description}
            </p>
          )}
        </div>
      </div>

      {actions && (
        <div className="flex shrink-0 flex-wrap items-center gap-2 sm:ml-auto">
          {actions}
        </div>
      )}
    </header>
  );
}
