import type { ReactNode } from "react";
import { cn } from "@/shared/lib/utils";

const TONES = {
  error: "bg-red-50 text-red-700 dark:bg-red-950/40 dark:text-red-400",
  info: "bg-blue-50 text-blue-800 dark:bg-blue-950/40 dark:text-blue-400",
  warning: "bg-amber-50 text-amber-800 dark:bg-amber-950/40 dark:text-amber-400",
};

export default function Alert({
  tone = "error",
  children,
}: {
  tone?: keyof typeof TONES;
  children: ReactNode;
}) {
  return (
    <p
      role={tone === "error" ? "alert" : "status"}
      className={cn("rounded-md p-2 text-sm", TONES[tone])}
    >
      {children}
    </p>
  );
}
