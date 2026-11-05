import { useId, useState, type ReactNode } from "react";
import { AnimatePresence, MotionConfig, motion } from "motion/react";
import { Ellipsis, type LucideIcon } from "lucide-react";
// UTIL
import { cn } from "@/shared/lib/utils";
// ATOMIC COMPONENTS
import ActionTile, { type ActionTone } from "../Buttons/ActionTittle";

export interface ActionItem {
  id: string;
  label: string;
  icon: LucideIcon;
  tone?: ActionTone;
  onClick: () => void;
  disabledReason?: string;
  /** Muestra el spinner y bloquea el bloque (p. ej. durante una descarga). */
  loading?: boolean;
}

interface Props {
  /** Siempre visibles. */
  main: ActionItem[];
  /** Se despliegan con el bloque «Más opciones». */
  more?: ActionItem[];
  /** Contenido extra al final de lo desplegado (acciones que aún no son bloques). */
  moreExtra?: ReactNode;
}

// Clases estáticas: Tailwind no detecta nombres armados con variables.
const SM_COLS: Record<number, string> = {
  1: "sm:grid-cols-1",
  2: "sm:grid-cols-2",
  3: "sm:grid-cols-3",
  4: "sm:grid-cols-4",
};

const reasonsOf = (items: ActionItem[]) => [
  ...new Set(items.flatMap((item) => item.disabledReason ?? [])),
];

const hintClass = "text-sm leading-5 text-slate-500 dark:text-slate-400";

export default function ExpandableActionGrid({
  main,
  more = [],
  moreExtra,
}: Props) {
  const [open, setOpen] = useState(false);
  const panelId = useId();
  const hasMore = more.length > 0 || Boolean(moreExtra);
  const columns = Math.min(main.length + (hasMore ? 1 : 0), 4);

  const renderTile = (item: ActionItem) => (
    <ActionTile
      key={item.id}
      icon={item.icon}
      label={item.label}
      tone={item.tone}
      loading={item.loading}
      disabledReason={item.disabledReason}
      onClick={item.onClick}
    />
  );

  return (
    <MotionConfig reducedMotion="user">
      <div className={cn("grid grid-cols-2 gap-3", SM_COLS[columns])}>
        {main.map(renderTile)}

        {hasMore && (
          <ActionTile
            icon={Ellipsis}
            label={open ? "Menos opciones" : "Más opciones"}
            aria-expanded={open}
            aria-controls={panelId}
            onClick={() => setOpen((value) => !value)}
          />
        )}
      </div>

      {reasonsOf(main).map((reason) => (
        <p key={reason} className={cn("mt-3", hintClass)}>
          {reason}
        </p>
      ))}

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            id={panelId}
            key="more"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            // El margen negativo + padding evita que el overflow recorte el anillo de foco.
            className="-mx-1 overflow-hidden px-1 pb-1"
          >
            <div className="space-y-3 pt-3">
              {more.length > 0 && (
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                  {more.map(renderTile)}
                </div>
              )}

              {reasonsOf(more).map((reason) => (
                <p key={reason} className={hintClass}>
                  {reason}
                </p>
              ))}

              {moreExtra}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </MotionConfig>
  );
}
