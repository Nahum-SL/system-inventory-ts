import type { SheetAssetStatus, SheetImage } from "../sheet/asset-sheet.types.js";

export interface AssetListItem {
  codigoInventario: string;
  descripcion: string;
  marcaNombre: string;
  categoriaNombre: string;
  areaNombre: string;
  estado: SheetAssetStatus;
  eliminado: boolean;
  /** Miniatura ya reducida (JPG/PNG) o `null`. */
  foto: SheetImage | null;
}

export interface AssetListData {
  generadoEn: string;
  generadoPor: string;
  /** Descripción legible de los filtros aplicados; vacío = sin filtros. */
  filtros: string[];
  /** Ya ordenados por área y luego por código: el renderizador agrupa por área consecutiva. */
  activos: ReadonlyArray<AssetListItem>;
  logo: SheetImage | null;
}
