import { Pencil, Tag } from "lucide-react";

// COMPONENTES - TABLE
import { TableRow } from "@/shared/components/ui/tables/TableRow";
import { TableCell } from "@/shared/components/ui/tables/TableCell";
import { TableButton } from "@/shared/components/ui/tables/TableButton";

// TYPES
import type { NamedItem } from "../../types";

interface Props {
  item: NamedItem;
  onEdit: (item: NamedItem) => void;
}

export default function NamedItemRow({ item, onEdit }: Props) {
  return (
    <TableRow>
      <TableCell>
        <div className="flex min-w-0 items-center gap-3">
          <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-600 dark:bg-gray-800 dark:text-gray-300">
            <Tag size={17} aria-hidden="true" />
          </div>

          <span className="font-semibold text-slate-900 dark:text-gray-100">
            {item.nombre}
          </span>
        </div>
      </TableCell>

      <TableCell align="right">
        <div className="flex justify-end">
          <TableButton
            title={`Editar ${item.nombre}`}
            onClick={() => onEdit(item)}
            className="text-blue-600 dark:text-blue-400"
          >
            <Pencil size={16} aria-hidden="true" />
          </TableButton>
        </div>
      </TableCell>
    </TableRow>
  );
}
