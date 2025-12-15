import express from "express";
import { DebtController } from "../controllers/debtController.js";
import { authRequired } from "../middlewares/authRequired.js";

const router = express.Router();

// Todas las rutas requieren autenticación
router.use(authRequired);

// Rutas de deudas
router.get("/", DebtController.getUserDebts);
router.post("/", DebtController.createDebt);
router.get("/summary", DebtController.getDebtsSummary);
router.get("/:id", DebtController.getDebtById);
router.put("/:id", DebtController.updateDebt);
router.delete("/:id", DebtController.deleteDebt);
router.post("/:id/payment", DebtController.makePayment);

export default router;
