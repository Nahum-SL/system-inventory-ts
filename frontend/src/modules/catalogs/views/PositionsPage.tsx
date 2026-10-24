import { useState } from "react";
// COMPONENTES ATOMICOS
import Alert from "@/shared/components/ui/Alert";
import Button from "@/shared/components/ui/Buttons/button";
import DataTable from "@/shared/components/ui/tables/DateTable";
import Spinner from "@/shared/components/Spinner";
// COMPONENTS - FORM
import PositionModal from "../components/form/PositionModal";
// HOOKS
import { useAreas, usePositions } from "../hooks/use-catalog-queries";
// TYPES
import type { Position } from "../types";

export default function PositionsPage() {
  const { data, isPending, error } = usePositions();
  const [editing, setEditing] = useState<Position | "new" | null>(null);

  // Precarga las áreas para que el select ya tenga opciones al abrir el modal.
  useAreas();

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <h1 className="text-xl font-semibold">Cargos</h1>
        <Button onClick={() => setEditing("new")}>Nuevo cargo</Button>
      </div>

      {isPending && <Spinner />}
      {error && <Alert>{error.message}</Alert>}

      {data && (
        <>
          <p className="text-sm text-slate-500">{data.length} registro(s)</p>
          <DataTable
            rows={data}
            rowKey={(r) => r.id}
            columns={[
              { header: "Área", cell: (r) => r.areaNombre },
              { header: "Cargo", cell: (r) => r.nombre },
            ]}
            onEdit={setEditing}
          />
        </>
      )}

      <PositionModal
        item={editing === "new" ? undefined : (editing ?? undefined)}
        open={editing !== null}
        onClose={() => setEditing(null)}
      />
    </section>
  );
}
