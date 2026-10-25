// REPOSITORY
import { reportsRepository } from "./reports.repository.js";
// TYPEs
import type { DashboardSummary } from "./reports.types.js";

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
}

export const reportsService = new ReportsService();
