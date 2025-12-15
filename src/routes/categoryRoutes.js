import express from "express";
import { CategoryController } from "../controllers/categoryController.js";
import { authRequired } from "../middlewares/authRequired.js";

const router = express.Router();

// Todas las rutas requieren autenticación
router.use(authRequired);

// Rutas de categorías
router.get("/", CategoryController.getUserCategories);
router.post("/", CategoryController.createCategory);
router.get("/stats", CategoryController.getCategoriesStats);
router.get("/:id", CategoryController.getCategoryById);
router.put("/:id", CategoryController.updateCategory);
router.delete("/:id", CategoryController.deleteCategory);

export default router;
