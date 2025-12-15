import { UserService } from "../services/userService.js";
import { getLocalTime } from "../utils/dateFormatter.js";

export const UserController = {
  async getAllUsers(req, res) {
    try {
      const users = await UserService.getAllUsers();
      res.status(200).json({
        success: true,
        data: users,
        count: users.length,
      });
    } catch (error) {
      console.error(`[${getLocalTime()}] Error fetching users:`, error.message);
      res.status(500).json({
        success: false,
        error: error.message,
      });
    }
  },

  async getUserById(req, res) {
    try {
      const user = await UserService.getUserById(req.params.id);
      res.status(200).json({
        success: true,
        data: user,
      });
    } catch (error) {
      console.error(`[${getLocalTime()}] Error fetching user:`, error.message);
      res.status(404).json({
        success: false,
        error: error.message,
      });
    }
  },

  async updateUser(req, res) {
    try {
      const user = await UserService.updateUser(req.params.id, req.body);
      console.log(`[${getLocalTime()}] User updated: ${req.params.id}`);
      res.status(200).json({
        success: true,
        data: user,
        message: "User updated successfully",
      });
    } catch (error) {
      console.error(`[${getLocalTime()}] Error updating user:`, error.message);
      res.status(400).json({
        success: false,
        error: error.message,
      });
    }
  },

  async deleteUser(req, res) {
    try {
      await UserService.deleteUser(req.params.id);
      console.log(`[${getLocalTime()}] User deleted: ${req.params.id}`);
      res.status(200).json({
        success: true,
        message: "User deleted successfully",
      });
    } catch (error) {
      console.error(`[${getLocalTime()}] Error deleting user:`, error.message);
      res.status(400).json({
        success: false,
        error: error.message,
      });
    }
  },

  async changeStatus(req, res) {
    try {
      const { status } = req.body;
      const user = await UserService.changeUserStatus(req.params.id, status);
      res.status(200).json({
        success: true,
        data: user,
        message: "Status updated successfully",
      });
    } catch (error) {
      console.error(
        `[${getLocalTime()}] Error changing status:`,
        error.message
      );
      res.status(400).json({
        success: false,
        error: error.message,
      });
    }
  },
};
