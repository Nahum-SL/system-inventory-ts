/**
 * Type para el Autenticador de usuario
 */
export interface AuthenticatedUser {
  id: number;
  personaId: number;
  username: string;
  rol: "admin" | "usuario";
  nombres: string;
  apellidos: string;
}

/**
 * Type para la respuesta del login
 */

export interface LoginResponse {
  accessToken: string;
  tokenType: "Bearer";
  expiresIn: number;
  user: AuthenticatedUser;
}

/**
 * Type para autenticar la identidad y rol del usuario
 */
export interface AuthenticatedIdentity {
  id: number;
  username: string;
  rol: "admin" | "usuario";
}