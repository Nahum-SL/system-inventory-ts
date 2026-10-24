import { useState } from "react";
// COMPONENTES ATOMICOS
import Alert from "@/shared/components/ui/Alert";
import Button from "@/shared/components/ui/Buttons/button";
import DataTable from "@/shared/components/ui/tables/DateTable";
import Spinner from "@/shared/components/Spinner";
// CONSTANTS
import { NAMED_LABELS } from "../constants/namedLabels";
// COMPONENTS - FORM
import NamedItemModal from "../components/form/NamedItemModal";
// HOOKS
import { useNamedCatalog } from "../hooks/use-catalog-queries";
// TYPES
import type { NamedItem, NamedKind } from "../types";

export default function NamedCatalogPage({ kind }: { kind: NamedKind }) {
  const { plural, singular } = NAMED_LABELS[kind];
  const { data, isPending, error } = useNamedCatalog(kind);
  const [editing, setEditing] = useState<NamedItem | "new" | null>(null);

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <h1 className="text-xl font-semibold">{plural}</h1>
        <Button onClick={() => setEditing("new")}>Nueva {singular}</Button>
      </div>

      {isPending && <Spinner />}
      {error && <Alert>{error.message}</Alert>}

      {data && (
        <>
          <p className="text-sm text-slate-500">{data.length} registro(s)</p>
          <DataTable
            rows={data}
            rowKey={(r) => r.id}
            columns={[{ header: "Nombre", cell: (r) => r.nombre }]}
            onEdit={setEditing}
          />
        </>
      )}

      <NamedItemModal
        kind={kind}
        item={editing === "new" ? undefined : (editing ?? undefined)}
        open={editing !== null}
        onClose={() => setEditing(null)}
      />
    </section>
  );
}
