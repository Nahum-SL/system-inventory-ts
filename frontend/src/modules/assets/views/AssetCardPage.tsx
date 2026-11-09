import type { ReactNode } from "react";
import { Link, useLocation, useParams } from "react-router";
import {
  ArrowLeft,
  CalendarDays,
  ClipboardList,
  Package,
  UserRound,
  Wrench,
} from "lucide-react";
// UTIL
import { cn } from "@/shared/lib/utils";
import { formatDate, titleCase } from "@/shared/lib/date/format";
// MANAGE ERROR
import { ApiError } from "@/shared/lib/api-error";
// COMPONENT ATOMICO
import { LoadingState } from "@/shared/components/ui/states/LoadingState";
// COMPONENTS
import AssetQr from "../components/AssetQr";
import HistorySection from "../components/HistorySection";
import StatusBadge from "../components/StatusBadge";
// HOOKS
import { useAssetCard } from "../hooks/useAssetCard";
// TYPES
import type { AssetCard } from "../types";
import AssetImage from "../components/AssetImage";
import Card from "@/shared/components/ui/Card";

interface Props {
  actions?: (asset: AssetCard) => ReactNode;
  errorActions?: (codigo: string) => ReactNode;
  backTo?: string;
}

const panelClass = cn(
  "min-w-0 rounded-2xl border p-4 sm:p-5",
  "border-slate-200 bg-white shadow-sm",
  "dark:border-gray-700 dark:bg-gray-900",
);

const sectionTitle = "text-sm font-semibold text-slate-900 dark:text-slate-100";

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-4 py-3">
      <dt className="text-sm text-slate-500 dark:text-slate-400">{label}</dt>
      <dd className="max-w-[65%] wrap-break-word text-right text-sm font-medium text-slate-800 dark:text-slate-200">
        {value}
      </dd>
    </div>
  );
}

function SectionHeading({
  icon: Icon,
  children,
}: {
  icon: typeof Package;
  children: ReactNode;
}) {
  return (
    <div className="mb-3 flex items-center gap-2">
      <Icon
        size={17}
        className="text-slate-500 dark:text-slate-400"
        aria-hidden="true"
      />
      <h2 className={sectionTitle}>{children}</h2>
    </div>
  );
}

function ErrorState({
  title,
  message,
  back,
  warning = false,
  children,
}: {
  title: string;
  message: string;
  back: string;
  warning?: boolean;
  children?: ReactNode;
}) {
  return (
    <section
      role="alert"
      className={cn(
        "rounded-2xl border p-5 sm:p-6",
        warning
          ? "border-amber-200 bg-amber-50 dark:border-amber-900/60 dark:bg-amber-950/30"
          : "border-red-200 bg-red-50 dark:border-red-900/60 dark:bg-red-950/30",
      )}
    >
      <h1
        className={cn(
          "font-semibold",
          warning
            ? "text-amber-900 dark:text-amber-200"
            : "text-red-800 dark:text-red-300",
        )}
      >
        {title}
      </h1>

      <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
        {message}
      </p>

      {children && (
        <div className="mt-4 flex flex-wrap items-center gap-2">{children}</div>
      )}
      <Link
        to={back}
        className={cn(
          "mt-4 inline-flex items-center gap-2 rounded-lg px-3 py-2",
          "text-sm font-medium transition-colors",
          "text-slate-700 hover:bg-black/5",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500",
          "dark:text-slate-200 dark:hover:bg-white/5",
        )}
      >
        <ArrowLeft size={16} aria-hidden="true" />
        Volver a la lista
      </Link>
    </section>
  );
}

export default function AssetCardPage({
  actions,
  backTo,
  errorActions,
}: Props) {
  const { codigo = "" } = useParams();
  const { state } = useLocation();

  const listSearch =
    (state as { listSearch?: string } | null)?.listSearch ?? "";

  const back = `${backTo ?? ".."}${listSearch}`;

  const { data: asset, isPending, error } = useAssetCard(codigo);

  if (isPending) {
    return (
      <section className="space-y-4" aria-label="Detalle del activo">
        <div className="h-6 w-32 animate-pulse rounded bg-slate-200 dark:bg-gray-800" />
        <Card as="div" className="space-y-4">
          <div className="h-7 w-48 animate-pulse rounded bg-slate-200 dark:bg-gray-800" />
          <div className="h-4 w-3/4 animate-pulse rounded bg-slate-100 dark:bg-gray-800" />
          <LoadingState />
        </Card>
      </section>
    );
  }

  if (error) {
    const status = error instanceof ApiError ? error.status : 0;

    const title =
      status === 410
        ? "Activo dado de baja"
        : status === 404
          ? "Activo no encontrado"
          : "No se pudo cargar el activo";

    return (
      <ErrorState
        title={title}
        message={error.message}
        back={back}
        warning={status === 410}
      >
        {status === 410 && errorActions?.(codigo)}
      </ErrorState>
    );
  }

  if (!asset) {
    return (
      <ErrorState
        title="Activo no disponible"
        message="No se recibieron datos del activo. Vuelve a la lista e inténtalo de nuevo."
        back={back}
      />
    );
  }

  const situation = [
    asset.asignacionActual
      ? `Asignado a ${titleCase(asset.asignacionActual.personaNombre)}`
      : asset.estado === "operativo"
        ? "Disponible para asignar"
        : null,
    asset.areaNombre,
  ]
    .filter(Boolean)
    .join(" · ");

  return (
    <article className="min-w-0 space-y-5">
      {/* Navegación */}
      <nav aria-label="Navegación del activo">
        <Link
          to={back}
          className={cn(
            "inline-flex items-center gap-2 rounded-lg py-1 text-sm font-medium",
            "text-slate-500 transition-colors hover:text-amber-700",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500",
            "dark:text-slate-400 dark:hover:text-amber-300",
          )}
        >
          <ArrowLeft size={16} aria-hidden="true" />
          Volver a activos
        </Link>
      </nav>

      {/* Encabezado principal */}
      <header
        className={cn(
          "flex min-w-0 flex-col gap-4 rounded-2xl border p-4 sm:p-6",
          "border-slate-200 bg-white shadow-sm",
          "dark:border-gray-700 dark:bg-gray-900",
        )}
      >
        <div className="flex min-w-0 flex-col gap-4 sm:flex-row sm:items-start">
          <AssetImage asset={asset} zoomable className="sm:w-56 sm:shrink-0" />

          <div className="flex min-w-0 flex-1 items-start gap-3">
            <div className="flex size-11 shrink-0 items-center justify-center rounded-xl border border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-900/60 dark:bg-amber-950/40 dark:text-amber-300">
              <Package size={22} aria-hidden="true" />
            </div>

            <div className="min-w-0 flex-1">
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Detalle del activo
              </p>

              <h1 className="mt-1 wrap-break-word font-mono text-xl font-bold tracking-tight text-slate-900 dark:text-slate-100 sm:text-2xl">
                {asset.codigoInventario}
              </h1>

              <p className="mt-2 wrap-break-word text-sm leading-6 text-slate-600 dark:text-slate-300 sm:text-base">
                {asset.descripcion}
              </p>

              {/* Estado y situación actual */}
              <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-2">
                <StatusBadge estado={asset.estado} />

                {situation && (
                  <p className="text-sm font-medium text-slate-700 dark:text-slate-200">
                    {situation}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
        {actions && (
          <div className="border-t border-slate-100 pt-4 dark:border-gray-800">
            <div className="flex justify-center">
              <div className="w-full max-w-4xl">{actions(asset)}</div>
            </div>
          </div>
        )}
      </header>

      {/* Mantenimiento activo */}
      {asset.mantenimientoAbierto && (
        <section
          className={cn(
            "rounded-2xl border p-4 sm:p-5",
            "border-amber-200 bg-amber-50/80",
            "dark:border-amber-900/60 dark:bg-amber-950/30",
          )}
        >
          <div className="flex items-start gap-3">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-amber-100 text-amber-800 dark:bg-amber-900/50 dark:text-amber-300">
              <Wrench size={20} aria-hidden="true" />
            </div>

            <div className="min-w-0 flex-1">
              <h2 className="font-semibold text-amber-950 dark:text-amber-200">
                Mantenimiento en curso
              </h2>

              <p className="mt-1 text-xs font-medium uppercase tracking-wide text-amber-800 dark:text-amber-300">
                {asset.mantenimientoAbierto.tipo}
              </p>

              <p className="mt-2 wrap-break-word text-sm text-slate-700 dark:text-slate-300">
                {asset.mantenimientoAbierto.descripcion}
              </p>

              <p className="mt-3 flex items-center gap-2 text-xs text-slate-600 dark:text-slate-400">
                <CalendarDays size={14} aria-hidden="true" />
                Desde {formatDate(asset.mantenimientoAbierto.fecha)}
              </p>
            </div>
          </div>
        </section>
      )}

      {/* Información del activo */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card>
          <SectionHeading icon={UserRound}>Responsable actual</SectionHeading>

          {asset.asignacionActual ? (
            <dl className="divide-y divide-slate-100 dark:divide-gray-800">
              <Row
                label="Persona"
                value={titleCase(asset.asignacionActual.personaNombre)}
              />
              <Row label="Cargo" value={asset.asignacionActual.cargoNombre} />
              <Row
                label="Asignado desde"
                value={formatDate(asset.asignacionActual.fechaInicio)}
              />
            </dl>
          ) : (
            <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-3 dark:border-emerald-900/60 dark:bg-emerald-950/30">
              <p className="text-sm font-medium text-emerald-800 dark:text-emerald-300">
                Sin responsable asignado
              </p>

              <p className="mt-1 text-xs text-emerald-700 dark:text-emerald-400">
                Este activo puede ser asignado a una persona.
              </p>
            </div>
          )}
        </Card>

        <section className={panelClass}>
          <SectionHeading icon={ClipboardList}>Datos del activo</SectionHeading>

          <dl className="divide-y divide-slate-100 dark:divide-gray-800">
            <Row label="Marca" value={asset.marcaNombre} />
            <Row label="Categoría" value={asset.categoriaNombre} />
            <Row label="Área" value={asset.areaNombre} />
            <Row
              label="Fecha de ingreso"
              value={formatDate(asset.fechaIngreso)}
            />
          </dl>
        </section>
      </div>

      {/* Historial y QR */}
      <HistorySection assetId={asset.id} />

      <AssetQr id={asset.id} codigo={asset.codigoInventario} />
    </article>
  );
}
