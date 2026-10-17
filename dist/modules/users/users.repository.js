import db from "../../database/knex.js";
/**
 * Repositorio para acceder a los datos de los usuarios en la base de datos.
 *  */
export class UsersRepository {
    async findCredentialsByUsername(username) {
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
            rol: row.rol,
            nombres: String(row.nombres),
            apellidos: String(row.apellidos),
        };
    }
}
export const usersRepository = new UsersRepository();
//# sourceMappingURL=users.repository.js.map