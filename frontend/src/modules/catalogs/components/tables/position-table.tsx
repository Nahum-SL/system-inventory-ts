import { BriefcaseBusiness } from "lucide-react";

// COMPONENTES - TABLE
import { Table } from "@/shared/components/ui/tables/Table";
import { EmptyState } from "@/shared/components/ui/states/EmptyState";
import { ErrorState } from "@/shared/components/ui/states/ErrorState";

// ROW
import PositionRow from "./position-row";

// TYPES
import type { Position } from "../../types";

interface Props {
  rows: Position[];
  isLoading: boolean;
  error: Error | null;
  searchTerm: string;
  onEdit: (position: Position) => void;
  onRetry: () => void;
}

const headers = ["ÁREA", "CARGO", "ACCIONES"];

export default function PositionTable({
  rows,
  isLoading,
  error,
  searchTerm,
  onEdit,
  onRetry,
}: Props) {
  const isEmpty = rows.length === 0;

  const emptyComponent = error ? (
    <ErrorState
      title="No se pudieron cargar los cargos"
      description={error.message}
      onRetry={onRetry}
    />
  ) : (
    <EmptyState
      icon={BriefcaseBusiness}
      title={
        searchTerm ? "No se encontraron cargos" : "No hay cargos registrados"
      }
      description={
        searchTerm
          ? "Prueba con otro nombre de cargo o área."
          : "Cuando registres un cargo, aparecerá en esta tabla."
      }
    />
  );

  return (
    <Table
      headers={headers}
      isLoading={isLoading}
      isEmpty={isEmpty}
      emptyComponent={emptyComponent}
      className="rounded-2xl"
    >
      {rows.map((position) => (
        <PositionRow key={position.id} position={position} onEdit={onEdit} />
      ))}
    </Table>
  );
}
