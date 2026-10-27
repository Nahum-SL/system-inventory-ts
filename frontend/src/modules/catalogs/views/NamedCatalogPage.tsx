import { useState } from "react";

// COMPONENTES
import Alert from "@/shared/components/ui/Alert";
import Button from "@/shared/components/ui/Buttons/button";
import SearchInput from "@/shared/components/ui/inputs/SearchInput";
// CONSTANTS
import { NAMED_LABELS } from "../constants/namedLabels";
// COMPONENTS - FORM
import NamedItemModal from "../components/form/NamedItemModal";
// TABLE
import NamedItemTable from "../components/tables/named-item-table";
// HOOKS
import { useNamedCatalog } from "../hooks/use-catalog-queries";
// TYPES
import type { NamedItem, NamedKind } from "../types";
import SectionHeader from "@/shared/components/ui/SectionHeader";
import { Layers } from "lucide-react";

export default function NamedCatalogPage({ kind }: { kind: NamedKind }) {
  const { plural, singular } = NAMED_LABELS[kind];
  const { data, isPending, error, refetch } = useNamedCatalog(kind);

  const [editing, setEditing] = useState<NamedItem | "new" | null>(null);
  const [q, setQ] = useState("");

  const term = q.trim().toLowerCase();

  const rows = (data ?? []).filter((item) =>
    item.nombre.toLowerCase().includes(term),
  );

  return (
    <section className="space-y-5">
      <SectionHeader
        title={plural}
        description={`Gestiona los registros de ${plural.toLowerCase()} del sistema.`}
        icon={Layers}
        actions={
          <Button onClick={() => setEditing("new")}>Nueva {singular}</Button>
        }
      />

      <div className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm dark:border-gray-800 dark:bg-gray-900">
        <label
          htmlFor="named-catalog-search"
          className="mb-2 block text-sm font-medium text-slate-700 dark:text-gray-300"
        >
          Buscar {plural.toLowerCase()}
        </label>

        <SearchInput
          id="named-catalog-search"
          value={q}
          onChange={setQ}
          placeholder={`Buscar ${singular}...`}
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

      <NamedItemTable
        rows={rows}
        isLoading={isPending}
        error={error}
        searchTerm={term}
        plural={plural}
        singular={singular}
        onEdit={setEditing}
        onRetry={() => void refetch()}
      />

      <NamedItemModal
        kind={kind}
        item={editing === "new" ? undefined : (editing ?? undefined)}
        open={editing !== null}
        onClose={() => setEditing(null)}
      />
    </section>
  );
}
