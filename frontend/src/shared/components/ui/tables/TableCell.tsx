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
        "px-8 py-5 text-slate-600 dark:text-gray-300 font-medium align-middle",
        align === "right" && "text-right",
        align === "center" && "text-center",
        className,
      )}
    >
      {children}
    </td>
  );
}
