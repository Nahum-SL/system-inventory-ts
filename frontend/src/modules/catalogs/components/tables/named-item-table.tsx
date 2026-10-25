import { Tags } from "lucide-react";

// COMPONENTES - TABLE
import { Table } from "@/shared/components/ui/tables/Table";
import { EmptyState } from "@/shared/components/ui/states/EmptyState";
import { ErrorState } from "@/shared/components/ui/states/ErrorState";

// ROW
import NamedItemRow from "./named-item-row";

// TYPES
import type { NamedItem } from "../../types";

interface Props {
  rows: NamedItem[];
  isLoading: boolean;
  error: Error | null;
  searchTerm: string;
  singular: string;
  plural: string;
  onEdit: (item: NamedItem) => void;
  onRetry: () => void;
}

const headers = ["NOMBRE", "ACCIONES"];

export default function NamedItemTable({
  rows,
  isLoading,
  error,
  searchTerm,
  singular,
  onEdit,
  onRetry,
}: Props) {
  const isEmpty = rows.length === 0;

  const emptyComponent = error ? (
    <ErrorState
      title={`No se pudieron cargar los registros`}
      description={error.message}
      onRetry={onRetry}
    />
  ) : (
    <EmptyState
      icon={Tags}
      title={
        searchTerm
          ? `No se encontraron ${singular}s`
          : `No hay registros de ${singular}s`
      }
      description={
        searchTerm
          ? "Prueba con otro término de búsqueda."
          : "Cuando registres un elemento, aparecerá en esta tabla."
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
      {rows.map((item) => (
        <NamedItemRow key={item.id} item={item} onEdit={onEdit} />
      ))}
    </Table>
  );
}
