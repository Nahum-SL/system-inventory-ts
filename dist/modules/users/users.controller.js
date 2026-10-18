import { usersService } from "./users.service.js";
/**
 * Lista a los usuarios
 */
export const listUsers = async (_req, res, next) => {
    try {
        const users = await usersService.list();
        res.status(200).json({
            status: "success",
            data: users,
        });
    }
    catch (error) {
        next(error);
    }
};
/**
 * Obtiene al usuario por ID
 */
export const getUserById = async (req, res, next) => {
    try {
        const id = Number(req.params.id);
        if (!Number.isSafeInteger(id) || id <= 0) {
            res.status(400).json({
                status: "error",
                message: "El ID del usuario no es válido",
            });
            return;
        }
        const user = await usersService.getById(id);
        res.status(200).json({
            status: "success",
            data: user,
        });
    }
    catch (error) {
        next(error);
    }
};
/**
 * Crea un nuevo usuario
 */
export const createUser = async (req, res, next) => {
    try {
        const user = await usersService.create(req.body);
        res.status(201).json({
            status: "success",
            message: "Usuario creado correctamente",
            data: user,
        });
    }
    catch (error) {
        next(error);
    }
};
//# sourceMappingURL=users.controller.js.map