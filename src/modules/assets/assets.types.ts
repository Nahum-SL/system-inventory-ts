export type AssetStatus = "operativo" | "mantenimiento" | "fuera_de_servicio";

export type ManualAssetStatus = "operativo" | "fuera_de_servicio";

export type ChangeStatusResult =
  | { status: "ok" }
  | { status: "not_found" }
  | { status: "in_maintenance" };

export type DecommissionResult =
  | { status: "ok" }
  | { status: "not_found" }
  | { status: "in_maintenance" }
  | { status: "has_open_assignment" };
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
  motivoEliminacion: string | null;
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

// Manejo con el QR
export interface AssetCurrentAssignment {
  id: number;
  personaId: number;
  personaNombre: string;
  cargoId: number;
  cargoNombre: string;
  fechaInicio: string;
}

export interface AssetOpenMaintenance {
  id: number;
  tipo: "preventivo" | "correctivo";
  fecha: string;
  descripcion: string;
}

/** Derivada de `asignaciones`; no se guarda. */
export type AssetAvailability = "disponible" | "asignado";

/** Ficha que se muestra al escanear el QR. */
export interface AssetCard extends Asset {
  disponibilidad: AssetAvailability;
  asignacionActual: AssetCurrentAssignment | null;
  mantenimientoAbierto: AssetOpenMaintenance | null;
}