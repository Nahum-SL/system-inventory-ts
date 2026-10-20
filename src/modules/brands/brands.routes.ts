import { Router } from "express";
// Middlewares
import { authenticate } from "../../shared/middlewares/auth.middleware.js";
import { authorize } from "../../shared/middlewares/authorize.middleware.js";
import { validate } from "../../shared/middlewares/validate.middleware.js";
// Schema
import { createBrandSchema, updateBrandSchema } from "./brands.schema.js";
// Controlador
import {
  listBrands,
  getBrandById,
  createBrand,
  updateBrand,
} from "./brands.controller.js";

const brandsRoutes = Router();

brandsRoutes.use(authenticate);

// Lectura: cualquier usuario autenticado.
brandsRoutes.get("/", listBrands);
brandsRoutes.get("/:id", getBrandById);

// Escritura: solo administradores.
brandsRoutes.post("/", authorize("admin"), validate(createBrandSchema), createBrand);

brandsRoutes.patch(
  "/:id",
  authorize("admin"),
  validate(updateBrandSchema),
  updateBrand,
);

export default brandsRoutes;
