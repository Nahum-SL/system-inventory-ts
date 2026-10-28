import type { ReactNode } from "react";

interface Props {
  label: string;
  error?: string;
  children: ReactNode;
}

export default function FormField({ label, error, children }: Props) {
  return (
    <label className="flex min-w-0 flex-col gap-1.5 text-sm font-medium text-slate-700 dark:text-slate-200">
      {label}

      {children}

      {error && (
        <span
          className="text-xs font-normal text-red-600 dark:text-red-400"
          role="alert"
        >
          {error}
        </span>
      )}
    </label>
  );
}
