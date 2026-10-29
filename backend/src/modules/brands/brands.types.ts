// Estos tipos separan los datos que devuelve la base de datos 
// de los datos que recibimos al crear o actualizar

export interface Brand {
  id: number;
  nombre: string;
  fechaRegistro: string;
}

export interface CreateBrandData {
  nombre: string;
}

export interface UpdateBrandData {
  nombre?: string;
}

/**
 * Fila tal como la devuelve la base de datos.
 * Según el driver, `fechaRegistro` puede llegar como `Date` o como `string`,
 * y `id` como `number` o `string` (por ejemplo con columnas bigint).
 */
export interface BrandRow {
  id: number | string;
  nombre: string;
  fechaRegistro: string | Date;
}
