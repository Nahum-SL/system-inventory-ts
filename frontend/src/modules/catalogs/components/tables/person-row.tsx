import { Pencil, Mail, Phone } from "lucide-react";

// COMPONENTES - TABLE
import { TableRow } from "@/shared/components/ui/tables/TableRow";
import { TableCell } from "@/shared/components/ui/tables/TableCell";
import { TableButton } from "@/shared/components/ui/tables/TableButton";

// TYPES
import type { Person } from "../../types";

interface Props {
  person: Person;
  onEdit: (person: Person) => void;
}

export default function PersonRow({ person, onEdit }: Props) {
  return (
    <TableRow>
      <TableCell>
        <div className="min-w-0">
          <p className="font-semibold text-slate-900 dark:text-gray-100">
            {person.apellidos}, {person.nombres}
          </p>
          <p className="mt-1 text-xs text-slate-400 dark:text-gray-500 sm:hidden">
            DNI: {person.numerodoc}
          </p>
        </div>
      </TableCell>

      <TableCell className="whitespace-nowrap">{person.numerodoc}</TableCell>

      <TableCell className="hidden sm:table-cell">
        <div className="flex items-center gap-2">
          <Phone
            size={14}
            className="shrink-0 text-slate-400"
            aria-hidden="true"
          />
          <span>{person.telefono}</span>
        </div>
      </TableCell>

      <TableCell className="hidden md:table-cell">
        <div className="flex min-w-0 items-center gap-2">
          <Mail
            size={14}
            className="shrink-0 text-slate-400"
            aria-hidden="true"
          />
          <span className="truncate">{person.email}</span>
        </div>
      </TableCell>

      <TableCell align="right">
        <div className="flex justify-end">
          <TableButton
            title={`Editar a ${person.nombres} ${person.apellidos}`}
            variant="DEFAULT"
            onClick={() => onEdit(person)}
            className="text-blue-600 dark:text-blue-400"
          >
            <Pencil size={16} aria-hidden="true" />
          </TableButton>
        </div>
      </TableCell>
    </TableRow>
  );
}
