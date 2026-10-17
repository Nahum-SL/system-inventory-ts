/**
 * Se manejara solo 2 roles
 */
export type UserRole = "admin" | "usuario";

/**
 * Representa las credenciales de un usuario en la base de datos, 4
 * incluyendo su ID, ID de persona asociada, nombre de usuario, hash de contraseña, rol y nombres completos.
*/
export interface UserCredentials {
  id: number;
  personaId: number;
  username: string;
  passwordHash: string;
  rol: UserRole;
  nombres: string;
  apellidos: string;
}

export interface PublicUser {
  id: number;
  personaId: number;
  username: string;
  rol: UserRole;
  nombres: string;
  apellidos: string;
  email: string;
}

export interface CreateUserData {
  personaId: number;
  username: string;
  passwordHash: string;
  rol: UserRole;
}