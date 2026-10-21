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
  fechaFin: string;
  condicionDevolucion: string;
}

export type CreateAssignmentResult =
  | { status: "ok"; assignment: Assignment }
  | { status: "asset_not_found" }
  | { status: "asset_not_operational"; estado: string }
  | { status: "already_assigned" };

export type ReturnAssignmentResult =
  | { status: "ok"; assignment: Assignment }
  | { status: "not_found" }
  | { status: "already_returned" }
  | { status: "invalid_dates" };
