import { Building2, Pencil } from "lucide-react";

// COMPONENTES - TABLE
import { TableRow } from "@/shared/components/ui/tables/TableRow";
import { TableCell } from "@/shared/components/ui/tables/TableCell";
import { TableButton } from "@/shared/components/ui/tables/TableButton";

// TYPES
import type { Position } from "../../types";

interface Props {
  position: Position;
  onEdit: (position: Position) => void;
}

export default function PositionRow({ position, onEdit }: Props) {
  return (
    <TableRow>
      <TableCell>
        <div className="flex min-w-0 items-center gap-3">
          <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-600 dark:bg-gray-800 dark:text-gray-300">
            <Building2 size={17} aria-hidden="true" />
          </div>

          <span className="font-medium text-slate-700 dark:text-gray-200">
            {position.areaNombre}
          </span>
        </div>
      </TableCell>

      <TableCell>
        <span className="font-semibold text-slate-900 dark:text-gray-100">
          {position.nombre}
        </span>
      </TableCell>

      <TableCell align="right">
        <div className="flex justify-end">
          <TableButton
            title={`Editar cargo ${position.nombre}`}
            onClick={() => onEdit(position)}
            className="text-blue-600 dark:text-blue-400"
          >
            <Pencil size={16} aria-hidden="true" />
          </TableButton>
        </div>
      </TableCell>
    </TableRow>
  );
}
