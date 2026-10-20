// Estos tipos separan los datos que devuelve la base de datos 
// de los datos que recibimos al crear o actualizar

export interface Category {
  id: number;
  nombre: string;
  fechaRegistro: string;
}

export interface CreateCategoryData {
  nombre: string;
}

export interface UpdateCategoryData {
  nombre?: string;
}

/**
 * Fila tal como la devuelve la base de datos.
 * Según el driver, `fechaRegistro` puede llegar como `Date` o como `string`,
 * y `id` como `number` o `string` (por ejemplo con columnas bigint).
 */
export interface CategoryRow {
  id: number;
  nombre: string;
  fechaRegistro: string;
}