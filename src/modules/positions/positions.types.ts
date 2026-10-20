// Estos tipos separan los datos que devuelve la base de datos 
// de los datos que recibimos al crear o actualizar

export interface Position {
  id: number;
  areaId: number;
  areaNombre: string;
  nombre: string;
}

export interface CreatePositionData {
  areaId: number;
  nombre: string;
}

export interface UpdatePositionData {
  areaId?: number;
  nombre?: string;
}

/**
 * Fila tal como la devuelve la consulta base (con alias camelCase).
 * Tipado simplificado: `mapRow` coerciona los valores igualmente.
 */
export interface PositionRow {
  id: number;
  areaId: number;
  areaNombre: string;
  nombre: string;
}
