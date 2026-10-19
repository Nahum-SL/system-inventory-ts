export interface CreateAssignmentData {
  activoId: number;
  personaId: number;
  cargoId: number;
  fechaInicio: string;
  condicionEntrega: string;
}

export interface Assignment {
  id: number;
  activoId: number;
  codigoInventario: string;
  personaId: number;
  personaNombre: string;
  cargoId: number;
  cargoNombre: string;
  fechaInicio: string;
  fechaFin: string | null;
  condicionEntrega: string;
  condicionDevolucion: string | null;
  informePdf: string | null;
  fechaRegistro: string;
}

export interface ReturnAssignmentData {
  assignmentId: number;
  condicionDevolucion: string;
}
