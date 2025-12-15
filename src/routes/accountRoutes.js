import express from "express";
import { AccountController } from "../controllers/accountController.js";
import { authRequired } from "../middlewares/authRequired.js";

const router = express.Router();

// Todas las rutas requieren autenticación
router.use(authRequired);

router.post("/", AccountController.createAccount);
router.get("/", AccountController.getUserAccounts);
router.get("/balance", AccountController.getTotalBalance);
router.get("/:id", AccountController.getAccountById);
router.put("/:id", AccountController.updateAccount);
router.delete("/:id", AccountController.deleteAccount);

export default router;
