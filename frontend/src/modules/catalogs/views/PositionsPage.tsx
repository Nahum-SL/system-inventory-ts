import { useState } from "react";

// COMPONENTES
import Alert from "@/shared/components/ui/Alert";
import Button from "@/shared/components/ui/Buttons/button";
import SearchInput from "@/shared/components/ui/inputs/SearchInput";

// COMPONENTS - FORM
import PositionModal from "../components/form/PositionModal";

// TABLE
import PositionTable from "../components/tables/position-table";

// HOOKS
import { useAreas, usePositions } from "../hooks/use-catalog-queries";

// TYPES
import type { Position } from "../types";
import SectionHeader from "@/shared/components/ui/SectionHeader";
import { Briefcase } from "lucide-react";

export default function PositionsPage() {
  const { data, isPending, error, refetch } = usePositions();

  const [editing, setEditing] = useState<Position | "new" | null>(null);
  const [q, setQ] = useState("");

  // Precarga las áreas para que el select tenga opciones al abrir el modal.
  useAreas();

  const term = q.trim().toLowerCase();

  const rows = (data ?? []).filter((position) =>
    `${position.areaNombre} ${position.nombre}`.toLowerCase().includes(term),
  );

  return (
    <section className="space-y-5">
      <SectionHeader
        title="Cargos"
        description="Gestiona los cargos y sus áreas correspondientes."
        icon={Briefcase}
        actions={
          <Button onClick={() => setEditing("new")}>Nuevo cargo</Button>
        }
      />

      <div className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm dark:border-gray-800 dark:bg-gray-900">
        <label
          htmlFor="position-search"
          className="mb-2 block text-sm font-medium text-slate-700 dark:text-gray-300"
        >
          Buscar cargos
        </label>

        <SearchInput
          value={q}
          onChange={setQ}
          placeholder="Nombre del cargo o área..."
        />

        <div className="mt-3 flex items-center justify-between gap-3">
          <p
            className="text-xs text-slate-500 dark:text-gray-400"
            aria-live="polite"
          >
            {isPending
              ? "Cargando registros..."
              : `${rows.length} resultado(s)`}
          </p>
        </div>
      </div>

      {error && rows.length > 0 && <Alert>{error.message}</Alert>}

      <PositionTable
        rows={rows}
        isLoading={isPending}
        error={error}
        searchTerm={term}
        onEdit={setEditing}
        onRetry={() => void refetch()}
      />

      <PositionModal
        item={editing === "new" ? undefined : (editing ?? undefined)}
        open={editing !== null}
        onClose={() => setEditing(null)}
      />
    </section>
  );
}
