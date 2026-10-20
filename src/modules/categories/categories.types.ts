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

export interface CategoryRow {
  id: number;
  nombre: string;
  fechaRegistro: string;
}