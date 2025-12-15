import express from "express";
import { GoalController } from "../controllers/goalController.js";
import { authRequired } from "../middlewares/authRequired.js";

const router = express.Router();

// Todas las rutas requieren autenticación
router.use(authRequired);

// Rutas de metas
router.get("/", GoalController.getUserGoals);
router.post("/", GoalController.createGoal);
router.get("/summary", GoalController.getGoalsSummary);
router.get("/:id", GoalController.getGoalById);
router.put("/:id", GoalController.updateGoal);
router.delete("/:id", GoalController.deleteGoal);
router.post("/:id/add-funds", GoalController.addFunds);
router.post("/:id/withdraw-funds", GoalController.withdrawFunds);

export default router;
