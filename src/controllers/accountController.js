import { AccountService } from "../services/accountService.js";
import { getLocalTime } from "../utils/dateFormatter.js";

export const AccountController = {
  async createAccount(req, res) {
    try {
      const userId = req.user.id; // Obtenido del middleware authRequired
      const account = await AccountService.createAccount(userId, req.body);

      console.log(`[${getLocalTime()}] Account created for user: ${userId}`);

      res.status(201).json({
        success: true,
        data: account,
        message: "Account created successfully",
      });
    } catch (error) {
      console.error(
        `[${getLocalTime()}] Error creating account:`,
        error.message
      );
      res.status(400).json({
        success: false,
        error: error.message,
      });
    }
  },

  async getUserAccounts(req, res) {
    try {
      const userId = req.user.id;
      const accounts = await AccountService.getUserAccounts(userId);

      console.log(
        `[${getLocalTime()}] Fetched ${
          accounts.length
        } accounts for user: ${userId}`
      );

      res.status(200).json({
        success: true,
        data: accounts,
        count: accounts.length,
      });
    } catch (error) {
      console.error(
        `[${getLocalTime()}] Error fetching accounts:`,
        error.message
      );
      res.status(500).json({
        success: false,
        error: error.message,
      });
    }
  },

  async getAccountById(req, res) {
    try {
      const account = await AccountService.getAccountById(req.params.id);

      res.status(200).json({
        success: true,
        data: account,
      });
    } catch (error) {
      console.error(
        `[${getLocalTime()}] Error fetching account:`,
        error.message
      );
      res.status(404).json({
        success: false,
        error: error.message,
      });
    }
  },

  async updateAccount(req, res) {
    try {
      const account = await AccountService.updateAccount(
        req.params.id,
        req.body
      );

      console.log(`[${getLocalTime()}] Account updated: ${req.params.id}`);

      res.status(200).json({
        success: true,
        data: account,
        message: "Account updated successfully",
      });
    } catch (error) {
      console.error(
        `[${getLocalTime()}] Error updating account:`,
        error.message
      );
      res.status(400).json({
        success: false,
        error: error.message,
      });
    }
  },

  async deleteAccount(req, res) {
    try {
      await AccountService.deleteAccount(req.params.id);

      console.log(`[${getLocalTime()}] Account deleted: ${req.params.id}`);

      res.status(200).json({
        success: true,
        message: "Account deleted successfully",
      });
    } catch (error) {
      console.error(
        `[${getLocalTime()}] Error deleting account:`,
        error.message
      );
      res.status(400).json({
        success: false,
        error: error.message,
      });
    }
  },

  async getTotalBalance(req, res) {
    try {
      const userId = req.user.id;
      const totals = await AccountService.getTotalBalance(userId);

      res.status(200).json({
        success: true,
        data: totals,
      });
    } catch (error) {
      console.error(
        `[${getLocalTime()}] Error calculating balance:`,
        error.message
      );
      res.status(500).json({
        success: false,
        error: error.message,
      });
    }
  },
};
