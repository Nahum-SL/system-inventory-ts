import { Router } from "express";
// Middlewares
import { authenticate } from "../../shared/middlewares/auth.middleware.js";
import { authorize } from "../../shared/middlewares/authorize.middleware.js";
import { validate } from "../../shared/middlewares/validate.middleware.js";
// Schema
import {
  createCategorySchema,
  updateCategorySchema,
} from "./categories.schema.js";
// Controlador
import {
  listCategories,
  getCategoryById,
  createCategory,
  updateCategory,
} from "./categories.controller.js";

const categoriesRoutes = Router();

categoriesRoutes.use(authenticate);

// Endpoints
categoriesRoutes.get("/", listCategories);
categoriesRoutes.get("/:id", getCategoryById);

categoriesRoutes.post(
  "/",
  authorize("admin"),
  validate(createCategorySchema),
  createCategory,
);

categoriesRoutes.patch(
  "/:id",
  authorize("admin"),
  validate(updateCategorySchema),
  updateCategory,
);

export default categoriesRoutes;
