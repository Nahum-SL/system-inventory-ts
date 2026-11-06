import { CHIP_STYLES } from "@/shared/lib/themes/action-theme";
import { cn } from "@/shared/lib/utils";

export interface ChipOption<T extends string> {
  value: T;
  label: string;
  /** Contador opcional; omítelo mientras se carga. */
  count?: number;
}

interface Props<T extends string> {
  label: string;
  options: ChipOption<T>[];
  value: T;
  onChange: (value: T) => void;
  className?: string;
}

export default function ChipGroup<T extends string>({
  label,
  options,
  value,
  onChange,
  className,
}: Props<T>) {
  return (
    <div
      role="group"
      aria-label={label}
      className={cn("flex flex-wrap gap-1.5", className)}
    >
      {options.map((option) => {
        const selected = option.value === value;
        return (
          <button
            key={option.value}
            type="button"
            aria-pressed={selected}
            onClick={() => onChange(option.value)}
            className={cn(
              CHIP_STYLES.base,
              selected ? CHIP_STYLES.on : CHIP_STYLES.off,
            )}
          >
            {option.label}
            {option.count !== undefined && (
              <span className="rounded-full bg-black/5 px-2 py-0.5 text-xs font-semibold dark:bg-white/10">
                {option.count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
