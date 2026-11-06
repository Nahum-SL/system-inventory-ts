import type { ReactNode } from "react";
import { motion } from "motion/react";
import type { LucideIcon } from "lucide-react";
// UTILS
import { cn } from "@/shared/lib/utils";
// THEMES
import { TIMELINE_TONES, type TimelineTone } from "@/shared/lib/themes/timeline-theme";

export interface TimelineNote {
  label: string;
  value: string;
}

interface Props {
  icon: LucideIcon;
  tone: TimelineTone;
  /** Etiqueta del tipo de evento: así el significado no depende solo del color. */
  badge: string;
  title: string;
  subtitle?: string;
  date: ReactNode;
  notes?: TimelineNote[];
  /** Resalta el marcador (p. ej. algo que sigue en curso). */
  highlight?: boolean;
  /** Posición en la lista, para escalonar la entrada. */
  index?: number;
}

export default function TimelineItem({
  icon: Icon,
  tone,
  badge,
  title,
  subtitle,
  date,
  notes = [],
  highlight = false,
  index = 0,
}: Props) {
  const theme = TIMELINE_TONES[tone];

  return (
    <motion.li
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2, delay: Math.min(index, 6) * 0.04 }}
      className="group relative flex gap-3 pb-5 last:pb-0 sm:gap-4"
    >
      {/* Conector hasta el siguiente marcador */}
      <span
        aria-hidden="true"
        className="absolute top-10 bottom-0 left-[17.5px] w-px bg-slate-200 group-last:hidden dark:bg-gray-700"
      />

      <span
        className={cn(
          "relative z-10 flex size-9 shrink-0 items-center justify-center rounded-full border-2",
          theme.marker,
          highlight && "ring-4 ring-emerald-500/20",
        )}
      >
        <Icon size={16} aria-hidden="true" />
      </span>

      <div className="min-w-0 flex-1 rounded-xl border border-slate-200 bg-slate-50/60 p-4 dark:border-gray-700 dark:bg-gray-800/40">
        <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1">
          <span
            className={cn(
              "rounded-md border px-2 py-0.5 text-xs font-semibold tracking-wide uppercase",
              theme.badge,
            )}
          >
            {badge}
          </span>
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-slate-600 dark:text-slate-300">
            {date}
          </div>
        </div>

        <h3 className="mt-2 text-base font-semibold wrap-break-word text-slate-900 dark:text-slate-100">
          {title}
        </h3>

        {subtitle && (
          <p className="mt-0.5 text-sm wrap-break-word text-slate-600 dark:text-slate-300">
            {subtitle}
          </p>
        )}

        {notes.length > 0 && (
          <dl className="mt-2 space-y-1">
            {notes.map((note) => (
              <div
                key={note.label}
                className="text-sm wrap-break-word text-slate-500 dark:text-slate-400"
              >
                <dt className="inline font-medium text-slate-600 dark:text-slate-300">
                  {note.label}:{" "}
                </dt>
                <dd className="inline">{note.value}</dd>
              </div>
            ))}
          </dl>
        )}
      </div>
    </motion.li>
  );
}
