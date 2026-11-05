import { motion, type HTMLMotionProps } from "motion/react";
import { LoaderCircle, type LucideIcon } from "lucide-react";

import { cn } from "@/shared/lib/utils";

export type ActionTone = "primary" | "neutral" | "danger";

const TILE: Record<ActionTone, string> = {
  primary: cn(
    "border-amber-300 bg-amber-50 text-amber-950 hover:bg-amber-100",
    "dark:border-amber-900/70 dark:bg-amber-950/30 dark:text-amber-100 dark:hover:bg-amber-950/50",
  ),
  neutral: cn(
    "border-slate-200 bg-white text-slate-700 hover:bg-slate-50",
    "dark:border-gray-700 dark:bg-gray-900 dark:text-slate-200 dark:hover:bg-gray-800",
  ),
  danger: cn(
    "border-red-200 bg-white text-red-700 hover:bg-red-50",
    "dark:border-red-900/60 dark:bg-gray-900 dark:text-red-400 dark:hover:bg-red-950/30",
  ),
};

const ICON_BOX: Record<ActionTone, string> = {
  primary:
    "bg-amber-200/70 text-amber-800 dark:bg-amber-500/20 dark:text-amber-300",
  neutral: "bg-slate-100 text-slate-600 dark:bg-gray-800 dark:text-slate-300",
  danger: "bg-red-100 text-red-700 dark:bg-red-950/50 dark:text-red-400",
};

interface Props extends Omit<HTMLMotionProps<"button">, "children"> {
  icon: LucideIcon;
  label: string;
  tone?: ActionTone;
  loading?: boolean;
  /** Bloquea el bloque; el motivo se muestra como ayuda al pasar el cursor. */
  disabledReason?: string;
}

export default function ActionTile({
  icon: Icon,
  label,
  tone = "neutral",
  loading = false,
  disabledReason,
  disabled,
  className,
  type = "button",
  ...rest
}: Props) {
  const isDisabled = Boolean(disabled || disabledReason || loading);

  return (
    <motion.button
      type={type}
      disabled={isDisabled}
      title={disabledReason}
      aria-busy={loading || undefined}
      whileTap={isDisabled ? undefined : { scale: 0.97 }}
      className={cn(
        "flex min-h-24 w-full min-w-0 cursor-pointer flex-col items-center justify-center gap-2",
        "rounded-2xl border p-3 text-center text-sm font-medium shadow-sm",
        "transition-colors duration-200",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500",
        "focus-visible:ring-offset-2 dark:focus-visible:ring-offset-gray-900",
        "disabled:cursor-not-allowed disabled:opacity-50",
        TILE[tone],
        className,
      )}
      {...rest}
    >
      <span
        className={cn(
          "flex size-11 items-center justify-center rounded-xl",
          ICON_BOX[tone],
        )}
      >
        {loading ? (
          <LoaderCircle size={22} className="animate-spin" aria-hidden="true" />
        ) : (
          <Icon size={22} aria-hidden="true" />
        )}
      </span>
      <span className="leading-tight">{label}</span>
    </motion.button>
  );
}
