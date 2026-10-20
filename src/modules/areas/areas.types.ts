// Estos tipos separan los datos que devuelve la base de datos 
// de los datos que recibimos al crear o actualizar

export interface Area {
  id: number;
  nombre: string;
  fechaRegistro: string;
}

export interface CreateAreaData {
  nombre: string;
}

export interface UpdateAreaData {
  nombre?: string;
}
