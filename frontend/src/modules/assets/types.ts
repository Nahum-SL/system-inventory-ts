export type AssetStatus = "operativo" | "mantenimiento" | "fuera_de_servicio";

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
}

export interface AssetCard extends Asset {
  disponibilidad: "disponible" | "asignado";
  asignacionActual: {
    id: number;
    personaNombre: string;
    cargoNombre: string;
    fechaInicio: string;
  } | null;
  mantenimientoAbierto: {
    id: number;
    tipo: "preventivo" | "correctivo";
    fecha: string;
    descripcion: string;
  } | null;
}

export interface AssetFilters {
  q?: string;
  estado?: AssetStatus | "";
}

export interface AssignmentRecord {
  id: number;
  personaNombre: string;
  cargoNombre: string;
  fechaInicio: string;
  fechaFin: string | null;
  condicionEntrega: string;
  condicionDevolucion: string | null;
}

// ==================================
// MANTENIMIENTO DEL ASSET / ACTIVO
// ==================================

export interface MaintenanceRecord {
  id: number;
  tipo: "preventivo" | "correctivo";
  fecha: string;
  fechaFin: string | null;
  descripcion: string;
  observaciones: string | null;
  costo: number;
}

// ==================================
// MOVIMIENTO DEL ASSET / ACTIVO
// ==================================

export interface MovementRecord {
  id: number;
  areaOrigenNombre: string | null;
  areaDestinoNombre: string;
  username: string;
  fechaMovimiento: string;
  motivo: string | null;
}
