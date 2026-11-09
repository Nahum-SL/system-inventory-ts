import { useCallback, useEffect, useId, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, MotionConfig, motion } from "motion/react";
import { X, ZoomIn } from "lucide-react";

import { cn } from "@/shared/lib/utils";

interface Props {
  src: string;
  alt: string;
  /** Clases del botón que envuelve la imagen (ancho, shrink, etc.). */
  className?: string;
}

// La miniatura y la vista ampliada comparten proporción (4:3). Así la animación
// compartida (layoutId) escala de forma uniforme y la imagen no se deforma.
const RADIUS = 12; // en style (no en clase) para que motion corrija el radio al animar
const SPRING = { type: "spring", stiffness: 320, damping: 34 } as const;

/**
 * Imagen que se expande a pantalla completa al tocarla.
 * Cierra con Esc, clic fuera, botón X. Devuelve el foco al botón original.
 */
export default function ZoomableImage({ src, alt, className }: Props) {
  const [open, setOpen] = useState(false);
  const layoutId = useId();
  const triggerRef = useRef<HTMLButtonElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);

  const close = useCallback(() => setOpen(false), []);

  useEffect(() => {
    if (!open) return;

    const trigger = triggerRef.current;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeRef.current?.focus();

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") close();
      // Único elemento enfocable dentro del diálogo: el foco no se escapa.
      if (event.key === "Tab") {
        event.preventDefault();
        closeRef.current?.focus();
      }
    };
    document.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", onKeyDown);
      trigger?.focus();
    };
  }, [open, close]);

  return (
    <MotionConfig reducedMotion="user">
      <button
        ref={triggerRef}
        type="button"
        onClick={() => setOpen(true)}
        aria-label={`Ampliar imagen: ${alt}`}
        aria-haspopup="dialog"
        className={cn(
          "group relative block w-full cursor-zoom-in rounded-xl",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500",
          "focus-visible:ring-offset-2 dark:focus-visible:ring-offset-gray-950",
          className,
        )}
      >
        <motion.div
          layoutId={layoutId}
          style={{ borderRadius: RADIUS }}
          transition={SPRING}
          className={cn(
            "flex aspect-4/3 w-full items-center justify-center overflow-hidden border",
            "border-slate-200 bg-slate-50 dark:border-gray-700 dark:bg-gray-800",
          )}
        >
          <img
            src={src}
            alt={alt}
            draggable={false}
            className="size-full object-contain"
          />
        </motion.div>

        {/* Pista visual: aparece al pasar el cursor/enfocar, y siempre en pantallas táctiles */}
        <span
          aria-hidden="true"
          className={cn(
            "pointer-events-none absolute bottom-2 right-2 flex size-8 items-center justify-center",
            "rounded-full bg-slate-900/60 text-white backdrop-blur-sm transition-opacity",
            "opacity-0 group-hover:opacity-100 group-focus-visible:opacity-100",
            "pointer-coarse:opacity-100",
          )}
        >
          <ZoomIn size={16} />
        </span>
      </button>

      {createPortal(
        <AnimatePresence>
          {open && (
            <motion.div
              key="backdrop"
              onClick={close}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm"
            />
          )}

          {open && (
            <motion.div
              key="card"
              layoutId={layoutId}
              role="dialog"
              aria-modal="true"
              aria-label={alt}
              style={{ borderRadius: RADIUS }}
              transition={SPRING}
              className={cn(
                "fixed inset-0 z-50 m-auto overflow-hidden border border-white/10 bg-slate-900 shadow-2xl",
                // 4:3 que siempre cabe: ancho y alto explícitos (inset-0 + m-auto necesita ambos)
                "h-[min(69vw,85vh)] w-[min(92vw,calc(85vh*4/3))]",
              )}
            >
              <img
                src={src}
                alt={alt}
                draggable={false}
                className="size-full object-contain"
              />
            </motion.div>
          )}

          {open && (
            <motion.button
              key="close"
              ref={closeRef}
              type="button"
              onClick={close}
              aria-label="Cerrar imagen"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              className={cn(
                "fixed right-4 top-4 z-[60] flex size-11 items-center justify-center rounded-full",
                "bg-white/10 text-white backdrop-blur-sm transition-colors hover:bg-white/20",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400",
              )}
            >
              <X size={22} aria-hidden="true" />
            </motion.button>
          )}
        </AnimatePresence>,
        document.body,
      )}
    </MotionConfig>
  );
}
