// Manejo de errores
import { ConflictError, NotFoundError } from "../../shared/errors/AppError.js";
// Utils
import { withConflictHandling } from "../../shared/utils/withConflictHandling.js";
// REPOSITORIO
import { assetsRepository } from "./assets.repository.js";
// types
import type { Asset, AssetFilters } from "./assets.types.js";
// SCHEMA
import type { CreateAssetInput, UpdateAssetInput } from "./assets.schema.js";

export class AssetsService {
  /** Lista activos con filtros opcionales (texto, estado, área). */
  async list(filters: AssetFilters = {}): Promise<Asset[]> {
    return assetsRepository.findAll(filters);
  }

  /** @throws {NotFoundError} Si el activo no existe (404). */
  async getById(id: number): Promise<Asset> {
    const asset = await assetsRepository.findById(id);

    if (!asset) {
      throw new NotFoundError("El activo no existe");
    }

    return asset;
  }

  /**
   * Registra un activo verificando marca, categoría, área y unicidad del código.
   * @throws {NotFoundError} Si marca, categoría o área no existen (404).
   * @throws {ConflictError} Si el código ya está registrado (409).
   */
  async create(input: CreateAssetInput): Promise<Asset> {
    await this.assertReferencesExist(input);

    if (await assetsRepository.codeExists(input.codigoInventario)) {
      throw new ConflictError("El código de inventario ya está registrado");
    }

    return withConflictHandling(
      () => assetsRepository.create(input),
      "El código de inventario ya está registrado",
    );
  }

  /**
   * Actualiza los datos descriptivos del activo (marca, categoría, fecha de
   * ingreso, descripción). No modifica código, área ni estado.
   * @throws {NotFoundError} Si el activo, la marca o la categoría no existen (404).
   */
  async update(id: number, input: UpdateAssetInput): Promise<Asset> {
    const current = await this.getById(id);

    await this.assertReferencesExist({
      ...(input.marcaId !== undefined && input.marcaId !== current.marcaId
        ? { marcaId: input.marcaId }
        : {}),
      ...(input.categoriaId !== undefined &&
      input.categoriaId !== current.categoriaId
        ? { categoriaId: input.categoriaId }
        : {}),
    });

    const updated = await assetsRepository.update(id, input);

    if (!updated) {
      throw new NotFoundError("El activo no existe");
    }

    return updated;
  }

  /** Da de baja lógica un activo (conserva su historial). */
  async delete(id: number): Promise<void> {
    await this.getById(id);

    if (!(await assetsRepository.softDelete(id))) {
      throw new NotFoundError("El activo no existe");
    }
  }

  /** Verifica solo las referencias que se le pasan. */
  private async assertReferencesExist(refs: {
    marcaId?: number;
    categoriaId?: number;
    areaId?: number;
  }): Promise<void> {
    const [brand, category, area] = await Promise.all([
      refs.marcaId === undefined || assetsRepository.brandExists(refs.marcaId),
      refs.categoriaId === undefined ||
        assetsRepository.categoryExists(refs.categoriaId),
      refs.areaId === undefined || assetsRepository.areaExists(refs.areaId),
    ]);

    if (!brand) throw new NotFoundError("La marca indicada no existe");
    if (!category) throw new NotFoundError("La categoría indicada no existe");
    if (!area) throw new NotFoundError("El área indicada no existe");
  }
}

export const assetsService = new AssetsService();