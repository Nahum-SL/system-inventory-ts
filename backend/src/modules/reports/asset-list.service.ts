import sharp from "sharp";

import { imageStorage } from "../../shared/storage/image-storage.js";
import { assetsRepository } from "../assets/assets.repository.js";
import type { AssetFilters, AssetStatus } from "../assets/assets.types.js";

import { renderAssetList } from "./pdf/list/asset-list.render.js";
import type { AssetListData } from "./pdf/list/asset-list.types.js";
import { formatNowLima } from "./pdf/sheet/asset-sheet.helper.js";
import type { SheetImage } from "./pdf/sheet/asset-sheet.types.js";
import { YONDA_LOGO } from "./pdf/yonda-logo.js";

const STATUS_LABELS: Record<AssetStatus, string> = {
  operativo: "Operativo",
  mantenimiento: "En mantenimiento",
  fuera_de_servicio: "Fuera de servicio",
};

const todayLima = (): string =>
  new Date().toLocaleDateString("en-CA", { timeZone: "America/Lima" });

/** Miniatura pequeña: el listado no necesita la foto completa y el PDF pesa poco. */
async function loadThumb(fileName: string | null): Promise<SheetImage | null> {
  if (!fileName) return null;
  try {
    const bytes = await sharp(imageStorage.pathOf(fileName))
      .resize(160, 160, { fit: "inside", withoutEnlargement: true })
      .flatten({ background: "#ffffff" })
      .jpeg({ quality: 70 })
      .toBuffer();
    return { format: "jpg", bytes };
  } catch {
    return null;
  }
}

/** Procesa `items` con a lo sumo `limit` tareas a la vez (no satura memoria ni disco). */
async function mapLimit<T, R>(
  items: readonly T[],
  limit: number,
  fn: (item: T) => Promise<R>,
): Promise<R[]> {
  const out = new Array<R>(items.length);
  let next = 0;
  await Promise.all(
    Array.from({ length: Math.min(limit, items.length) }, async () => {
      while (next < items.length) {
        const i = next++;
        out[i] = await fn(items[i] as T);
      }
    }),
  );
  return out;
}

export const assetListService = {
  async build(
    filters: AssetFilters,
    incluirBajas: boolean,
    generadoPor: string,
  ) {
    const assets = await assetsRepository.findAllForReport(filters, {
      includeDeleted: incluirBajas,
    });

    const bajasIncluidas =
      incluirBajas && !filters.estado && !filters.asignacion;

    const filtros: string[] = [];
    if (filters.q?.trim()) filtros.push(`Búsqueda: "${filters.q.trim()}"`);
    if (filters.estado)
      filtros.push(`Estado: ${STATUS_LABELS[filters.estado]}`);
    if (filters.areaId !== undefined) {
      filtros.push(`Área: ${assets[0]?.areaNombre ?? `N.º ${filters.areaId}`}`);
    }
    if (filters.asignacion) {
      filtros.push(
        filters.asignacion === "asignado" ? "Solo asignados" : "Solo libres",
      );
    }
    filtros.push(
      `Dados de baja: ${bajasIncluidas ? "incluidos" : "no incluidos"}`,
    );

    const fotos = await mapLimit(assets, 8, (a) => loadThumb(a.imagenArchivo));

    const data: AssetListData = {
      generadoEn: formatNowLima(),
      generadoPor,
      filtros,
      activos: assets.map((a, i) => ({
        codigoInventario: a.codigoInventario,
        descripcion: a.descripcion ?? "",
        marcaNombre: a.marcaNombre,
        categoriaNombre: a.categoriaNombre,
        areaNombre: a.areaNombre,
        estado: a.estado,
        eliminado: a.eliminado,
        foto: fotos[i] ?? null,
      })),
      logo: YONDA_LOGO,
    };

    return {
      pdf: await renderAssetList(data),
      fileName: `listado-activos_${todayLima()}.pdf`,
    };
  },
};
