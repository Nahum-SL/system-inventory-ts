import db from "../../database/knex.js";

// Se manejara solo 2 roles
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

/**
 * Repositorio para acceder a los datos de los usuarios en la base de datos.
 *  */ 
export class UsersRepository {
  async findCredentialsByUsername(
    username: string,
  ): Promise<UserCredentials | null> {

    const row = await db("usuarios as u")
      .innerJoin("personas as p", "p.id", "u.persona_id")
      .select({
        id: "u.id",
        personaId: "u.persona_id",
        username: "u.username",
        passwordHash: "u.password",
        rol: "u.rol",
        nombres: "p.nombres",
        apellidos: "p.apellidos",
      })
      .where("u.username", username)
      .first();

    if (!row) {
      return null;
    }

    return {
      id: Number(row.id),
      personaId: Number(row.personaId),
      username: String(row.username),
      passwordHash: String(row.passwordHash),
      rol: row.rol as UserRole,
      nombres: String(row.nombres),
      apellidos: String(row.apellidos),
    };
  }
}

export const usersRepository = new UsersRepository();
