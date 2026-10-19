// Servicio
import { movementsService } from "./movements.service.js";
/**
 * Recibe la peticion HTTP, invoca el servicio Create de movementsService
 * @param req
 * @param res
 * @param next
 * @returns
 */
export const createMovement = async (req, res, next) => {
    try {
        const activoId = Number(req.params.id);
        const usuarioId = req.auth?.id;
        if (!Number.isSafeInteger(activoId) || activoId <= 0) {
            res.status(400).json({
                status: "error",
                message: "El ID del activo no es válido",
            });
            return;
        }
        if (!usuarioId) {
            res.status(401).json({
                status: "error",
                message: "Debes autenticarte primero",
            });
            return;
        }
        const movement = await movementsService.create(activoId, usuarioId, req.body);
        res.status(201).json({
            status: "success",
            message: "Movimiento registrado correctamente",
            data: movement,
        });
    }
    catch (error) {
        next(error);
    }
};
/**
 * Recibe la peticion HTTP, invoca el servicio getHistory() del servicio
 * @param req
 * @param res
 * @param next
 * @returns
 */
export const getMovementHistory = async (req, res, next) => {
    try {
        const activoId = Number(req.params.id);
        if (!Number.isSafeInteger(activoId) || activoId <= 0) {
            res.status(400).json({
                status: "error",
                message: "El ID del activo no es válido",
            });
            return;
        }
        const history = await movementsService.getHistory(activoId);
        res.status(200).json({
            status: "success",
            results: history.length,
            data: history,
        });
    }
    catch (error) {
        next(error);
    }
};
//# sourceMappingURL=movements.controller.js.map