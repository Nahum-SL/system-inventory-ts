
import { ArrowUpRight } from "lucide-react";
import { Link } from "react-router";

import { cn } from "@/shared/lib/utils";
import type { KpiItemConfig } from "../../types";

export function DashboardKpiCard({
  title,
  value,
  icon: Icon,
  color,
  bg,
  link,
}: KpiItemConfig) {
  const card = (
    <div
      className={cn(
        "group flex min-w-0 items-center gap-4 rounded-2xl border p-4 shadow-sm",
        "border-slate-200 bg-white transition-all duration-200 sm:gap-5 sm:p-5",
        "dark:border-gray-700 dark:bg-gray-900",
        link && [
          "hover:-translate-y-0.5 hover:border-amber-300 hover:shadow-md",
          "dark:hover:border-amber-800",
        ],
      )}
    >
      <div
        className={cn(
          "flex size-12 shrink-0 items-center justify-center rounded-xl",
          "transition-transform duration-200 group-hover:scale-105 sm:size-14",
          bg,
          color,
        )}
      >
        <Icon size={24} strokeWidth={1.8} aria-hidden="true" />
      </div>

      <div className="min-w-0 flex-1">
        <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
          {title}
        </p>

        <p className="mt-1 break-words text-2xl font-semibold tracking-tight text-slate-900 dark:text-slate-100 sm:text-3xl">
          {value}
        </p>
      </div>

      {link && (
        <ArrowUpRight
          size={18}
          className="shrink-0 text-slate-400 transition-colors group-hover:text-amber-600 dark:group-hover:text-amber-400"
          aria-hidden="true"
        />
      )}
    </div>
  );

  return link ? (
    <Link
      to={link}
      aria-label={`${title}: ${value}. Ver detalles`}
      className="block rounded-2xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-gray-950"
    >
      {card}
    </Link>
  ) : (
    card
  );
}
