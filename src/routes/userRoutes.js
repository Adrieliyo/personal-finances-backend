import express from "express";
import { UserController } from "../controllers/userController.js";

const router = express.Router();

router.post("/", UserController.createUser);
router.get("/activate-account/:token", UserController.activateAccount);
router.get("/", UserController.getAllUsers);
router.get("/:id", UserController.getUserById);
router.put("/:id", UserController.updateUser);
router.delete("/:id", UserController.deleteUser);
router.patch("/:id/status", UserController.changeStatus);

export default router;
