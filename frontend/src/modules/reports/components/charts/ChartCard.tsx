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
        "rounded-4xl border border-slate-100 bg-white p-6 shadow-sm",
        className,
      )}
    >
      <h2 className="mb-4 text-[10px] font-bold uppercase tracking-widest text-slate-400">
        {title}
      </h2>
      {children}
    </section>
  );
}
