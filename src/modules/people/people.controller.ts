import type { RequestHandler } from "express";
// SERVICIO
import { peopleService } from "./people.service.js";

/**
 * Recibe la peticion HTTP, invoca el servicio Listar de peopleService
 * @param req 
 * @param res 
 * @param next 
 */
export const listPeople: RequestHandler = async (req, res, next) => {
  try {
    const q = typeof req.query.q === "string" ? req.query.q : undefined;

    const people = await peopleService.list(q);

    res.status(200).json({
      status: "success",
      results: people.length,
      data: people,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Recibe la peticion HTTP, invoca el servicio de obtener la Persona por ID de peopleService
 */
export const getPersonById: RequestHandler = async (req, res, next) => {
  try {
    const id = Number(req.params.id);

    if (!Number.isSafeInteger(id) || id <= 0) {
      res.status(400).json({
        status: "error",
        message: "El ID de la persona no es válido",
      });
      return;
    }

    const person = await peopleService.getById(id);

    res.status(200).json({
      status: "success",
      data: person,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Recibe la peticion HTTP, invoca el servicio Create de peopleService
 * @param req 
 * @param res 
 * @param next 
 */
export const createPerson: RequestHandler = async (req, res, next) => {
  try {
    const person = await peopleService.create(req.body);

    res.status(201).json({
      status: "success",
      data: person,
    });
  } catch (error) {
    next(error);
  }
};
