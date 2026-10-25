import { cn } from "@/shared/lib/utils";

const TONES = {
  default: "text-slate-900",
  green: "text-green-700",
  amber: "text-amber-600",
  red: "text-red-600",
  blue: "text-blue-700",
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
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-4">
      <p className="text-sm text-slate-500">{label}</p>
      <p className={cn("mt-1 text-3xl font-bold", TONES[tone])}>{value}</p>
      {hint && <p className="mt-1 text-xs text-slate-400">{hint}</p>}
    </div>
  );
}
