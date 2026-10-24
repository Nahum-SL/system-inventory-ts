export interface User {
  id: number;
  username: string;
  rol: "admin" | "usuario";
  nombres: string;
  apellidos: string;
}

export interface ListResponse<T> {
  status: "success";
  results: number;
  data: T[];
}

export interface ItemResponse<T> {
  status: "success";
  data: T;
}
