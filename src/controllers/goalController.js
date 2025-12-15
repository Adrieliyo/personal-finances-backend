import { GoalService } from "../services/goalService.js";
import { getLocalTime } from "../utils/dateFormatter.js";

export const GoalController = {
  async createGoal(req, res) {
    try {
      const userId = req.user.id;
      const goal = await GoalService.createGoal(userId, req.body);

      console.log(
        `[${getLocalTime()}] Goal created: ${goal.name} ($${
          goal.target_amount
        }) for user: ${userId}`
      );

      res.status(201).json({
        success: true,
        data: goal,
        message: "Goal created successfully",
      });
    } catch (error) {
      console.error(`[${getLocalTime()}] Error creating goal:`, error.message);
      res.status(400).json({
        success: false,
        error: error.message,
      });
    }
  },

  async getUserGoals(req, res) {
    try {
      const userId = req.user.id;
      const { status } = req.query; // ?status=active, ?status=completed, ?status=paused

      const goals = await GoalService.getUserGoals(userId, status);

      console.log(
        `[${getLocalTime()}] Fetched ${goals.length} goals${
          status ? ` (${status})` : ""
        } for user: ${userId}`
      );

      res.status(200).json({
        success: true,
        data: goals,
        count: goals.length,
      });
    } catch (error) {
      console.error(`[${getLocalTime()}] Error fetching goals:`, error.message);
      res.status(500).json({
        success: false,
        error: error.message,
      });
    }
  },

  async getGoalById(req, res) {
    try {
      const goal = await GoalService.getGoalById(req.params.id);

      res.status(200).json({
        success: true,
        data: goal,
      });
    } catch (error) {
      console.error(`[${getLocalTime()}] Error fetching goal:`, error.message);
      res.status(404).json({
        success: false,
        error: error.message,
      });
    }
  },

  async updateGoal(req, res) {
    try {
      const userId = req.user.id;
      const goal = await GoalService.updateGoal(
        req.params.id,
        userId,
        req.body
      );

      console.log(`[${getLocalTime()}] Goal updated: ${req.params.id}`);

      res.status(200).json({
        success: true,
        data: goal,
        message: "Goal updated successfully",
      });
    } catch (error) {
      console.error(`[${getLocalTime()}] Error updating goal:`, error.message);

      const statusCode = error.message.includes("permission") ? 403 : 400;

      res.status(statusCode).json({
        success: false,
        error: error.message,
      });
    }
  },

  async deleteGoal(req, res) {
    try {
      const userId = req.user.id;
      await GoalService.deleteGoal(req.params.id, userId);

      console.log(`[${getLocalTime()}] Goal deleted: ${req.params.id}`);

      res.status(200).json({
        success: true,
        message: "Goal deleted successfully",
      });
    } catch (error) {
      console.error(`[${getLocalTime()}] Error deleting goal:`, error.message);

      const statusCode = error.message.includes("permission") ? 403 : 400;

      res.status(statusCode).json({
        success: false,
        error: error.message,
      });
    }
  },

  async addFunds(req, res) {
    try {
      const userId = req.user.id;
      const { amount } = req.body;

      if (!amount) {
        return res.status(400).json({
          success: false,
          error: "Amount is required",
        });
      }

      const goal = await GoalService.addFunds(req.params.id, userId, amount);

      console.log(
        `[${getLocalTime()}] Added $${amount} to goal: ${req.params.id}`
      );

      res.status(200).json({
        success: true,
        data: goal,
        message: "Funds added successfully",
      });
    } catch (error) {
      console.error(`[${getLocalTime()}] Error adding funds:`, error.message);

      const statusCode = error.message.includes("permission") ? 403 : 400;

      res.status(statusCode).json({
        success: false,
        error: error.message,
      });
    }
  },

  async withdrawFunds(req, res) {
    try {
      const userId = req.user.id;
      const { amount } = req.body;

      if (!amount) {
        return res.status(400).json({
          success: false,
          error: "Amount is required",
        });
      }

      const goal = await GoalService.withdrawFunds(
        req.params.id,
        userId,
        amount
      );

      console.log(
        `[${getLocalTime()}] Withdrew $${amount} from goal: ${req.params.id}`
      );

      res.status(200).json({
        success: true,
        data: goal,
        message: "Funds withdrawn successfully",
      });
    } catch (error) {
      console.error(
        `[${getLocalTime()}] Error withdrawing funds:`,
        error.message
      );

      const statusCode = error.message.includes("permission") ? 403 : 400;

      res.status(statusCode).json({
        success: false,
        error: error.message,
      });
    }
  },

  async getGoalsSummary(req, res) {
    try {
      const userId = req.user.id;
      const summary = await GoalService.getGoalsSummary(userId);

      res.status(200).json({
        success: true,
        data: summary,
      });
    } catch (error) {
      console.error(
        `[${getLocalTime()}] Error getting goals summary:`,
        error.message
      );
      res.status(500).json({
        success: false,
        error: error.message,
      });
    }
  },
};
