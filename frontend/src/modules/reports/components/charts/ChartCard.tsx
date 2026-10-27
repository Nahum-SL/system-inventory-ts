import type { ReactNode } from "react";
import { cn } from "@/shared/lib/utils";

interface Props {
  title: string;
  children: ReactNode;
  className?: string;
}

export default function ChartCard({ title, children, className }: Props) {
  return (
    <section
      className={cn(
        "min-w-0 rounded-2xl border p-4 shadow-sm sm:p-5",
        "border-slate-200 bg-white",
        "dark:border-gray-700 dark:bg-gray-900",
        className,
      )}
    >
      <h2 className="mb-5 text-sm font-semibold text-slate-800 dark:text-slate-100">
        {title}
      </h2>

      {children}
    </section>
  );
}
