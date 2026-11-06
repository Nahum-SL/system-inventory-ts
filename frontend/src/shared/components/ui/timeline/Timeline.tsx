import type { ReactNode } from "react";
import { MotionConfig } from "motion/react";

export default function Timeline({
  label,
  children,
}: {
  label?: string;
  children: ReactNode;
}) {
  return (
    <MotionConfig reducedMotion="user">
      <ol aria-label={label} className="relative">
        {children}
      </ol>
    </MotionConfig>
  );
}
