import { useState, type ReactNode } from "react";
import Alert from "@/shared/components/ui/Alert";
import FormField from "@/shared/components/ui/form/FormField";
import { controlClass } from "@/shared/components/ui/Buttons/style.button";
import {
  downloadAssets,
  downloadMaintenance,
  downloadMovements,
} from "../api/export.api";
import ExportButton from "../components/ExportButton";
import type { DateRange } from "../types";

function ReportCard({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: ReactNode;
}) {
  return (
    <section className="space-y-3 rounded-lg border border-slate-200 bg-white p-4">
      <div>
        <h2 className="font-semibold">{title}</h2>
        <p className="text-sm text-slate-500">{description}</p>
      </div>
      {children}
    </section>
  );
}

function RangeReport({
  title,
  description,
  download,
}: {
  title: string;
  description: string;
  download: (range: DateRange) => ReturnType<typeof downloadMovements>;
}) {
  const [desde, setDesde] = useState("");
  const [hasta, setHasta] = useState("");
  const invalid = Boolean(desde && hasta && desde > hasta);

  return (
    <ReportCard title={title} description={description}>
      <div className="grid gap-3 sm:grid-cols-2">
        <FormField label="Desde (opcional)">
          <input
            type="date"
            className={controlClass}
            value={desde}
            onChange={(e) => setDesde(e.target.value)}
          />
        </FormField>
        <FormField label="Hasta (opcional)">
          <input
            type="date"
            className={controlClass}
            value={hasta}
            onChange={(e) => setHasta(e.target.value)}
          />
        </FormField>
      </div>

      {invalid && (
        <Alert>La fecha "desde" no puede ser posterior a "hasta".</Alert>
      )}

      <ExportButton
        disabled={invalid}
        fetchFile={() =>
          download({ desde: desde || undefined, hasta: hasta || undefined })
        }
      />
    </ReportCard>
  );
}

export default function ReportsPage() {
  return (
    <section className="space-y-4">
      <h1 className="text-xl font-semibold">Reportes</h1>

      <Alert tone="info">
        Los archivos contienen datos personales (nombres de responsables y
        usuarios). Guárdalos solo donde corresponda.
      </Alert>

      <ReportCard
        title="Inventario de activos"
        description="Todos los activos con su responsable actual. Para exportar solo una parte, usa «Exportar lista» en Activos con los filtros aplicados."
      >
        <ExportButton
          fetchFile={() => downloadAssets({})}
          label="Exportar todo (CSV)"
        />
      </ReportCard>

      <RangeReport
        title="Traslados"
        description="Historial de cambios de área, con quién los registró. Sin fechas, exporta todo."
        download={downloadMovements}
      />

      <RangeReport
        title="Mantenimientos"
        description="Intervenciones con fecha de inicio y fin, observaciones y costo. Se filtra por la fecha de inicio."
        download={downloadMaintenance}
      />
    </section>
  );
}
