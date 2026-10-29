import { ConflictError, NotFoundError } from "../../shared/errors/AppError.js";
import { brandsRepository } from "./brands.repository.js";
import type { Brand } from "./brands.types.js";
import type { CreateBrandInput, UpdateBrandInput } from "./brands.schema.js";

const DUPLICATE_BRAND_MESSAGE = "Ya existe una marca con ese nombre";

/**
 * Indica si un error de la base de datos es una violación de restricción única.
 * - PostgreSQL: código `23505`.
 * - MySQL: código `ER_DUP_ENTRY`.
 */
function isUniqueViolation(error: unknown): boolean {
  const code = (error as { code?: string } | null)?.code;
  return code === "23505" || code === "ER_DUP_ENTRY";
}

/**
 * Lógica de negocio de las marcas.
 *
 * Aplica las reglas (nombres únicos sin distinguir mayúsculas, errores 404/409)
 * y delega el acceso a datos en `BrandsRepository`.
 */
export class BrandsService {
  /**
   * Lista todas las marcas ordenadas alfabéticamente por nombre.
   * @returns Arreglo de marcas (vacío si no hay ninguna).
   */
  async list(): Promise<Brand[]> {
    return brandsRepository.findAll();
  }

  /**
   * Obtiene una marca por su id.
   * @param id Identificador de la marca.
   * @returns La marca encontrada.
   * @throws NotFoundError si la marca no existe.
   */
  async getById(id: number): Promise<Brand> {
    const brand = await brandsRepository.findById(id);

    if (!brand) {
      throw new NotFoundError("La marca no existe");
    }

    return brand;
  }

  /**
   * Crea una marca nueva.
   * El nombre debe ser único sin distinguir mayúsculas/minúsculas
   * ("Nike" y "nike" se consideran el mismo nombre).
   *
   * @param input Datos validados de la marca.
   * @returns La marca creada.
   * @throws ConflictError si ya existe una marca con ese nombre, ya sea
   *   detectado por la consulta previa o por el índice único de la base de datos.
   */
  async create(input: CreateBrandInput): Promise<Brand> {
    const nombre = input.nombre.trim();

    const existing = await brandsRepository.findByName(nombre);

    if (existing) {
      throw new ConflictError(DUPLICATE_BRAND_MESSAGE);
    }

    try {
      return await brandsRepository.create({ nombre });
    } catch (error) {
      // Otra petición pudo insertar el mismo nombre entre la consulta y el insert.
      if (isUniqueViolation(error)) {
        throw new ConflictError(DUPLICATE_BRAND_MESSAGE);
      }
      throw error;
    }
  }

  /**
   * Actualiza una marca existente.
   * Solo se escribe el nombre si cambió respecto al actual. Cambiar solo las
   * mayúsculas ("nike" -> "Nike") cuenta como un cambio válido.
   * Si no hay nada que cambiar, devuelve la marca sin modificarla.
   *
   * @param id Id de la marca a actualizar.
   * @param input Campos a modificar, ya validados.
   * @returns La marca actualizada.
   * @throws NotFoundError si la marca no existe.
   * @throws ConflictError si el nuevo nombre ya lo usa otra marca.
   */
  async update(id: number, input: UpdateBrandInput): Promise<Brand> {
    const current = await this.getById(id);
    const nombre = input.nombre?.trim();

    if (nombre !== undefined) {
      // Se excluye la propia marca para que no se detecte como duplicada de sí misma.
      const existing = await brandsRepository.findByName(nombre, id);

      if (existing) {
        throw new ConflictError(DUPLICATE_BRAND_MESSAGE);
      }
    }

    let updated: Brand | null;

    try {
      updated = await brandsRepository.update(id, {
        ...(nombre !== undefined && nombre !== current.nombre
          ? { nombre }
          : {}),
      });
    } catch (error) {
      if (isUniqueViolation(error)) {
        throw new ConflictError(DUPLICATE_BRAND_MESSAGE);
      }
      throw error;
    }

    // Puede ser null si la marca se eliminó entre la lectura y la actualización.
    if (!updated) {
      throw new NotFoundError("La marca no existe");
    }

    return updated;
  }
}

export const brandsService = new BrandsService();
