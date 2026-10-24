import { Loader2 } from "lucide-react";
import { cn } from "@/shared/lib/utils";

interface LoadingStateProps {
  message?: string;
  className?: string;
  loaderClassName?: string;
  messageClassName?: string;
}
export function LoadingState({
  message = "Cargando registros...",
  className,
  loaderClassName,
  messageClassName,
}: LoadingStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center py-12 gap-3 text-gray-500",
        className,
      )}
    >
      <Loader2
        className={cn("w-8 h-8 animate-spin text-blue-600", loaderClassName)}
      />
      <p className={cn("text-sm font-medium", messageClassName)}>{message}</p>
    </div>
  );
}
