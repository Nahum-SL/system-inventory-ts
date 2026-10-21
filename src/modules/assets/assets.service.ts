import QRCode from "qrcode";
import { env } from "../../config/env.js";
// Manejo de errores
import {
  ConflictError,
  GoneError,
  NotFoundError,
} from "../../shared/errors/AppError.js";
// Utils
import { withConflictHandling } from "../../shared/utils/withConflictHandling.js";
// REPOSITORIO
import { assetsRepository } from "./assets.repository.js";
// types
import type { Asset, AssetCard, AssetFilters } from "./assets.types.js";
// SCHEMA
import type {
  CreateAssetInput,
  DecommissionAssetInput,
  UpdateAssetInput,
  UpdateAssetStatusInput,
} from "./assets.schema.js";

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

  /**
   * Marca un activo como `operativo` o `fuera_de_servicio`.
   *
   * @throws {NotFoundError} Si el activo no existe o fue dado de baja (404).
   * @throws {ConflictError} Si está en mantenimiento (409).
   */
  async changeStatus(
    id: number,
    input: UpdateAssetStatusInput,
  ): Promise<Asset> {
    const result = await assetsRepository.changeStatus(id, input.estado);

    if (result.status === "not_found") {
      throw new NotFoundError("El activo no existe");
    }

    if (result.status === "in_maintenance") {
      throw new ConflictError(
        "El activo está en mantenimiento; cierra el mantenimiento para cambiar su estado",
      );
    }

    return this.getById(id);
  }

  /**
   * Da de baja lógica un activo, conservando su historial.
   *
   * @throws {NotFoundError} Si no existe o ya estaba dado de baja (404).
   * @throws {ConflictError} Si tiene un mantenimiento o una asignación abiertos (409).
   */
  async decommission(id: number, input: DecommissionAssetInput): Promise<void> {
    const result = await assetsRepository.decommission(id, input.motivo);

    if (result.status === "not_found") {
      throw new NotFoundError("El activo no existe o ya fue dado de baja");
    }

    if (result.status === "in_maintenance") {
      throw new ConflictError(
        "El activo tiene un mantenimiento en curso; ciérralo antes de darlo de baja",
      );
    }

    if (result.status === "has_open_assignment") {
      throw new ConflictError(
        "El activo está asignado; registra su devolución antes de darlo de baja",
      );
    }
  }

  /**
   * Ficha del activo para el QR: datos, asignación actual, mantenimiento abierto
   * y disponibilidad derivada.
   *
   * @throws {NotFoundError} Si no existe un activo con ese código (404).
   * @throws {GoneError} Si fue dado de baja (410), con fecha y motivo en el mensaje.
   */
  async getCardByCode(codigo: string): Promise<AssetCard> {
    const asset = await assetsRepository.findByCode(codigo);

    if (!asset) throw new NotFoundError("No existe un activo con ese código");

    if (asset.eliminado) {
      const fecha = asset.fechaEliminacion?.slice(0, 10) ?? "fecha desconocida";
      const motivo = asset.motivoEliminacion
        ? `. Motivo: ${asset.motivoEliminacion}`
        : "";

      throw new GoneError(`Este activo fue dado de baja el ${fecha}${motivo}`);
    }

    const [asignacionActual, mantenimientoAbierto] = await Promise.all([
      assetsRepository.findCurrentAssignment(asset.id),
      assetsRepository.findOpenMaintenance(asset.id),
    ]);

    return {
      ...asset,
      disponibilidad: asignacionActual ? "asignado" : "disponible",
      asignacionActual,
      mantenimientoAbierto,
    };
  }

  /**
   * Genera el QR (SVG) de un activo. Codifica una URL a la ficha en el frontend:
   * `${PUBLIC_APP_URL}/activos/<codigo>`. No se guarda; se genera al vuelo.
   *
   * @throws {NotFoundError} Si el activo no existe o fue dado de baja (404).
   */
  async getQrSvg(id: number): Promise<string> {
    const asset = await this.getById(id);

    const baseUrl = env.PUBLIC_APP_URL.replace(/\/+$/, "");
    const url = `${baseUrl}/activos/${encodeURIComponent(asset.codigoInventario)}`;

    return QRCode.toString(url, {
      type: "svg",
      errorCorrectionLevel: "M",
      margin: 2,
    });
  }
}

export const assetsService = new AssetsService();
