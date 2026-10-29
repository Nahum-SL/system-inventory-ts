import { assetsRepository } from "../assets/assets.repository.js";
import type {
  Asset,
  AssetFilters,
  AssetStatus,
} from "../assets/assets.types.js";
import { toCsv } from "../../shared/utils/csv.js";
// REPOSITORY
import { reportsRepository } from "./reports.repository.js";
// TYPEs
import type {
  CsvFile,
  DashboardSummary,
  ExportRange,
} from "./reports.types.js";

const STATUS_LABELS: Record<AssetStatus, string> = {
  operativo: "Operativo",
  mantenimiento: "En mantenimiento",
  fuera_de_servicio: "Fuera de servicio",
};

const TYPE_LABELS: Record<string, string> = {
  preventivo: "Preventivo",
  correctivo: "Correctivo",
};

/** Fecha de hoy en Lima (`YYYY-MM-DD`), independiente de la zona del servidor. */
const todayLima = (): string =>
  new Date().toLocaleDateString("en-CA", { timeZone: "America/Lima" });

export class ReportsService {
  /** Resumen del inventario para el dashboard, calculado en la base de datos. */
  async getSummary(): Promise<DashboardSummary> {
    const [totals, byArea, byCategory, recentMovements] = await Promise.all([
      reportsRepository.getTotals(),
      reportsRepository.countByArea(),
      reportsRepository.countByCategory(),
      reportsRepository.findRecentMovements(),
    ]);

    return { totals, byArea, byCategory, recentMovements };
  }
  /** Activos con los mismos filtros de la lista, más su responsable actual. */
  async exportAssets(filters: AssetFilters): Promise<CsvFile> {
    const [assets, assignments] = await Promise.all([
      assetsRepository.findAll(filters),
      reportsRepository.findOpenAssignments(),
    ]);

    const content = toCsv<Asset>(
      [
        { header: "Código", value: (a) => a.codigoInventario },
        { header: "Descripción", value: (a) => a.descripcion },
        { header: "Marca", value: (a) => a.marcaNombre },
        { header: "Categoría", value: (a) => a.categoriaNombre },
        { header: "Área", value: (a) => a.areaNombre },
        { header: "Estado", value: (a) => STATUS_LABELS[a.estado] },
        { header: "Fecha de ingreso", value: (a) => a.fechaIngreso },
        {
          header: "Responsable",
          value: (a) => assignments.get(a.id)?.responsable,
        },
        { header: "Cargo", value: (a) => assignments.get(a.id)?.cargo },
        {
          header: "Asignado desde",
          value: (a) => assignments.get(a.id)?.desde,
        },
      ],
      assets,
    );

    return { filename: `activos_${todayLima()}.csv`, content };
  }

  async exportMovements(range: ExportRange): Promise<CsvFile> {
    const rows = await reportsRepository.findMovementsForExport(range);

    const content = toCsv(
      [
        { header: "Fecha y hora", value: (r) => r.fecha },
        { header: "Código", value: (r) => r.codigo },
        { header: "Descripción", value: (r) => r.descripcion },
        { header: "Área de origen", value: (r) => r.origen },
        { header: "Área de destino", value: (r) => r.destino },
        { header: "Registrado por", value: (r) => r.usuario },
        { header: "Motivo", value: (r) => r.motivo },
      ],
      rows,
    );

    return { filename: `movimientos_${todayLima()}.csv`, content };
  }

  async exportMaintenance(range: ExportRange): Promise<CsvFile> {
    const rows = await reportsRepository.findMaintenanceForExport(range);

    const content = toCsv(
      [
        { header: "Código", value: (r) => r.codigo },
        { header: "Activo", value: (r) => r.descripcion },
        { header: "Tipo", value: (r) => TYPE_LABELS[r.tipo] ?? r.tipo },
        { header: "Fecha de inicio", value: (r) => r.fecha },
        { header: "Fecha de fin", value: (r) => r.fechaFin },
        { header: "Descripción", value: (r) => r.detalle },
        { header: "Observaciones", value: (r) => r.observaciones },
      ],
      rows,
    );

    return { filename: `mantenimientos_${todayLima()}.csv`, content };
  }
}

export const reportsService = new ReportsService();
