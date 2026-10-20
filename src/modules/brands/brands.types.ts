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
