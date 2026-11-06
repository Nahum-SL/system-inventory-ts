import {
  ArrowLeftRight,
  UserCheck,
  Wrench,
  type LucideIcon,
} from "lucide-react";

import Timeline from "@/shared/components/ui/timeline/Timeline";
import TimelineItem from "@/shared/components/ui/timeline/TimelineItem";


import type { HistoryEvent, HistoryKind } from "../../utils/history-events";
import { TIMELINE_ONGOING_PILL, type TimelineTone } from "@/shared/lib/themes/timeline-theme";
import { formatDate } from "@/shared/lib/date/format";

// Aquí vive el significado (qué tipo de evento es cuál); los colores, en shared/lib.
const KINDS: Record<
  HistoryKind,
  { badge: string; icon: LucideIcon; tone: TimelineTone }
> = {
  asignacion: { badge: "Asignación", icon: UserCheck, tone: "violet" },
  mantenimiento: { badge: "Mantenimiento", icon: Wrench, tone: "amber" },
  traslado: { badge: "Traslado", icon: ArrowLeftRight, tone: "sky" },
};

function EventDate({ start, end }: Pick<HistoryEvent, "start" | "end">) {
  if (end === undefined) return <span>{formatDate(start)}</span>;

  return (
    <>
      <span>{formatDate(start)}</span>
      <span aria-hidden="true">→</span>
      {end ? (
        <span>{formatDate(end)}</span>
      ) : (
        <span className={TIMELINE_ONGOING_PILL}>En curso</span>
      )}
    </>
  );
}

export default function AssetHistoryTimeline({
  events,
}: {
  events: HistoryEvent[];
}) {
  return (
    <Timeline label="Historial del activo">
      {events.map((event, index) => {
        const { badge, icon, tone } = KINDS[event.kind];

        return (
          <TimelineItem
            key={event.id}
            index={index}
            icon={icon}
            tone={tone}
            badge={badge}
            title={event.title}
            subtitle={event.subtitle}
            notes={event.notes}
            highlight={event.end === null}
            date={<EventDate start={event.start} end={event.end} />}
          />
        );
      })}
    </Timeline>
  );
}
