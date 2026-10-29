import type { Knex } from "knex";
import db from "../../database/knex.js";
// TYPES - USER
import type {
  CreateUserData,
  PublicUser,
  UpdateAccountResult,
  UpdateUserData,
  UserAuthState,
  UserCredentials,
  UserRole,
} from "./users.types.js";

export class UsersRepository {
  private selectCredentials() {
    return db("usuarios as u")
      .innerJoin("personas as p", "p.id", "u.persona_id")
      .select({
        id: "u.id",
        personaId: "u.persona_id",
        username: "u.username",
        passwordHash: "u.password",
        rol: "u.rol",
        activo: "u.activo",
        tokenVersion: "u.token_version",
        nombres: "p.nombres",
        apellidos: "p.apellidos",
      });
  }

  private mapCredentials(row: Record<string, unknown>): UserCredentials {
    return {
      id: Number(row.id),
      personaId: Number(row.personaId),
      username: String(row.username),
      passwordHash: String(row.passwordHash),
      rol: row.rol as UserRole,
      activo: Boolean(row.activo),
      tokenVersion: Number(row.tokenVersion),
      nombres: String(row.nombres),
      apellidos: String(row.apellidos),
    };
  }

  async findCredentialsByUsername(
    username: string,
  ): Promise<UserCredentials | null> {
    const row = await this.selectCredentials()
      .where("u.username", username)
      .first();
    return row ? this.mapCredentials(row) : null;
  }

  async findCredentialsById(id: number): Promise<UserCredentials | null> {
    const row = await this.selectCredentials().where("u.id", id).first();
    return row ? this.mapCredentials(row) : null;
  }

  /** Consulta liviana que corre en cada petición autenticada. */
  async findAuthState(id: number): Promise<UserAuthState | null> {
    const row = await db("usuarios")
      .select({
        id: "id",
        username: "username",
        rol: "rol",
        activo: "activo",
        tokenVersion: "token_version",
      })
      .where({ id })
      .first();

    if (!row) return null;

    return {
      id: Number(row.id),
      username: String(row.username),
      rol: row.rol as UserRole,
      activo: Boolean(row.activo),
      tokenVersion: Number(row.tokenVersion),
    };
  }

  private selectPublic(conn: Knex | Knex.Transaction = db) {
    return conn("usuarios as u")
      .innerJoin("personas as p", "p.id", "u.persona_id")
      .select({
        id: "u.id",
        personaId: "u.persona_id",
        username: "u.username",
        rol: "u.rol",
        activo: "u.activo",
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
      activo: Boolean(row.activo),
      nombres: String(row.nombres),
      apellidos: String(row.apellidos),
      email: String(row.email),
    };
  }

  async findAll(): Promise<PublicUser[]> {
    const rows = await this.selectPublic().orderBy("u.id", "asc");
    return rows.map((row) => this.mapPublic(row));
  }

  async findPublicById(id: number): Promise<PublicUser | null> {
    const row = await this.selectPublic().where("u.id", id).first();
    return row ? this.mapPublic(row) : null;
  }

  async usernameExists(username: string): Promise<boolean> {
    return Boolean(
      await db("usuarios").select("id").where({ username }).first(),
    );
  }

  async personHasUser(personaId: number): Promise<boolean> {
    return Boolean(
      await db("usuarios")
        .select("id")
        .where({ persona_id: personaId })
        .first(),
    );
  }

  /** @throws Errores del driver (`ER_DUP_ENTRY` por username o persona) se propagan sin envolver. */
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

  /**
   * Guarda el nuevo hash e incrementa `token_version`, lo que invalida los
   * tokens vigentes. Devuelve la versión nueva, o `null` si la cuenta no existe.
   */
  async updatePassword(
    id: number,
    passwordHash: string,
  ): Promise<number | null> {
    return db.transaction(async (trx) => {
      const updated = await trx("usuarios")
        .where({ id })
        .update({
          password: passwordHash,
          token_version: trx.raw("token_version + 1"),
        });

      if (!updated) return null;

      const row = await trx("usuarios")
        .select("token_version")
        .where({ id })
        .first();
      return Number(row?.token_version ?? 0);
    });
  }

  /**
   * Cambia rol y/o estado de una cuenta dentro de una transacción.
   * Bloquea a los admins activos para que dos cambios simultáneos no dejen
   * el sistema sin administradores.
   */
  async updateAccount(
    id: number,
    changes: UpdateUserData,
    actorId: number,
  ): Promise<UpdateAccountResult> {
    return db.transaction<UpdateAccountResult>(async (trx) => {
      const admins = await trx("usuarios")
        .select("id")
        .where({ rol: "admin", activo: true })
        .forUpdate();

      const target = await trx("usuarios")
        .select("id", "rol", "activo")
        .where({ id })
        .forUpdate()
        .first();

      if (!target) return { status: "not_found" };

      const nextRol = changes.rol ?? (target.rol as UserRole);
      const nextActivo = changes.activo ?? Boolean(target.activo);

      if (id === actorId && (nextRol !== "admin" || !nextActivo)) {
        return { status: "self_change" };
      }

      const wasActiveAdmin = target.rol === "admin" && Boolean(target.activo);
      const staysActiveAdmin = nextRol === "admin" && nextActivo;

      if (wasActiveAdmin && !staysActiveAdmin && admins.length <= 1) {
        return { status: "last_admin" };
      }

      const update: Record<string, unknown> = {};
      if (changes.rol !== undefined) update.rol = changes.rol;
      if (changes.activo !== undefined) update.activo = changes.activo;
      // Al desactivar, los tokens vigentes de esa cuenta dejan de valer aunque se reactive después.
      if (changes.activo === false)
        update.token_version = trx.raw("token_version + 1");

      if (Object.keys(update).length > 0) {
        await trx("usuarios").where({ id }).update(update);
      }

      const row = await this.selectPublic(trx).where("u.id", id).first();
      if (!row) throw new Error("No se pudo recuperar el usuario actualizado");

      return { status: "ok", user: this.mapPublic(row) };
    });
  }
}

export const usersRepository = new UsersRepository();
