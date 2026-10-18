// Manejo de errores
import { ConflictError, NotFoundError } from "../../shared/errors/AppError.js";
// Assets Types
import type {
  Asset,
  AssetFilters,
} from "./assets.types.js";
// Assets Repositorio
import { assetsRepository } from "./assets.repository.js";
// Valida que todos los campos sean validos
import type { CreateAssetInput } from "./assets.schema.js";

/**
 * Tendra la responsabilidad de ejecutar el GET - CREATE de la parte de Activos
 */
export class AssetsService {
  /**
   * Lista todos los activos, usando el assetsRepository para el manejo de la logica
   * @param filters 
   * @returns 
   */
    async list(filters: AssetFilters = {}): Promise<Asset[]> {
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
  async getById(id: number): Promise<Asset> {
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
  async create(input: CreateAssetInput): Promise<Asset> {
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

    const codeExists = await assetsRepository.codeExists(
      input.codigoInventario,
    );

    if (codeExists) {
      throw new ConflictError("El código de inventario ya está registrado");
    }

    return assetsRepository.create(input);
  }
}

export const assetsService = new AssetsService();
