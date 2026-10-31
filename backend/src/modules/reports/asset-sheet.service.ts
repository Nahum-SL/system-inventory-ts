import fs from "node:fs/promises";
import sharp from "sharp";

import { NotFoundError } from "../../shared/errors/AppError.js";
import { imageStorage } from "../../shared/storage/image-storage.js";
import { assetsRepository } from "../assets/assets.repository.js";
import { assignmentsRepository } from "../assignments/assignments.repository.js";
import { maintenanceRepository } from "../maintenance/maintenance.repository.js";
import { movementsRepository } from "../movements/movements.repository.js";

// RENDER - ASSET
import { formatDate, formatNowLima } from "./pdf/asset-sheet.helper.js";
import { renderAssetSheet } from "./pdf/asset-sheet.render.js";

import type { AssetSheetData, SheetImage } from "./pdf/asset-sheet.types.js";
import { YONDA_LOGO } from "./pdf/yonda-logo.js";

/** pdf-lib solo incrusta JPG/PNG: la foto (WebP) se convierte a JPEG. */
async function loadPhoto(fileName: string | null): Promise<SheetImage | null> {
  if (!fileName) return null;
  try {
    const raw = await fs.readFile(imageStorage.pathOf(fileName));
    const bytes = await sharp(raw)
      .flatten({ background: "#ffffff" })
      .jpeg({ quality: 85 })
      .toBuffer();
    return { format: "jpg", bytes };
  } catch {
    return null; // sin archivo o ilegible: el PDF muestra "Sin imagen"
  }
}

export const assetSheetService = {
  /**
   * Arma la hoja de vida (PDF) de un activo, incluso si fue dado de baja.
   * No se guarda: se genera en cada descarga.
   * @throws {NotFoundError} Si el código no existe.
   */
  async build(codigo: string, generadoPor: string) {
    const asset = await assetsRepository.findByCode(codigo);
    if (!asset) throw new NotFoundError("No existe un activo con ese código");

    const [
      asignaciones,
      traslados,
      mantenimientos,
      actual,
      abierto,
      imageName,
    ] = await Promise.all([
      assignmentsRepository.findHistoryByAssetId(asset.id),
      movementsRepository.findHistoryByAssetId(asset.id),
      maintenanceRepository.findHistoryByAssetId(asset.id),
      assetsRepository.findCurrentAssignment(asset.id),
      assetsRepository.findOpenMaintenance(asset.id),
      assetsRepository.findImageNameAnyState(asset.id),
    ]);

    const data: AssetSheetData = {
      generadoEn: formatNowLima(),
      generadoPor,
      activo: {
        codigoInventario: asset.codigoInventario,
        descripcion: asset.descripcion ?? "",
        marcaNombre: asset.marcaNombre,
        categoriaNombre: asset.categoriaNombre,
        areaNombre: asset.areaNombre,
        fechaIngreso: formatDate(asset.fechaIngreso),
        estado: asset.estado,
        eliminado: asset.eliminado,
        fechaEliminacion: asset.fechaEliminacion
          ? formatDate(asset.fechaEliminacion)
          : null,
        motivoEliminacion: asset.motivoEliminacion,
      },
      asignacionActual: actual && {
        personaNombre: actual.personaNombre,
        cargoNombre: actual.cargoNombre,
        fechaInicio: formatDate(actual.fechaInicio),
      },
      mantenimientoAbierto: abierto && {
        tipo: abierto.tipo,
        fecha: formatDate(abierto.fecha),
        descripcion: abierto.descripcion,
      },
      asignaciones: (asignaciones ?? []).map((a) => ({
        personaNombre: a.personaNombre,
        cargoNombre: a.cargoNombre,
        fechaInicio: formatDate(a.fechaInicio),
        fechaFin: a.fechaFin ? formatDate(a.fechaFin) : null,
        condicionEntrega: a.condicionEntrega,
        condicionDevolucion: a.condicionDevolucion,
      })),
      traslados: (traslados ?? []).map((m) => ({
        fechaMovimiento: m.fechaMovimiento,
        areaOrigenNombre: m.areaOrigenNombre,
        areaDestinoNombre: m.areaDestinoNombre,
        username: m.username,
        motivo: m.motivo,
      })),
      mantenimientos: (mantenimientos ?? []).map((m) => ({
        tipo: m.tipo,
        fecha: formatDate(m.fecha),
        fechaFin: m.fechaFin ? formatDate(m.fechaFin) : null,
        descripcion: m.descripcion,
        observaciones: m.observaciones,
      })),
      imagen: await loadPhoto(imageName),
      logo: YONDA_LOGO,
    };

    const pdf = await renderAssetSheet(data);
    return { pdf, fileName: `hoja-de-vida-${asset.codigoInventario}.pdf` };
  },
};
