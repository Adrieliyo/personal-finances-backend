import { BudgetService } from "../services/budgetService.js";
import { getLocalTime } from "../utils/dateFormatter.js";

export const BudgetController = {
  async createBudget(req, res) {
    try {
      const userId = req.user.id;
      const budget = await BudgetService.createBudget(userId, req.body);

      console.log(
        `[${getLocalTime()}] Budget created: ${budget.amount_limit} (${
          budget.period
        }) for user: ${userId}`
      );

      res.status(201).json({
        success: true,
        data: budget,
        message: "Budget created successfully",
      });
    } catch (error) {
      console.error(
        `[${getLocalTime()}] Error creating budget:`,
        error.message
      );
      res.status(400).json({
        success: false,
        error: error.message,
      });
    }
  },

  async getUserBudgets(req, res) {
    try {
      const userId = req.user.id;
      const { period } = req.query; // ?period=monthly o ?period=weekly

      const budgets = await BudgetService.getUserBudgets(userId, period);

      console.log(
        `[${getLocalTime()}] Fetched ${budgets.length} budgets${
          period ? ` (${period})` : ""
        } for user: ${userId}`
      );

      res.status(200).json({
        success: true,
        data: budgets,
        count: budgets.length,
      });
    } catch (error) {
      console.error(
        `[${getLocalTime()}] Error fetching budgets:`,
        error.message
      );
      res.status(500).json({
        success: false,
        error: error.message,
      });
    }
  },

  async getBudgetById(req, res) {
    try {
      const budget = await BudgetService.getBudgetById(req.params.id);

      res.status(200).json({
        success: true,
        data: budget,
      });
    } catch (error) {
      console.error(
        `[${getLocalTime()}] Error fetching budget:`,
        error.message
      );
      res.status(404).json({
        success: false,
        error: error.message,
      });
    }
  },

  async updateBudget(req, res) {
    try {
      const userId = req.user.id;
      const budget = await BudgetService.updateBudget(
        req.params.id,
        userId,
        req.body
      );

      console.log(`[${getLocalTime()}] Budget updated: ${req.params.id}`);

      res.status(200).json({
        success: true,
        data: budget,
        message: "Budget updated successfully",
      });
    } catch (error) {
      console.error(
        `[${getLocalTime()}] Error updating budget:`,
        error.message
      );

      const statusCode = error.message.includes("permission") ? 403 : 400;

      res.status(statusCode).json({
        success: false,
        error: error.message,
      });
    }
  },

  async deleteBudget(req, res) {
    try {
      const userId = req.user.id;
      await BudgetService.deleteBudget(req.params.id, userId);

      console.log(`[${getLocalTime()}] Budget deleted: ${req.params.id}`);

      res.status(200).json({
        success: true,
        message: "Budget deleted successfully",
      });
    } catch (error) {
      console.error(
        `[${getLocalTime()}] Error deleting budget:`,
        error.message
      );

      const statusCode = error.message.includes("permission") ? 403 : 400;

      res.status(statusCode).json({
        success: false,
        error: error.message,
      });
    }
  },

  async getBudgetsSummary(req, res) {
    try {
      const userId = req.user.id;
      const summary = await BudgetService.getBudgetsSummary(userId);

      res.status(200).json({
        success: true,
        data: summary,
      });
    } catch (error) {
      console.error(
        `[${getLocalTime()}] Error getting budgets summary:`,
        error.message
      );
      res.status(500).json({
        success: false,
        error: error.message,
      });
    }
  },
};
