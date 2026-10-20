// Servicio
import { brandsService } from "./brands.service.js";
// Utils
import { asyncHandler } from "../../shared/utils/asyncHandler.js";
import { parseId } from "../../shared/utils/parseId.js";

/**
 * GET /brands
 * Lista todas las marcas ordenadas alfabéticamente por nombre.
 *
 * @returns 200 con `{ status, results, data }`, donde `results` es la
 *   cantidad de marcas y `data` el arreglo (vacío si no hay ninguna).
 */
export const listBrands = asyncHandler(async (_req, res) => {
  const brands = await brandsService.list();

  res.status(200).json({
    status: "success",
    results: brands.length,
    data: brands,
  });
});

/**
 * GET /brands/:id
 * Obtiene una marca por su id.
 *
 * @param req.params.id Id de la marca (se valida con `parseId`).
 * @returns 200 con `{ status, data }`.
 * @throws Error de validación si el id no es válido (lo lanza `parseId`).
 * @throws NotFoundError (404) si la marca no existe.
 */
export const getBrandById = asyncHandler(async (req, res) => {
  const brand = await brandsService.getById(
    parseId(req.params.id, "de la marca"),
  );

  res.status(200).json({
    status: "success",
    data: brand,
  });
});

/**
 * POST /brands
 * Crea una marca nueva.
 *
 * @param req.body Datos de la marca. Debe llegar ya validado por el schema
 *   `createBrandSchema` (middleware de validación en la ruta).
 * @returns 201 con `{ status, message, data }`, donde `data` es la marca creada.
 * @throws ConflictError (409) si ya existe una marca con ese nombre.
 */
export const createBrand = asyncHandler(async (req, res) => {
  const brand = await brandsService.create(req.body);

  res.status(201).json({
    status: "success",
    message: "Marca creada correctamente",
    data: brand,
  });
});

/**
 * PATCH /brands/:id
 * Actualiza parcialmente una marca existente.
 *
 * @param req.params.id Id de la marca (se valida con `parseId`).
 * @param req.body Campos a modificar. Debe llegar ya validado por el schema
 *   `updateBrandSchema` (al menos un campo).
 * @returns 200 con `{ status, message, data }`, donde `data` es la marca actualizada.
 * @throws Error de validación si el id no es válido.
 * @throws NotFoundError (404) si la marca no existe.
 * @throws ConflictError (409) si el nuevo nombre ya lo usa otra marca.
 */
export const updateBrand = asyncHandler(async (req, res) => {
  const brand = await brandsService.update(
    parseId(req.params.id, "de la marca"),
    req.body,
  );

  res.status(200).json({
    status: "success",
    message: "Marca actualizada correctamente",
    data: brand,
  });
});
