import { Users } from "lucide-react";

// COMPONENTES - TABLE
import { Table } from "@/shared/components/ui/tables/Table";
import { EmptyState } from "@/shared/components/ui/states/EmptyState";
import { ErrorState } from "@/shared/components/ui/states/ErrorState";

// ROW
import PersonRow from "./person-row";

// TYPES
import type { Person } from "../../types";

interface Props {
  rows: Person[];
  isLoading: boolean;
  error: Error | null;
  onEdit: (person: Person) => void;
  onRetry: () => void;
}

const headers = ["PERSONA", "DNI", "TELÉFONO", "CORREO", "ACCIONES"];

export default function PersonTable({
  rows,
  isLoading,
  error,
  onEdit,
  onRetry,
}: Props) {
  const isEmpty = rows.length === 0;

  return (
    <Table
      headers={headers}
      isLoading={isLoading}
      isEmpty={isEmpty || Boolean(error)}
      className="rounded-2xl"
      emptyComponent={
        error ? (
          <ErrorState
            title="No se pudieron cargar las personas"
            description={error.message}
            onRetry={onRetry}
          />
        ) : (
          <EmptyState
            icon={Users}
            title="No se encontraron personas"
            description="Prueba con otro nombre, DNI o correo electrónico."
          />
        )
      }
    >
      {rows.map((person) => (
        <PersonRow key={person.id} person={person} onEdit={onEdit} />
      ))}
    </Table>
  );
}
