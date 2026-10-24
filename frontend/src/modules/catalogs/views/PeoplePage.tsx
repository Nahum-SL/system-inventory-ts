import { useState } from "react";

// COMPONENTES ATÓMICOS
import Alert from "@/shared/components/ui/Alert";
import Button from "@/shared/components/ui/Buttons/button";

// COMPONENTES - FORM
import PersonModal from "@/modules/catalogs/components/form/PersonModal";

// TABLES
import PersonTable from "@/modules/catalogs/components/tables/person-table";

// HOOKS
import { usePeople } from "@/modules/catalogs";

// TYPES
import type { Person } from "@/modules/catalogs";
import SearchInput from "@/shared/components/ui/inputs/SearchInput";

export default function PeoplePage() {
  const { data, isPending, error, refetch } = usePeople();

  const [editing, setEditing] = useState<Person | "new" | null>(null);
  const [q, setQ] = useState("");

  const term = q.trim().toLowerCase();

  const rows = (data ?? []).filter((person) =>
    `${person.apellidos} ${person.nombres} ${person.numerodoc} ${person.email}`
      .toLowerCase()
      .includes(term),
  );

  return (
    <section className="space-y-5">
      <header className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900 ">
            Personas
          </h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-gray-400">
            Gestiona las personas registradas en el sistema.
          </p>
        </div>

        <Button onClick={() => setEditing("new")}>Nueva persona</Button>
      </header>

      <div className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm dark:border-gray-800 dark:bg-gray-900">
        <label
          htmlFor="people-search"
          className="mb-2 block text-sm font-medium text-slate-700 dark:text-gray-300"
        >
          Buscar personas
        </label>

        <SearchInput
          value={q}
          onChange={setQ}
          placeholder="Nombre, DNI o correo electrónico..."
        />

        <p
          className="mt-3 text-xs text-slate-500 dark:text-gray-400"
          aria-live="polite"
        >
          {isPending ? "Cargando registros..." : `${rows.length} resultado(s)`}
        </p>
      </div>

      {error && rows.length > 0 && <Alert>{error.message}</Alert>}

      <PersonTable
        rows={rows}
        isLoading={isPending}
        error={error}
        onEdit={setEditing}
        onRetry={() => void refetch()}
      />

      <PersonModal
        item={editing === "new" ? undefined : (editing ?? undefined)}
        open={editing !== null}
        onClose={() => setEditing(null)}
      />
    </section>
  );
}
