export type AssetStatus = "operativo" | "mantenimiento" | "fuera_de_servicio";

export interface User {
  id: number;
  username: string;
  rol: "admin" | "usuario";
  nombres: string;
  apellidos: string;
}

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

export interface ListResponse<T> {
  status: "success";
  results: number;
  data: T[];
}

export interface ItemResponse<T> {
  status: "success";
  data: T;
}
