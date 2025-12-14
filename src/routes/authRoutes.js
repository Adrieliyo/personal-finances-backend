import express from "express";
import { AuthController } from "../controllers/authController.js";
import { authRequired } from "../middlewares/authRequired.js";

const router = express.Router();

router.post("/login", AuthController.signIn);
router.post("/logout", authRequired, AuthController.logout);
router.get("/verify", authRequired, AuthController.verifyToken);

export default router;
