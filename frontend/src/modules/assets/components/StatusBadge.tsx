import type { AssetStatus } from "../types";
import { STATUS_LABELS, STATUS_STYLES } from "../utils/status";

export default function StatusBadge({ estado }: { estado: AssetStatus }) {
  return (
    <span
      className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${STATUS_STYLES[estado]}`}
    >
      {STATUS_LABELS[estado]}
    </span>
  );
}
