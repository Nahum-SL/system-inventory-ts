export type AssetStatus = "operativo" | "mantenimiento" | "fuera_de_servicio";

export interface Asset {
  id: number;
  marcaNombre: string;
  categoriaNombre: string;
  areaNombre: string;
  codigoInventario: string;
  fechaIngreso: string;
  descripcion: string;
  estado: AssetStatus;
}

export interface AssetCard extends Asset {
  disponibilidad: "disponible" | "asignado";
  asignacionActual: {
    personaNombre: string;
    cargoNombre: string;
    fechaInicio: string;
  } | null;
  mantenimientoAbierto: {
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

export interface MaintenanceRecord {
  id: number;
  tipo: "preventivo" | "correctivo";
  fecha: string;
  fechaFin: string | null;
  descripcion: string;
  observaciones: string | null;
  costo: number;
}

export interface MovementRecord {
  id: number;
  areaOrigenNombre: string | null;
  areaDestinoNombre: string;
  username: string;
  fechaMovimiento: string;
  motivo: string | null;
}