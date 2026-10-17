import bcrypt from "bcrypt";
import db from "../../database/knex.js";
// Manejo de Errores
import { ConflictError, NotFoundError } from "../../shared/errors/AppError.js";
// Clase
import { usersRepository } from "./users.repository.js";
/**
 * Clase que contendra la logica de los metodos parael CRUD
 * de la tabla Usuarios, que sera utilizado en su controlador
 */
export class UsersService {
    async list() {
        return usersRepository.findAll();
    }
    async getById(id) {
        const user = await usersRepository.findPublicById(id);
        if (!user) {
            throw new NotFoundError("El usuario no existe");
        }
        return user;
    }
    async create(input) {
        const personExists = await usersRepository.personExists(input.personaId);
        if (!personExists) {
            throw new NotFoundError("La persona indicada no existe");
        }
        const personAlreadyHasUser = await usersRepository.personHasUser(input.personaId);
        if (personAlreadyHasUser) {
            throw new ConflictError("Esta persona ya tiene una cuenta de usuario");
        }
        const usernameExists = await usersRepository.usernameExists(input.username);
        if (usernameExists) {
            throw new ConflictError("El nombre de usuario ya está registrado");
        }
        const passwordHash = await bcrypt.hash(input.password, 12);
        return usersRepository.create({
            personaId: input.personaId,
            username: input.username,
            passwordHash,
            rol: input.rol,
        });
    }
}
export const usersService = new UsersService();
//# sourceMappingURL=users.service.js.map