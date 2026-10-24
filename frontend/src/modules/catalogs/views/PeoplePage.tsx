import { useState } from "react";
// COMPONENTES ATOMICOS
import Alert from "@/shared/components/ui/Alert";
import Button from "@/shared/components/ui/Buttons/button";
import DataTable from "@/shared/components/ui/tables/DateTable";
import Spinner from "@/shared/components/Spinner";
import { controlClass } from "@/shared/components/ui/Buttons/style.button";
// COMPONENTS - FORM
import PersonModal from "../components/form/PersonModal";
// HOOKS
import { usePeople } from "../hooks/use-catalog-queries";
// TYPES
import type { Person } from "../types";

export default function PeoplePage() {
  const { data, isPending, error } = usePeople();
  const [editing, setEditing] = useState<Person | "new" | null>(null);
  const [q, setQ] = useState("");

  const term = q.trim().toLowerCase();
  const rows = (data ?? []).filter((p) =>
    `${p.apellidos} ${p.nombres} ${p.numerodoc} ${p.email}`
      .toLowerCase()
      .includes(term),
  );

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <h1 className="text-xl font-semibold">Personas</h1>
        <Button onClick={() => setEditing("new")}>Nueva persona</Button>
      </div>

      <input
        type="search"
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="Buscar por nombre, DNI o correo…"
        className={controlClass}
      />

      {isPending && <Spinner />}
      {error && <Alert>{error.message}</Alert>}

      {data && (
        <>
          <p className="text-sm text-slate-500">{rows.length} resultado(s)</p>
          <DataTable
            rows={rows}
            rowKey={(r) => r.id}
            columns={[
              {
                header: "Persona",
                cell: (r) => `${r.apellidos}, ${r.nombres}`,
              },
              { header: "DNI", cell: (r) => r.numerodoc },
              {
                header: "Teléfono",
                cell: (r) => r.telefono,
                className: "hidden sm:table-cell",
              },
              {
                header: "Correo",
                cell: (r) => r.email,
                className: "hidden md:table-cell",
              },
            ]}
            onEdit={setEditing}
          />
        </>
      )}

      <PersonModal
        item={editing === "new" ? undefined : (editing ?? undefined)}
        open={editing !== null}
        onClose={() => setEditing(null)}
      />
    </section>
  );
}
