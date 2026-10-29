// Servicio
import { areasService } from "./areas.service.js";
// Utils
import { asyncHandler } from "../../shared/utils/asyncHandler.js";
import { parseId } from "../../shared/utils/parseId.js";

export const listAreas = asyncHandler(async (_req, res) => {
  const areas = await areasService.list();

  res.status(200).json({
    status: "success",
    results: areas.length,
    data: areas,
  });
});

export const getAreaById = asyncHandler(async (req, res) => {
  const area = await areasService.getById(parseId(req.params.id, "del area"));

  res.status(200).json({ status: "success", data: area });
});

export const createArea = asyncHandler(async (req, res) => {
  const area = await areasService.create(req.body);

  res.status(201).json({
    status: "success",
    message: "Área creada correctamente",
    data: area,
  });
});

export const updateArea = asyncHandler(async (req, res) => {
  const area = await areasService.update(parseId(req.params.id, "del area"), req.body);

  res.status(200).json({
    status: "success",
    message: "Área actualizada correctamente",
    data: area,
  });
});
