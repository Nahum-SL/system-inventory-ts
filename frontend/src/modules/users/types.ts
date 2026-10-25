export interface User {
  id: number;
  username: string;
  rol: "admin" | "usuario";
  nombres: string;
  apellidos: string;
}
export type UserRole = "admin" | "usuario";

export interface UserAccount {
  id: number;
  personaId: number;
  username: string;
  rol: UserRole;
  activo: boolean;
  nombres: string;
  apellidos: string;
  email: string;
}
