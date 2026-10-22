export interface User {
  id: number;
  username: string;
  rol: "admin" | "usuario";
  nombres: string;
  apellidos: string;
}