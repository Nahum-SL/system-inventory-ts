import { cn } from "@/shared/lib/utils";
import { Link } from "react-router";
// types
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
    <div className="group flex items-center gap-5 rounded-4xl border border-slate-100 bg-white p-6 shadow-sm transition-all duration-300 hover:shadow-md">
      <div
        className={cn(
          "rounded-2xl p-4 transition-transform duration-300 group-hover:scale-105",
          bg,
          color,
        )}
      >
        <Icon size={24} />
      </div>
      <div>
        <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
          {title}
        </p>
        <p className="mt-0.5 text-3xl font-semibold tracking-tight text-slate-900">
          {value}
        </p>
      </div>
    </div>
  );

  return link ? (
    <Link to={link} className="block">
      {card}
    </Link>
  ) : (
    card
  );
}
