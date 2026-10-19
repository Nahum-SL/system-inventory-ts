// MANEJO DE ERRORES
import { ConflictError, NotFoundError } from "../../shared/errors/AppError.js";
// REPOSITORIO - ACTIVOS
import { assetsRepository } from "../assets/assets.repository.js";
// REPOSITORIO - MOVIMIENTOS
import { movementsRepository } from "./movements.repository.js";
/**
 * Clase que contendra la logica CRUD
 */
export class MovementsService {
    /**
     * Obtiene el historial del movimiento recibiendo el siguiente parametro
     * @param activoId
     * @returns
     */
    async getHistory(activoId) {
        const history = await movementsRepository.findHistoryByAssetId(activoId);
        if (history === null) {
            throw new NotFoundError("El activo no existe");
        }
        return history;
    }
    /**
     * Crea un nuevo movimiento, recibiendo los siguiente parametros
     * @param activoId
     * @param usuarioId
     * @param input
     * @returns
     */
    async create(activoId, usuarioId, input) {
        const asset = await assetsRepository.findById(activoId);
        if (!asset) {
            throw new NotFoundError("El activo no existe o está dado de baja");
        }
        const destinationExists = await assetsRepository.areaExists(input.areaDestinoId);
        if (!destinationExists) {
            throw new NotFoundError("El área de destino no existe");
        }
        if (asset.areaId === input.areaDestinoId) {
            throw new ConflictError("El activo ya se encuentra en esa área");
        }
        const movement = await movementsRepository.create({
            activoId,
            areaDestinoId: input.areaDestinoId,
            usuarioId,
            motivo: input.motivo,
        });
        if (!movement) {
            throw new NotFoundError("No se pudo registrar el movimiento; comprueba que el activo siga disponible");
        }
        return movement;
    }
}
export const movementsService = new MovementsService();
//# sourceMappingURL=movements.service.js.map