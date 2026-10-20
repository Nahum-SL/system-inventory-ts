// Servicio
import { positionsService } from "./positions.service.js";
// Utils
import { asyncHandler } from "../../shared/utils/asyncHandler.js";
import { parseId } from "../../shared/utils/parseId.js";

/** Lista todos los cargos con el nombre de su área. Responde 200 con `results` y `data`. */
export const listPositions = asyncHandler(async (_req, res) => {
  const positions = await positionsService.list();

  res.status(200).json({
    status: "success",
    results: positions.length,
    data: positions,
  });
});

/**
 * Obtiene un cargo por id.
 * Responde 200, 400 si el id no es válido o 404 si no existe.
 */
export const getPositionById = asyncHandler(async (req, res) => {
  const position = await positionsService.getById(
    parseId(req.params.id, "del cargo"),
  );

  res.status(200).json({
    status: "success",
    data: position,
  });
});

/**
 * Crea un cargo. El body llega ya validado por `validate`.
 * Responde 201, 404 si el área no existe o 409 si el nombre ya existe en el área.
 */
export const createPosition = asyncHandler(async (req, res) => {
  const position = await positionsService.create(req.body);

  res.status(201).json({
    status: "success",
    message: "Cargo creado correctamente",
    data: position,
  });
});

/**
 * Actualiza un cargo (nombre y/o área). El body llega ya validado por `validate`.
 * Responde 200, 400 si el id no es válido, 404 si el cargo o el área no existen,
 * o 409 si el resultado duplica un cargo del área.
 */
export const updatePosition = asyncHandler(async (req, res) => {
  const position = await positionsService.update(
    parseId(req.params.id, "del cargo"),
    req.body,
  );

  res.status(200).json({
    status: "success",
    message: "Cargo actualizado correctamente",
    data: position,
  });
});
