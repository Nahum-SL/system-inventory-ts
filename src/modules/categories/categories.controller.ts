// Servicio
import { categoriesService } from "./categories.service.js";
// Utils
import { asyncHandler } from "../../shared/utils/asyncHandler.js";
import { parseId } from "../../shared/utils/parseId.js";

/** Lista todas las categorías. Responde 200 con `results` y `data`. 
*/
export const listCategories = asyncHandler(async (_req, res) => {
  const categories = await categoriesService.list();

  res.status(200).json({
    status: "success",
    results: categories.length,
    data: categories,
  });
});

/**
 * Obtiene una categoría por id.
 * Responde 200, 400 si el id no es válido o 404 si no existe.
 */
export const getCategoryById = asyncHandler(async (req, res) => {
  const category = await categoriesService.getById(
    parseId(req.params.id, "de la categoría"),
  );

  res.status(200).json({
    status: "success",
    data: category,
  });
});

/**
 * Crea una categoría. El body llega ya validado por `validate`.
 * Responde 201, o 409 si el nombre ya existe.
 */
export const createCategory = asyncHandler(async (req, res) => {
  const category = await categoriesService.create(req.body);

  res.status(201).json({
    status: "success",
    message: "Categoría creada correctamente",
    data: category,
  });
});

/**
 * Actualiza una categoría. El body llega ya validado por `validate`.
 * Responde 200, 400 si el id no es válido, 404 si no existe o 409 si el
 * nombre ya pertenece a otra categoría.
 */
export const updateCategory = asyncHandler(async (req, res) => {
  const category = await categoriesService.update(
    parseId(req.params.id, "de la categoría"),
    req.body,
  );

  res.status(200).json({
    status: "success",
    message: "Categoría actualizada correctamente",
    data: category,
  });
});
