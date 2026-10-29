import { Router } from "express";
// CONTROLLER
import {
  createPerson,
  updatePerson,
  getPersonById,
  listPeople,
} from "./people.controller.js";
// SCHEMA
import { createPersonSchema, updatePersonSchema } from "./people.schema.js";
// MIDDLEWARES
import { authenticate } from "../../shared/middlewares/auth.middleware.js";
import { authorize } from "../../shared/middlewares/authorize.middleware.js";
import { validate } from "../../shared/middlewares/validate.middleware.js";

const peopleRoutes = Router();

peopleRoutes.use(authenticate);

// Consultar personas.
peopleRoutes.get("/", listPeople);
peopleRoutes.get("/:id", getPersonById);

// Registrar personas: solo administradores.
peopleRoutes.post(
  "/",
  authorize("admin"),
  validate(createPersonSchema),
  createPerson,
);
// Actualiza personas: solo administradores
peopleRoutes.patch(
  "/:id",
  authorize("admin"),
  validate(updatePersonSchema),
  updatePerson,
);

export default peopleRoutes;
