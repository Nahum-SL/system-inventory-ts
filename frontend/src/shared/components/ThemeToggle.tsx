import { Moon, Sun } from "lucide-react";
// ThemeProvider
import { useTheme } from "../lib/providers/useThemeProvider";
// UTIL
import { cn } from "@/shared/lib/utils";

interface ThemeToggleProps {
  className?: string;
}

export default function ThemeToggle({ className }: ThemeToggleProps) {
  const { theme, toggleTheme } = useTheme();

  const nextTheme = theme === "dark" ? "claro" : "oscuro";

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={`Cambiar a tema ${nextTheme}`}
      aria-pressed={theme === "dark"}
      title={`Cambiar a tema ${nextTheme}`}
      className={cn(
        "inline-flex size-10 shrink-0 items-center justify-center rounded-xl",
        "border border-slate-200 bg-white text-slate-700",
        "transition-colors hover:bg-amber-50 hover:text-amber-700",
        "dark:border-slate-700 dark:bg-gray-800 dark:text-slate-200",
        "dark:hover:bg-gray-700 dark:hover:text-amber-300",
        "focus-visible:outline-2 focus-visible:outline-offset-2",
        "focus-visible:outline-amber-500",
        "cursor-pointer",
        className,
      )}
    >
      {theme === "dark" ? (
        <Sun size={19} aria-hidden="true" />
      ) : (
        <Moon size={19} aria-hidden="true" />
      )}
    </button>
  );
}
