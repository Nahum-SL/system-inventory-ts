import type { ReactNode } from "react";
import Card from "@/shared/components/ui/Card";

interface Props {
  title: string;
  children: ReactNode;
  className?: string;
}

export default function ChartCard({ title, children, className }: Props) {
  return (
    <Card className={className}>
      <h2 className="mb-5 text-sm font-semibold text-slate-800 dark:text-slate-100">
        {title}
      </h2>
      {children}
    </Card>
  );
}
