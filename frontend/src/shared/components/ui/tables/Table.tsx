// src/components/ui/table/Table.tsx
import type { ReactNode } from "react";
import { cn } from "@/shared/lib/utils";

import { LoadingState } from "../states/LoadingState";
import { EmptyState } from "../states/EmptyState";

import { AlertCircle } from "lucide-react";

interface TableProps {
  headers: string[];
  children: ReactNode;
  isLoading?: boolean;
  isEmpty?: boolean;
  loadingComponent?: ReactNode;
  emptyComponent?: ReactNode;
  className?: string;
}

export function Table({
  headers,
  children,
  isLoading,
  isEmpty,
  loadingComponent,
  emptyComponent,
  className,
}: TableProps) {
  const colSpan = headers.length;

  return (
    <div
      className={cn(
        "overflow-x-auto border border-slate-100 dark:border-gray-800 rounded-3xl shadow-sm bg-white dark:bg-gray-900",
        className,
      )}
    >
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="bg-slate-50/70 dark:bg-gray-800/50 text-[11px] font-extrabold text-slate-400 dark:text-gray-400 uppercase tracking-widest border-b border-slate-100 dark:border-gray-800">
            {headers.map((header, index) => (
              <th
                key={header}
                className={cn(
                  "px-8 py-4 italic",
                  index === colSpan - 1 ? "text-right" : "",
                )}
              >
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 dark:divide-gray-800 text-sm">
          {isLoading && (
            <tr>
              <td colSpan={colSpan} className="px-6 py-4">
                {loadingComponent || <LoadingState />}
              </td>
            </tr>
          )}

          {!isLoading && isEmpty && (
            <tr>
              <td colSpan={colSpan} className="px-6 py-4">
                {emptyComponent || (
                  <EmptyState
                    icon={AlertCircle}
                    title="No hay registros disponibles"
                    description="Parece que aún no se ha agregado ningún elemento a esta sección."
                  />
                )}
              </td>
            </tr>
          )}

          {!isLoading && !isEmpty && children}
        </tbody>
      </table>
    </div>
  );
}
