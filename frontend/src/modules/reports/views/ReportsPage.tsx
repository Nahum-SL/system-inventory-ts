import { useState, type ReactNode } from "react";
import {
  ArrowLeftRight,
  CalendarDays,
  FileSpreadsheet,
  Package,
  ShieldCheck,
  Wrench,
} from "lucide-react";

import Alert from "@/shared/components/ui/Alert";
import FormField from "@/shared/components/ui/form/FormField";
import { controlClass } from "@/shared/components/ui/Buttons/style.button";
import { cn } from "@/shared/lib/utils";

import {
  downloadAssets,
  downloadAssetsPdf,
  downloadMaintenance,
  downloadMovements,
} from "../api/export.api";

import ExportButton from "../components/ExportButton";
import type { DateRange } from "../types";
import SectionHeader from "@/shared/components/ui/SectionHeader";

function ReportCard({
  title,
  description,
  children,
  icon,
}: {
  title: string;
  description: string;
  children: ReactNode;
  icon: ReactNode;
}) {
  return (
    <section
      className={cn(
        "min-w-0 space-y-4 rounded-2xl border p-4 shadow-sm sm:p-5",
        "border-slate-200 bg-white",
        "dark:border-gray-700 dark:bg-gray-900",
      )}
    >
      <div className="flex items-start gap-3">
        <div className="flex size-10 shrink-0 items-center justify-center rounded-xl border border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-900/60 dark:bg-amber-950/40 dark:text-amber-300">
          {icon}
        </div>

        <div className="min-w-0">
          <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
            {title}
          </h2>
          <p className="mt-1 text-sm leading-5 text-slate-500 dark:text-slate-400">
            {description}
          </p>
        </div>
      </div>

      <div className="border-t border-slate-100 pt-4 dark:border-gray-800">
        {children}
      </div>
    </section>
  );
}

export default function ReportsPage() {
  return (
    <section className="min-w-0 space-y-6">
      <SectionHeader
        title="Reportes"
        description="Exporta información del inventario para consulta y seguimiento."
        icon={FileSpreadsheet}
      />

      <div className="flex items-start gap-3 rounded-2xl border border-blue-200 bg-blue-50 p-4 dark:border-blue-900/60 dark:bg-blue-950/30">
        <ShieldCheck
          size={19}
          className="mt-0.5 shrink-0 text-blue-700 dark:text-blue-300"
          aria-hidden="true"
        />
        <div>
          <p className="text-sm font-semibold text-blue-900 dark:text-blue-200">
            Protección de datos
          </p>
          <p className="mt-1 text-sm leading-5 text-blue-800 dark:text-blue-300">
            Los archivos pueden contener datos personales, como nombres de
            responsables y usuarios. Almacénalos únicamente en ubicaciones
            autorizadas.
          </p>
        </div>
      </div>

      <div className="grid min-w-0 gap-4 xl:grid-cols-2">
        <ReportCard
          title="Inventario de activos"
          description="Exporta todos los activos y su responsable actual. Para obtener una lista filtrada, utiliza la opción de exportación en el módulo Activos."
          icon={<Package size={20} aria-hidden="true" />}
        >
          <div className="space-y-4">
            <p className="text-xs leading-5 text-slate-500 dark:text-slate-400">
              CSV: todos los activos · PDF: listado por área con fotos, incluye
              dados de baja
            </p>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <ExportButton
                fetchFile={() => downloadAssetsPdf({ incluirBajas: true })}
                label="Inventario con fotos (PDF)"
                variant="primary"
              />
              <ExportButton
                fetchFile={() => downloadAssets({})}
                label="Exportar inventario (CSV)"
                variant="secondary"
              />

            </div>
          </div>
        </ReportCard>

        <ReportCard
          title="Traslados"
          description="Consulta el historial de cambios de área y quién registró cada movimiento."
          icon={<ArrowLeftRight size={20} aria-hidden="true" />}
        >
          <div className="mb-4 flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
            <CalendarDays size={15} aria-hidden="true" />
            Filtra por rango de fechas
          </div>

          <RangeReportContent download={downloadMovements} />
        </ReportCard>

        <ReportCard
          title="Mantenimientos"
          description="Exporta las intervenciones registradas, sus fechas y sus observaciones."
          icon={<Wrench size={20} aria-hidden="true" />}
        >
          <div className="mb-4 flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
            <CalendarDays size={15} aria-hidden="true" />
            Filtro aplicado a la fecha de inicio
          </div>

          <RangeReportContent download={downloadMaintenance} />
        </ReportCard>
      </div>
    </section>
  );
}

function RangeReportContent({
  download,
}: {
  download: (range: DateRange) => ReturnType<typeof downloadMovements>;
}) {
  const [desde, setDesde] = useState("");
  const [hasta, setHasta] = useState("");

  const invalid = Boolean(desde && hasta && desde > hasta);

  return (
    <div className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-2">
        <FormField label="Desde (opcional)">
          <input
            type="date"
            className={controlClass}
            value={desde}
            max={hasta || undefined}
            aria-invalid={invalid || undefined}
            onChange={(event) => setDesde(event.target.value)}
          />
        </FormField>

        <FormField label="Hasta (opcional)">
          <input
            type="date"
            className={controlClass}
            value={hasta}
            min={desde || undefined}
            aria-invalid={invalid || undefined}
            onChange={(event) => setHasta(event.target.value)}
          />
        </FormField>
      </div>

      {invalid && (
        <Alert>La fecha inicial no puede ser posterior a la fecha final.</Alert>
      )}

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-xs text-slate-500 dark:text-slate-400">
          {!desde && !hasta
            ? "Se exportará todo el historial."
            : "Se aplicará el rango de fechas seleccionado."}
        </p>

        <ExportButton
          disabled={invalid}
          fetchFile={() =>
            download({
              desde: desde || undefined,
              hasta: hasta || undefined,
            })
          }
        />
      </div>
    </div>
  );
}
