export type UserRole = "admin" | "usuario";

export interface UserCredentials {
  id: number;
  personaId: number;
  username: string;
  passwordHash: string;
  rol: UserRole;
  activo: boolean;
  tokenVersion: number;
  nombres: string;
  apellidos: string;
}

export interface PublicUser {
  id: number;
  personaId: number;
  username: string;
  rol: UserRole;
  activo: boolean;
  nombres: string;
  apellidos: string;
  email: string;
}

/** Lo mínimo que necesita el middleware para validar una sesión. */
export interface UserAuthState {
  id: number;
  username: string;
  rol: UserRole;
  activo: boolean;
  tokenVersion: number;
}

export interface CreateUserData {
  personaId: number;
  username: string;
  passwordHash: string;
  rol: UserRole;
}

export interface UpdateUserData {
  rol?: UserRole;
  activo?: boolean;
}

export type UpdateAccountResult =
  | { status: "ok"; user: PublicUser }
  | { status: "not_found" }
  | { status: "self_change" }
  | { status: "last_admin" };
