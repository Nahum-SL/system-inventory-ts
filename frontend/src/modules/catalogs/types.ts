export interface Area {
  id: number;
  nombre: string;
}

export interface Person {
  id: number;
  apellidos: string;
  nombres: string;
  numerodoc: string;
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
