export type AssetStatus = "activo" | "inactivo" | "mantenimiento";

export interface AssetFilters {
  q?: string;
  estado?: AssetStatus;
  areaId?: number;
}

export interface Asset {
  id: number;
  marcaId: number;
  marcaNombre: string;
  categoriaId: number;
  categoriaNombre: string;
  areaId: number;
  areaNombre: string;
  codigoInventario: string;
  fechaIngreso: string;
  descripcion: string;
  estado: AssetStatus;
  fechaRegistro: string;
  eliminado: boolean;
  fechaEliminacion: string | null;
}

export interface CreateAssetData {
  marcaId: number;
  categoriaId: number;
  areaId: number;
  codigoInventario: string;
  fechaIngreso: string;
  descripcion: string;
  estado: AssetStatus;
}

export interface UpdateAssetData {
  marcaId?: number;
  categoriaId?: number;
  fechaIngreso?: string;
  descripcion?: string;
}