// TYPES de las tablas
export interface Area {
  id: number;
  nombre: string;
}

export interface Person {
  id: number;
  apellidos: string;
  nombres: string;
  tipodoc: string;
  numerodoc: string;
  telefono: string;
  email: string;
}

export interface Position {
  id: number;
  areaId: number;
  areaNombre: string;
  nombre: string;
}

export interface Brand {
  id: number;
  nombre: string;
}

export interface Category {
  id: number;
  nombre: string;
}

// =============================

export type NamedKind = "areas" | "brands" | "categories";
export interface NamedItem {
  id: number;
  nombre: string;
}

