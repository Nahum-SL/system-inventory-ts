import type { RequestHandler } from "express";
// Servicio - Asignamientos
import { assignmentsService } from "./assignments.service.js";

/**
 * Recibe la peticion HTTP, invoca el servicio Create de assignmentsService
 * @param req 
 * @param res 
 * @param next 
 * @returns 
 */
export const createAssignment: RequestHandler = async (req, res, next) => {
  try {
    const activoId = Number(req.params.id);

    if (!Number.isSafeInteger(activoId) || activoId <= 0) {
      res.status(400).json({
        status: "error",
        message: "El ID del activo no es válido",
      });
      return;
    }

    const assignment = await assignmentsService.create(activoId, req.body);

    res.status(201).json({
      status: "success",
      data: assignment,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Recibe la peticion HTTP, invoca el servicio de listar de assignmentsService
 * @param req 
 * @param res 
 * @param next 
 * @returns 
 */
export const getAssignmentHistory: RequestHandler = async (req, res, next) => {
  try {
    const activoId = Number(req.params.id);

    if (!Number.isSafeInteger(activoId) || activoId <= 0) {
      res.status(400).json({
        status: "error",
        message: "El ID del activo no es válido",
      });
      return;
    }

    const history = await assignmentsService.getHistory(activoId);

    res.status(200).json({
      status: "success",
      results: history.length,
      data: history,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Recibe la peticion HTTP, invoca el servicio obtener un registro por ID de movementsService
 * @param req 
 * @param res 
 * @param next 
 * @returns 
 */
export const returnAssignment: RequestHandler = async (req, res, next) => {
  try {
    const assignmentId = Number(req.params.id);

    if (!Number.isSafeInteger(assignmentId) || assignmentId <= 0) {
      res.status(400).json({
        status: "error",
        message: "El ID de la asignación no es válido",
      });
      return;
    }

    const assignment = await assignmentsService.returnAssignment(
      assignmentId,
      req.body,
    );

    res.status(200).json({
      status: "success",
      data: assignment,
    });
  } catch (error) {
    next(error);
  }
};
