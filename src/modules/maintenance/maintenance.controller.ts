// Types
import type { RequestHandler } from "express";
// Servicio
import { maintenanceService } from "./maintenance.service.js";

/**
 * Crea el mantenimiento recibiendo los siguiente parametros
 * @param req 
 * @param res 
 * @param next 
 * @returns 
 */
export const createMaintenance: RequestHandler = async (req, res, next) => {
  try {
    const activoId = Number(req.params.id);

    if (!Number.isSafeInteger(activoId) || activoId <= 0) {
      res.status(400).json({
        status: "error",
        message: "El ID del activo no es válido",
      });
      return;
    }

    const maintenance = await maintenanceService.create(activoId, req.body);

    res.status(201).json({
      status: "success",
      data: maintenance,
    });
  } catch (error) {
    next(error);
  }
};

// Obtiene el historial de manrenimiento
export const getMaintenanceHistory: RequestHandler = async (req, res, next) => {
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
};
