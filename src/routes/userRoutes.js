import express from "express";
import { UserController } from "../controllers/userController.js";
import { authRequired } from "../middlewares/authRequired.js";

const router = express.Router();

// router.post("/register", UserController.createUser);
// router.get("/activate-account/:token", UserController.activateAccount);
router.get("/profile", authRequired, UserController.getProfile);
router.get("/", authRequired, UserController.getAllUsers);
router.get("/:id", authRequired, UserController.getUserById);
router.put("/:id", authRequired, UserController.updateUser);
router.delete("/:id", authRequired, UserController.deleteUser);
router.patch("/:id/status", authRequired, UserController.changeStatus);

export default router;
