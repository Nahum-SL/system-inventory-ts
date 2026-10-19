// Manejo de errores
import { ConflictError, NotFoundError } from "../../shared/errors/AppError.js";
// Assets Repositorio
import { assetsRepository } from "./assets.repository.js";
/**
 * Tendra la responsabilidad de ejecutar el GET - CREATE de la parte de Activos
 */
export class AssetsService {
    /**
     * Lista todos los activos, usando el assetsRepository para el manejo de la logica
     * @param filters
     * @returns
     */
    async list(filters = {}) {
        if (filters.areaId !== undefined) {
            const areaExists = await assetsRepository.areaExists(filters.areaId);
            if (!areaExists) {
                throw new NotFoundError("El área indicada no existe");
            }
        }
        return assetsRepository.findAll(filters);
    }
    /**
     * Realiza una busqueda por ID de los activos, usando el assetsRepository
     * para el manejo de la logica
     * @param id
     * @returns
     */
    async getById(id) {
        const asset = await assetsRepository.findById(id);
        if (!asset) {
            throw new NotFoundError("El activo no existe");
        }
        return asset;
    }
    /**
     * Crea nuevos activos, usando el assetsRepository
     * para el manejo de la logica
     * @param id
     * @returns
     */
    async create(input) {
        const [brandExists, categoryExists, areaExists] = await Promise.all([
            assetsRepository.brandExists(input.marcaId),
            assetsRepository.categoryExists(input.categoriaId),
            assetsRepository.areaExists(input.areaId),
        ]);
        if (!brandExists) {
            throw new NotFoundError("La marca indicada no existe");
        }
        if (!categoryExists) {
            throw new NotFoundError("La categoría indicada no existe");
        }
        if (!areaExists) {
            throw new NotFoundError("El área indicada no existe");
        }
        const codeExists = await assetsRepository.codeExists(input.codigoInventario);
        if (codeExists) {
            throw new ConflictError("El código de inventario ya está registrado");
        }
        return assetsRepository.create(input);
    }
    /**
     * Actualiza un Activo
     * @param id
     * @param input
     * @returns
     */
    async update(id, input) {
        await this.getById(id);
        const [brandExists, categoryExists, areaExists] = await Promise.all([
            assetsRepository.brandExists(input.marcaId),
            assetsRepository.categoryExists(input.categoriaId),
            assetsRepository.areaExists(input.areaId),
        ]);
        if (!brandExists) {
            throw new NotFoundError("La marca indicada no existe");
        }
        if (!categoryExists) {
            throw new NotFoundError("La categoría indicada no existe");
        }
        if (!areaExists) {
            throw new NotFoundError("El área indicada no existe");
        }
        const codeExists = await assetsRepository.codeExistsForAnotherAsset(input.codigoInventario, id);
        if (codeExists) {
            throw new ConflictError("El código de inventario ya pertenece a otro activo");
        }
        const updated = await assetsRepository.update(id, input);
        if (!updated) {
            throw new NotFoundError("No se pudo actualizar el activo");
        }
        return updated;
    }
    /**
     * Elmina un registro de Activo
     * @param id
     */
    async delete(id) {
        await this.getById(id);
        const deleted = await assetsRepository.softDelete(id);
        if (!deleted) {
            throw new NotFoundError("No se pudo dar de baja el activo");
        }
    }
}
export const assetsService = new AssetsService();
//# sourceMappingURL=assets.service.js.map