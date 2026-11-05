
import type { ReactNode } from "react";
import { Link, useLocation, useParams } from "react-router";
import {
  ArrowLeft,
  CalendarDays,
  FileDown,
  Layers3,
  MapPin,
  Tag,
  UserRound,
  Wrench,
  type LucideIcon,
} from "lucide-react";

import { useFileDownload } from "@/shared/hooks/use-file-download";
import { downloadAssetSheet } from "@/modules/reports/api/export.api";

import AssetImage from "../components/AssetImage";
import StatusBadge from "../components/StatusBadge";
import { useAssetCard } from "../hooks/useAssetCard";

import type { AssetCard } from "../types";

interface Props {
  actions?: (asset: AssetCard) => ReactNode;
  errorActions?: (codigo: string) => ReactNode;
  backTo?: string;
}

const panelClass = [
  "min-w-0 rounded-2xl border",
  "border-slate-200 bg-white shadow-sm",
  "dark:border-[#34415f] dark:bg-[#1e2943]",
].join(" ");

function display(value?: string | null) {
  return value?.trim() || "No registrado";
}

function formatAssetDate(value?: string | null) {
  if (!value) return "No registrada";

  const parts = value.slice(0, 10).split("-");

  if (parts.length === 3) {
    const [year, month, day] = parts;
    return `${day}/${month}/${year}`;
  }

  return value;
}

function SummaryCard({
  icon: Icon,
  label,
  value,
}: {
  icon: LucideIcon;
  label: string;
  value: string;
}) {
  return (
    <div className={`${panelClass} flex items-center gap-3 p-4`}>
      <div
        className="
          flex size-11 shrink-0 items-center justify-center
          rounded-xl bg-indigo-500/10
          text-indigo-600 dark:text-indigo-400
        "
      >
        <Icon size={20} aria-hidden="true" />
      </div>

      <div className="min-w-0">
        <p className="text-xs text-slate-500 dark:text-slate-400">
          {label}
        </p>

        <p
          className="
            mt-1 break-words text-sm font-semibold
            text-slate-900 dark:text-white
          "
        >
          {value}
        </p>
      </div>
    </div>
  );
}

function ErrorState({
  title,
  message,
  back,
  children,
}: {
  title: string;
  message: string;
  back: string;
  children?: ReactNode;
}) {
  return (
    <section
      role="alert"
      className={`${panelClass} space-y-4 p-6`}
    >
      <h1 className="text-lg font-semibold text-slate-900 dark:text-white">
        {title}
      </h1>

      <p className="text-sm text-slate-600 dark:text-slate-300">
        {message}
      </p>

      {children && (
        <div className="flex flex-wrap gap-2">
          {children}
        </div>
      )}

      <Link
        to={back}
        className="
          inline-flex items-center gap-2
          text-sm font-medium text-indigo-600
          hover:text-indigo-500 dark:text-indigo-400
        "
      >
        <ArrowLeft size={16} />
        Volver a activos
      </Link>
    </section>
  );
}

/**
 * Separamos el contenido de la ficha para poder usar
 * el hook de descarga únicamente cuando el activo existe.
 */
function AssetDetail({
  asset,
  actions,
  back,
}: {
  asset: AssetCard;
  actions?: (asset: AssetCard) => ReactNode;
  back: string;
}) {
  const pdf = useFileDownload(() =>
    downloadAssetSheet(asset.codigoInventario),
  );

  const responsible =
    asset.asignacionActual?.personaNombre ?? "Sin asignar";

  return (
    <article className="min-w-0 space-y-5 pb-8">
      {/* NAVEGACIÓN SUPERIOR */}
      <nav
        aria-label="Navegación del activo"
        className="flex items-center gap-3"
      >
        <Link
          to={back}
          aria-label="Volver a activos"
          className="
            flex size-10 shrink-0 items-center justify-center
            rounded-xl border border-slate-200
            bg-white text-slate-600
            transition-colors hover:bg-slate-100
            dark:border-[#34415f] dark:bg-[#202b45]
            dark:text-slate-200 dark:hover:bg-[#293756]
          "
        >
          <ArrowLeft size={19} aria-hidden="true" />
        </Link>

        <div className="flex flex-wrap items-center gap-2 text-sm">
          <span className="text-slate-500 dark:text-slate-400">
            Activos
          </span>
          <span className="text-slate-400">/</span>
          <span className="font-semibold text-slate-900 dark:text-white">
            Detalle del activo
          </span>
        </div>
      </nav>

      {/* FICHA PRINCIPAL */}
      <section
        aria-labelledby="asset-detail-title"
        className={`${panelClass} p-4 sm:p-6`}
      >
        <div className="flex flex-col gap-5 md:flex-row md:items-center">
          {/* IMAGEN */}
          <div className="w-full shrink-0 md:w-48 lg:w-52">
            <AssetImage asset={asset} />
          </div>

          {/* INFORMACIÓN */}
          <div className="min-w-0 flex-1">
            <p
              className="
                text-xs font-semibold uppercase tracking-wider
                text-indigo-600 dark:text-indigo-400
              "
            >
              Ficha del activo
            </p>

            {/* CÓDIGO + PDF EN LA MISMA FILA */}
            <div className="mt-2 flex flex-wrap items-start justify-between gap-3">
              <h1
                id="asset-detail-title"
                className="
                  min-w-0 break-words font-mono
                  text-2xl font-bold tracking-tight
                  text-slate-900 dark:text-white
                  sm:text-3xl
                "
              >
                {asset.codigoInventario}
              </h1>

              <button
                type="button"
                disabled={pdf.isPending}
                onClick={() => pdf.mutate()}
                className="
                  inline-flex min-h-10 shrink-0 items-center
                  justify-center gap-2 rounded-xl
                  bg-indigo-600 px-4 py-2
                  text-sm font-semibold text-white
                  transition-colors hover:bg-indigo-500
                  focus-visible:outline-none
                  focus-visible:ring-2 focus-visible:ring-indigo-500
                  disabled:cursor-not-allowed disabled:opacity-50
                "
              >
                <FileDown size={17} aria-hidden="true" />
                {pdf.isPending ? "Generando..." : "Exportar PDF"}
              </button>
            </div>

            <p
              className="
                mt-2 text-sm leading-6
                text-slate-600 dark:text-slate-200
                sm:text-base
              "
            >
              {asset.descripcion}
            </p>

            <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-3">
              <StatusBadge estado={asset.estado} />

              <span
                className="
                  inline-flex items-center gap-2 text-sm
                  text-slate-600 dark:text-slate-300
                "
              >
                <MapPin size={16} aria-hidden="true" />
                {display(asset.areaNombre)}
              </span>

              <span
                className="
                  inline-flex items-center gap-2 text-sm
                  text-slate-600 dark:text-slate-300
                "
              >
                <UserRound size={16} aria-hidden="true" />
                {responsible}
              </span>
            </div>

            <p
              className="
                mt-4 flex items-center gap-2
                text-xs text-slate-500 dark:text-slate-400
              "
            >
              <CalendarDays size={14} aria-hidden="true" />
              Fecha de ingreso: {formatAssetDate(asset.fechaIngreso)}
            </p>

            {pdf.error && (
              <p
                role="alert"
                className="mt-3 text-sm text-red-600 dark:text-red-400"
              >
                No se pudo exportar el PDF: {pdf.error.message}
              </p>
            )}
          </div>
        </div>
      </section>

      {/* RESUMEN */}
      <section
        aria-label="Resumen del activo"
        className="grid grid-cols-2 gap-3 xl:grid-cols-4"
      >
        <SummaryCard
          icon={Tag}
          label="Marca"
          value={display(asset.marcaNombre)}
        />

        <SummaryCard
          icon={Layers3}
          label="Categoría"
          value={display(asset.categoriaNombre)}
        />

        <SummaryCard
          icon={MapPin}
          label="Ubicación"
          value={display(asset.areaNombre)}
        />

        <SummaryCard
          icon={UserRound}
          label="Responsable"
          value={responsible}
        />
      </section>

      {/* MANTENIMIENTO ACTIVO */}
      {asset.mantenimientoAbierto && (
        <section
          className="
            rounded-xl border border-amber-500/30
            bg-amber-500/10 p-4
          "
        >
          <div className="flex items-start gap-3">
            <Wrench
              size={19}
              className="mt-0.5 shrink-0 text-amber-500"
              aria-hidden="true"
            />

            <div className="min-w-0">
              <h2
                className="
                  text-sm font-semibold
                  text-amber-700 dark:text-amber-300
                "
              >
                Mantenimiento en curso
              </h2>

              <p className="mt-1 text-sm text-slate-700 dark:text-slate-300">
                {asset.mantenimientoAbierto.tipo}

                {asset.mantenimientoAbierto.descripcion
                  ? ` · ${asset.mantenimientoAbierto.descripcion}`
                  : ""}
              </p>

              <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
                Desde{" "}
                {formatAssetDate(
                  asset.mantenimientoAbierto.fecha,
                )}
              </p>
            </div>
          </div>
        </section>
      )}

      {/* ACCIONES Y PESTAÑAS */}
      {actions && (
        <section
          aria-label="Gestión del activo"
          className={`${panelClass} overflow-hidden p-4 sm:p-5`}
        >
          {actions(asset)}
        </section>
      )}
    </article>
  );
}

export default function AssetCardPage({
  actions,
  errorActions,
  backTo,
}: Props) {
  const { codigo = "" } = useParams();
  const { state } = useLocation();

  const listSearch =
    (state as { listSearch?: string } | null)?.listSearch ?? "";

  const back = `${backTo ?? ".."}${listSearch}`;

  const {
    data: asset,
    isPending,
    error,
  } = useAssetCard(codigo);

  if (isPending) {
    return (
      <section
        aria-label="Cargando detalle del activo"
        className="space-y-4"
      >
        <div className="h-10 w-64 animate-pulse rounded-xl bg-slate-200 dark:bg-[#202b45]" />
        <div className="h-48 animate-pulse rounded-2xl bg-slate-200 dark:bg-[#202b45]" />
        <div className="h-20 animate-pulse rounded-2xl bg-slate-200 dark:bg-[#202b45]" />
        <div className="h-64 animate-pulse rounded-2xl bg-slate-200 dark:bg-[#202b45]" />
      </section>
    );
  }

  if (error) {
    const status =
      typeof error === "object" &&
      error !== null &&
      "status" in error
        ? Number(error.status)
        : 0;

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
      >
        {status === 410 && errorActions?.(codigo)}
      </ErrorState>
    );
  }

  if (!asset) {
    return (
      <ErrorState
        title="Activo no disponible"
        message="No se recibieron datos del activo."
        back={back}
      />
    );
  }

  return (
    <AssetDetail
      asset={asset}
      actions={actions}
      back={back}
    />
  );
}
