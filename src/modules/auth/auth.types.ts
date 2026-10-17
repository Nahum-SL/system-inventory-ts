export interface AuthenticatedUser {
  id: number;
  personaId: number;
  username: string;
  rol: "admin" | "usuario";
  nombres: string;
  apellidos: string;
}

export interface LoginResponse {
  accessToken: string;
  tokenType: "Bearer";
  expiresIn: number;
  user: AuthenticatedUser;
}
