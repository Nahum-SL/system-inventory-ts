import db from "../../database/knex.js";

// Types
import type {
  UserRole,
  CreateUserData,
  PublicUser,
  UserCredentials,
} from "./users.types.js";

/**
 * Repositorio para acceder a los datos de los usuarios en la base de datos.
 *  */
export class UsersRepository {
  private selectPublic() {
    return db("usuarios as u")
      .innerJoin("personas as p", "p.id", "u.persona_id")
      .select({
        id: "u.id",
        personaId: "u.persona_id",
        username: "u.username",
        rol: "u.rol",
        nombres: "p.nombres",
        apellidos: "p.apellidos",
        email: "p.email",
      });
  }

  private mapPublic(row: Record<string, unknown>): PublicUser {
    return {
      id: Number(row.id),
      personaId: Number(row.personaId),
      username: String(row.username),
      rol: row.rol as UserRole,
      nombres: String(row.nombres),
      apellidos: String(row.apellidos),
      email: String(row.email),
    };
  }
  /**
   * Funcion asyncrona que busca las credenciales del usuario por Nombre de usuario
   * @param username
   * @returns
   */
  async findCredentialsByUsername(
    username: string,
  ): Promise<UserCredentials | null> {
    // Filas que se mostraran segun obtenga al usuario
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

    // Si no existen las filas, entonces retorna un vacio
    if (!row) return null;

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

  /**
   * Permite detectar nombres de usuario duplicados.
   * @param username
   * @returns
   */
  async usernameExists(username: string): Promise<boolean> {
    const row = await db("usuarios").select("id").where({ username }).first();

    return Boolean(row);
  }

  /**
   * Realiza una busqueda por ID de la tabla "personas" (no de usuario), para verificar que existe
   * en la BD, devolviendo un booleano
   * @param personaId
   * @returns
   */
  async personExists(personaId: number): Promise<boolean> {
    const row = await db("personas")
      .select("id")
      .where({ id: personaId })
      .first();

    return Boolean(row);
  }

  /**
   * Realiza una busqueda por ID de la tabla "usuarios" (no de persona), para verificar que existe
   * en la BD, devolviendo un booleano
   * @param personaId
   * @returns
   */
  async personHasUser(personaId: number): Promise<boolean> {
    const row = await db("usuarios")
      .select("id")
      .where({ persona_id: personaId })
      .first();

    return Boolean(row);
  }

  async findAll(): Promise<PublicUser[]> {
    const rows = await this.selectPublic().orderBy("u.id", "asc");
    return rows.map((row) => this.mapPublic(row));
  }

  async findPublicById(id: number): Promise<PublicUser | null> {
    const row = await this.selectPublic().where("u.id", id).first();
    return row ? this.mapPublic(row) : null;
  }

  /**
   * Crea una cuenta y devuelve sus datos públicos.
   * @throws Errores del driver (`ER_DUP_ENTRY` por username o persona) se propagan sin envolver.
   */
  async create(data: CreateUserData): Promise<PublicUser> {
    const [insertedId] = await db("usuarios").insert({
      persona_id: data.personaId,
      username: data.username,
      password: data.passwordHash,
      rol: data.rol,
    });

    const user = await this.findPublicById(Number(insertedId));

    if (!user) throw new Error("No se pudo recuperar el usuario creado");

    return user;
  }
}

export const usersRepository = new UsersRepository();
