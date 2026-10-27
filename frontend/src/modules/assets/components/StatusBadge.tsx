import type { AssetStatus } from "../types";
import { STATUS_LABELS, STATUS_STYLES } from "../utils/status";

export default function StatusBadge({ estado }: { estado: AssetStatus }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-full border px-2.5 py-1 text-xs font-medium ${STATUS_STYLES[estado]}`}
    >
      <span
        className="size-1.5 shrink-0 rounded-full bg-current"
        aria-hidden="true"
      />
      {STATUS_LABELS[estado]}
    </span>
  );
}
