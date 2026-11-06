import { motion, type HTMLMotionProps } from "motion/react";
import { LoaderCircle, type LucideIcon } from "lucide-react";

import { cn } from "@/shared/lib/utils";
import { ICON_BOX, TILE, type ActionTone } from "@/shared/lib/themes/action-theme";

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
