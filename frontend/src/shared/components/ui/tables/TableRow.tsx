// src/components/ui/table/TableRow.tsx
import type { ReactNode } from "react";
import { motion } from "framer-motion";
import { cn } from "@/shared/lib/utils";

interface TableRowProps {
  children: ReactNode;
  className?: string;
}

export function TableRow({ children, className }: TableRowProps) {
  return (
    <motion.tr
      layout
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className={cn(
        "group hover:bg-slate-50/60 dark:hover:bg-gray-800/30 transition-colors will-change-transform",
        className,
      )}
    >
      {children}
    </motion.tr>
  );
}
