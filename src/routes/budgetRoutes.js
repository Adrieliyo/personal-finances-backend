import express from "express";
import { BudgetController } from "../controllers/budgetController.js";
import { authRequired } from "../middlewares/authRequired.js";

const router = express.Router();

// Todas las rutas requieren autenticación
router.use(authRequired);

// Rutas de presupuestos
router.get("/", BudgetController.getUserBudgets);
router.post("/", BudgetController.createBudget);
router.get("/summary", BudgetController.getBudgetsSummary);
router.get("/:id", BudgetController.getBudgetById);
router.put("/:id", BudgetController.updateBudget);
router.delete("/:id", BudgetController.deleteBudget);

export default router;
