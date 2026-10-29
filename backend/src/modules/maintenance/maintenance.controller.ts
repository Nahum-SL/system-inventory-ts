// utils
import { asyncHandler } from "../../shared/utils/asyncHandler.js";
import { parseId } from "../../shared/utils/parseId.js";
// Servicioz
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

// Obtiene el historial de manrenimiento
export const getMaintenanceHistory = asyncHandler(async (req, res, next) => {
  try {
    const activoId = Number(req.params.id);

    if (!Number.isSafeInteger(activoId) || activoId <= 0) {
      res.status(400).json({
        status: "error",
        message: "El ID del activo no es válido",
      });
      return;
    }

    const history = await maintenanceService.getHistory(activoId);

    res.status(200).json({
      status: "success",
      results: history.length,
      data: history,
    });
  } catch (error) {
    next(error);
  }
});
