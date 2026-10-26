import type { ReactNode } from "react";
import { cn } from "@/shared/lib/utils";

interface TableCellProps {
  children: ReactNode;
  className?: string;
  align?: "left" | "right" | "center";
}

export function TableCell({
  children,
  className,
  align = "left",
}: TableCellProps) {
  return (
    <td
      className={cn(
        "px-4 py-3 text-slate-700 dark:text-slate-200",
        align === "right" && "text-right",
        align === "center" && "text-center",
        className,
      )}
    >
      {children}
    </td>
  );
}
