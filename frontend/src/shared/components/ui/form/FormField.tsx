import type { ReactNode } from "react";

interface Props {
  label: string;
  error?: string;
  children: ReactNode;
}

export default function FormField({ label, error, children }: Props) {
  return (
    <label className="block text-sm font-medium">
      {label}
      {children}
      {error && (
        <span className="mt-1 block text-xs font-normal text-red-600">
          {error}
        </span>
      )}
    </label>
  );
}
