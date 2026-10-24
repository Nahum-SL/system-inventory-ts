// src/components/ui/states/ErrorStates.tsx
import { AlertTriangle, RefreshCw } from "lucide-react";

interface ErrorStateProps {
  title?: string;
  description?: string;
  onRetry?: () => void;
}

export function ErrorState({
  title = "Ocurrió un error inesperado",
  description = "No pudimos recuperar la información en este momento. Por favor, inténtalo de nuevo.",
  onRetry,
}: ErrorStateProps) {
  return (
    <div className="flex flex-col items-center justify-center text-center p-8 text-slate-400 dark:text-gray-500">
      <div className="p-3 bg-red-50 dark:bg-red-950/20 text-red-500 dark:text-red-400 rounded-2xl mb-3 border border-red-100 dark:border-red-900/30">
        <AlertTriangle className="w-6 h-6 animate-pulse" />
      </div>
      <h3 className="text-sm font-bold text-slate-900 dark:text-gray-100 uppercase tracking-tight italic">
        {title}
      </h3>
      <p className="text-xs text-slate-500 dark:text-gray-400 mt-1 max-w-xs leading-relaxed">
        {description}
      </p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="mt-4 inline-flex items-center gap-2 px-4 py-2 text-xs font-bold uppercase tracking-wider text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-xl transition-all border border-blue-100"
        >
          <RefreshCw size={12} /> Reintentar
        </button>
      )}
    </div>
  );
}
