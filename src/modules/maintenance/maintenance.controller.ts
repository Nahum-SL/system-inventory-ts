// utils
import { asyncHandler } from "../../shared/utils/asyncHandler.js";
import { parseId } from "../../shared/utils/parseId.js";
// Servicio
import { maintenanceService } from "./maintenance.service.js";

export const createMaintenance = asyncHandler(async (req, res) => {
  const maintenance = await maintenanceService.create(
    parseId(req.params.id, "del activo"),
    req.body,
  );

  res.status(201).json({
    status: "success",
    message: "Mantenimiento registrado correctamente",
    data: maintenance,
  });
});

export const closeMaintenance = asyncHandler(async (req, res) => {
  const maintenance = await maintenanceService.close(
    parseId(req.params.id, "del mantenimiento"),
    req.body,
  );

  res.status(200).json({
    status: "success",
    message: "Mantenimiento cerrado correctamente",
    data: maintenance,
  });
});
