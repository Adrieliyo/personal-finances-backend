import { DebtService } from "../services/debtService.js";
import { getLocalTime } from "../utils/dateFormatter.js";

export const DebtController = {
  async createDebt(req, res) {
    try {
      const userId = req.user.id;
      const debt = await DebtService.createDebt(userId, req.body);

      console.log(
        `[${getLocalTime()}] Debt created: ${debt.name} ($${
          debt.total_amount
        }) for user: ${userId}`
      );

      res.status(201).json({
        success: true,
        data: debt,
        message: "Debt created successfully",
      });
    } catch (error) {
      console.error(`[${getLocalTime()}] Error creating debt:`, error.message);
      res.status(400).json({
        success: false,
        error: error.message,
      });
    }
  },

  async getUserDebts(req, res) {
    try {
      const userId = req.user.id;
      const debts = await DebtService.getUserDebts(userId);

      console.log(
        `[${getLocalTime()}] Fetched ${debts.length} debts for user: ${userId}`
      );

      res.status(200).json({
        success: true,
        data: debts,
        count: debts.length,
      });
    } catch (error) {
      console.error(`[${getLocalTime()}] Error fetching debts:`, error.message);
      res.status(500).json({
        success: false,
        error: error.message,
      });
    }
  },

  async getDebtById(req, res) {
    try {
      const debt = await DebtService.getDebtById(req.params.id);

      res.status(200).json({
        success: true,
        data: debt,
      });
    } catch (error) {
      console.error(`[${getLocalTime()}] Error fetching debt:`, error.message);
      res.status(404).json({
        success: false,
        error: error.message,
      });
    }
  },

  async updateDebt(req, res) {
    try {
      const userId = req.user.id;
      const debt = await DebtService.updateDebt(
        req.params.id,
        userId,
        req.body
      );

      console.log(`[${getLocalTime()}] Debt updated: ${req.params.id}`);

      res.status(200).json({
        success: true,
        data: debt,
        message: "Debt updated successfully",
      });
    } catch (error) {
      console.error(`[${getLocalTime()}] Error updating debt:`, error.message);

      const statusCode = error.message.includes("permission") ? 403 : 400;

      res.status(statusCode).json({
        success: false,
        error: error.message,
      });
    }
  },

  async deleteDebt(req, res) {
    try {
      const userId = req.user.id;
      await DebtService.deleteDebt(req.params.id, userId);

      console.log(`[${getLocalTime()}] Debt deleted: ${req.params.id}`);

      res.status(200).json({
        success: true,
        message: "Debt deleted successfully",
      });
    } catch (error) {
      console.error(`[${getLocalTime()}] Error deleting debt:`, error.message);

      const statusCode = error.message.includes("permission") ? 403 : 400;

      res.status(statusCode).json({
        success: false,
        error: error.message,
      });
    }
  },

  async makePayment(req, res) {
    try {
      const userId = req.user.id;
      const { payment_amount } = req.body;

      if (!payment_amount) {
        return res.status(400).json({
          success: false,
          error: "Payment amount is required",
        });
      }

      const debt = await DebtService.makePayment(
        req.params.id,
        userId,
        payment_amount
      );

      console.log(
        `[${getLocalTime()}] Payment of $${payment_amount} made to debt: ${
          req.params.id
        }`
      );

      res.status(200).json({
        success: true,
        data: debt,
        message: "Payment registered successfully",
      });
    } catch (error) {
      console.error(`[${getLocalTime()}] Error making payment:`, error.message);

      const statusCode = error.message.includes("permission") ? 403 : 400;

      res.status(statusCode).json({
        success: false,
        error: error.message,
      });
    }
  },

  async getDebtsSummary(req, res) {
    try {
      const userId = req.user.id;
      const summary = await DebtService.getDebtsSummary(userId);

      res.status(200).json({
        success: true,
        data: summary,
      });
    } catch (error) {
      console.error(
        `[${getLocalTime()}] Error getting debts summary:`,
        error.message
      );
      res.status(500).json({
        success: false,
        error: error.message,
      });
    }
  },
};
