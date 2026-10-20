/**
 * Interfaz de la tabla Persona
 */
export interface Person {
  id: number;
  apellidos: string;
  nombres: string;
  tipodoc: string;
  numerodoc: string;
  telefono: string;
  email: string;
  fechaRegistro: string;
}

/**
 * Interfaz del modulo Persona, para crear un nuevo registro
 */
export interface CreatePersonData {
  apellidos: string;
  nombres: string;
  tipodoc: string;
  numerodoc: string;
  telefono: string;
  email: string;
}

/**
 * Interfaz del modulo Persona, para actualizar un nuevo registro
 */
export interface UpdatePersonData {
  apellidos?: string;
  nombres?: string;
  tipodoc?: string;
  numerodoc?: string;
  telefono?: string;
  email?: string;
}

/**
 * Permite filtrar personas
 */
export interface PersonFilters {
  q?: string;
}
