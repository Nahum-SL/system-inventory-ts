import { useState } from "react";
import { FilterX } from "lucide-react";
// ATOMIC COMPONTENTS
import Alert from "@/shared/components/ui/Alert";
import { LoadingState } from "@/shared/components/ui/states/LoadingState";
// UTILS
import { cn } from "@/shared/lib/utils";
// HOOKS
import { useDistribution } from "../../hooks/use-distribution";
import {
  AreaSelect,
  CategorySelect,
} from "@/modules/catalogs/components/select";
// TYPES
import type { DistributionFilters } from "../../types";
// UI COMPONENTS
import ChipGroup, { type ChipOption } from "@/shared/components/ui/ChiGroup";
// CHART COMPONENTS
import { AssetDistributionChart } from "./AssetDistributionChart";
import ChartCard from "./ChartCard";

type EstadoFilter = NonNullable<DistributionFilters["estado"]> | "";

const ESTADOS: ChipOption<EstadoFilter>[] = [
  { value: "", label: "Todos" },
  { value: "operativo", label: "Operativos" },
  { value: "mantenimiento", label: "En mantenimiento" },
  { value: "fuera_de_servicio", label: "Fuera de servicio" },
];

const labelClass =
  "mb-1 block text-xs font-medium text-slate-500 dark:text-slate-400";

export default function AssetDistributionCard() {
  const [area, setArea] = useState("");
  const [categoria, setCategoria] = useState("");
  const [estado, setEstado] = useState<EstadoFilter>("");

  const filters: DistributionFilters = {
    ...(area ? { areaId: Number(area) } : {}),
    ...(categoria ? { categoriaId: Number(categoria) } : {}),
    ...(estado ? { estado } : {}),
  };
  const hasFilters = Boolean(area || categoria || estado);

  const { data, isPending, error, isPlaceholderData } =
    useDistribution(filters);
  // Sin filtros: ya está en caché y fija los colores de las categorías.
  const base = useDistribution({});

  const clear = () => {
    setArea("");
    setCategoria("");
    setEstado("");
  };

  return (
    <ChartCard
      title="Distribución de activos por área y categoría"
      className="lg:col-span-2"
    >
      <div className="mb-5 flex flex-wrap items-end gap-3">
        <div className="w-full sm:w-56">
          <span className={labelClass}>Área</span>
          <AreaSelect
            value={area}
            onChange={setArea}
            allLabel="Todas las áreas"
          />
        </div>

        <div className="w-full sm:w-56">
          <span className={labelClass}>Categoría</span>
          <CategorySelect
            value={categoria}
            onChange={setCategoria}
            allLabel="Todas las categorías"
          />
        </div>

        <div>
          <div>
            <span className={labelClass}>Estado</span>
            <ChipGroup
              label="Filtrar por estado"
              options={ESTADOS}
              value={estado}
              onChange={setEstado}
            />
          </div>
        </div>

        {hasFilters && (
          <button
            type="button"
            onClick={clear}
            className="inline-flex items-center gap-1.5 rounded-lg px-2 py-1.5 text-sm text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100 cursor-pointer"
          >
            <FilterX className="size-4" aria-hidden />
            Limpiar filtros
          </button>
        )}

        {data && (
          <p className="ml-auto text-sm font-semibold text-slate-700 dark:text-slate-200">
            {data.total} {data.total === 1 ? "activo" : "activos"}
          </p>
        )}
      </div>

      {isPending ? (
        <LoadingState message="Cargando distribución…" className="py-8" />
      ) : error ? (
        <Alert>{error.message}</Alert>
      ) : (
        <div
          className={cn(
            "transition-opacity",
            isPlaceholderData && "opacity-60",
          )}
        >
          <AssetDistributionChart
            data={data}
            paletteOrder={base.data?.categorias.map((c) => c.id)}
          />
        </div>
      )}
    </ChartCard>
  );
}
