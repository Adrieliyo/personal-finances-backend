import express from "express";
import { TransactionController } from "../controllers/transactionController.js";
import { authRequired } from "../middlewares/authRequired.js";

const router = express.Router();

// Todas las rutas requieren autenticación
router.use(authRequired);

// Rutas de transacciones
router.get("/", TransactionController.getUserTransactions);
router.post("/", TransactionController.createTransaction);
router.get("/summary", TransactionController.getTransactionsSummary);
router.get("/by-category", TransactionController.getTransactionsByCategory);
router.get("/recurring", TransactionController.getRecurringTransactions);
router.get("/report/:year/:month", TransactionController.getMonthlyReport);
router.get("/:id", TransactionController.getTransactionById);
router.put("/:id", TransactionController.updateTransaction);
router.delete("/:id", TransactionController.deleteTransaction);

export default router;
