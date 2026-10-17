import db from "../../database/knex.js";

// Types

import type { UserCredentials,CreateUserData, PublicUser } from "./users.types.ts";
import type { UserRole } from "./users.types.ts";
/**
 * Repositorio para acceder a los datos de los usuarios en la base de datos.
 *  */
export class UsersRepository {
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
   * Busqueda en general para Usuarios, devolviendo los datos de la persona 
   * menos su password (hasheada), de forma ascendente /
   * lista las cuentas y sus datos personales.
   */  
  async findAll(): Promise<PublicUser[]> {
    const rows = await db("usuarios as u")
      .innerJoin("personas as p", "p.id", "u.persona_id")
      .select({
        id: "u.id",
        personaId: "u.persona_id",
        username: "u.username",
        rol: "u.rol",
        nombres: "p.nombres",
        apellidos: "p.apellidos",
        email: "p.email",
      })
      .orderBy("u.id", "asc");

    return rows.map((row) => ({
      id: Number(row.id),
      personaId: Number(row.personaId),
      username: String(row.username),
      rol: row.rol as UserRole,
      nombres: String(row.nombres),
      apellidos: String(row.apellidos),
      email: String(row.email),
    }));
  }

  /**
   * Consulta una cuenta sin exponer la contraseña
   * @param id 
   */
  async findPublicById(id: number): Promise<PublicUser | null> {
    
    // Instancia los datos en la variable row (Filas)
    const row = await db("usuarios as u")
      .innerJoin("personas as p", "p.id", "u.persona_id")
      .select({
        id: "u.id",
        personaId: "u.persona_id",
        username: "u.username",
        rol: "u.rol",
        nombres: "p.nombres",
        apellidos: "p.apellidos",
        email: "p.email",
      })
      .where("u.id", id)
      .first();

    // Si las filas estan vacias, retorna un vacio
    if (!row) return null;

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
   * Permite detectar nombres de usuario duplicados.
   * @param username 
   * @returns 
   */
  async usernameExists(username: string): Promise<boolean> {
    const row = await db("usuarios").select("id").where({ username }).first();

    return Boolean(row);
  }

  /**
   * crea una cuenta y devuelve únicamente sus datos públicos.
   * @param data 
   * @returns 
   */
  async create(data: CreateUserData): Promise<PublicUser> {
    // Consulta SQL - INSERTAR
    await db("usuarios").insert({
      persona_id: data.personaId,
      username: data.username,
      password: data.passwordHash,
      rol: data.rol,
    });

    // Trae los datos de la persona nueva registrada
    const user = await db("usuarios")
      .select("id")
      .where({ username: data.username })
      .first();

    // Si no se encuentra lanza un mensaje de error
    if (!user) {
      throw new Error("No se pudo recuperar el usuario creado");
    }

    // Usando el metodo findPublicById recupera el id del usuario creado
    const createdUser = await this.findPublicById(Number(user.id));

    // Si no se encuentra lanza un error
    if (!createdUser) {
      throw new Error("No se pudieron recuperar los datos del usuario creado");
    }

    return createdUser;
  }
}

export const usersRepository = new UsersRepository();
