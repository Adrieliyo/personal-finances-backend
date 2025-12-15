import { TransactionService } from "../services/transactionService.js";
import { getLocalTime } from "../utils/dateFormatter.js";

export const TransactionController = {
  async createTransaction(req, res) {
    try {
      const userId = req.user.id;
      const transaction = await TransactionService.createTransaction(
        userId,
        req.body
      );

      console.log(
        `[${getLocalTime()}] Transaction created: ${transaction.type} $${
          transaction.amount
        } for user: ${userId}`
      );

      res.status(201).json({
        success: true,
        data: transaction,
        message: "Transaction created successfully",
      });
    } catch (error) {
      console.error(
        `[${getLocalTime()}] Error creating transaction:`,
        error.message
      );
      res.status(400).json({
        success: false,
        error: error.message,
      });
    }
  },

  async getUserTransactions(req, res) {
    try {
      const userId = req.user.id;
      const filters = {
        type: req.query.type,
        account_id: req.query.account_id,
        category_id: req.query.category_id,
        start_date: req.query.start_date,
        end_date: req.query.end_date,
        is_recurring: req.query.is_recurring,
      };

      const transactions = await TransactionService.getUserTransactions(
        userId,
        filters
      );

      console.log(
        `[${getLocalTime()}] Fetched ${
          transactions.length
        } transactions for user: ${userId}`
      );

      res.status(200).json({
        success: true,
        data: transactions,
        count: transactions.length,
      });
    } catch (error) {
      console.error(
        `[${getLocalTime()}] Error fetching transactions:`,
        error.message
      );
      res.status(500).json({
        success: false,
        error: error.message,
      });
    }
  },

  async getTransactionById(req, res) {
    try {
      const transaction = await TransactionService.getTransactionById(
        req.params.id
      );

      res.status(200).json({
        success: true,
        data: transaction,
      });
    } catch (error) {
      console.error(
        `[${getLocalTime()}] Error fetching transaction:`,
        error.message
      );
      res.status(404).json({
        success: false,
        error: error.message,
      });
    }
  },

  async updateTransaction(req, res) {
    try {
      const userId = req.user.id;
      const transaction = await TransactionService.updateTransaction(
        req.params.id,
        userId,
        req.body
      );

      console.log(`[${getLocalTime()}] Transaction updated: ${req.params.id}`);

      res.status(200).json({
        success: true,
        data: transaction,
        message: "Transaction updated successfully",
      });
    } catch (error) {
      console.error(
        `[${getLocalTime()}] Error updating transaction:`,
        error.message
      );

      const statusCode = error.message.includes("permission") ? 403 : 400;

      res.status(statusCode).json({
        success: false,
        error: error.message,
      });
    }
  },

  async deleteTransaction(req, res) {
    try {
      const userId = req.user.id;
      await TransactionService.deleteTransaction(req.params.id, userId);

      console.log(`[${getLocalTime()}] Transaction deleted: ${req.params.id}`);

      res.status(200).json({
        success: true,
        message: "Transaction deleted successfully",
      });
    } catch (error) {
      console.error(
        `[${getLocalTime()}] Error deleting transaction:`,
        error.message
      );

      const statusCode = error.message.includes("permission") ? 403 : 400;

      res.status(statusCode).json({
        success: false,
        error: error.message,
      });
    }
  },

  async getTransactionsSummary(req, res) {
    try {
      const userId = req.user.id;
      const { start_date, end_date } = req.query;

      const summary = await TransactionService.getTransactionsSummary(
        userId,
        start_date,
        end_date
      );

      res.status(200).json({
        success: true,
        data: summary,
      });
    } catch (error) {
      console.error(
        `[${getLocalTime()}] Error getting transactions summary:`,
        error.message
      );
      res.status(500).json({
        success: false,
        error: error.message,
      });
    }
  },

  async getTransactionsByCategory(req, res) {
    try {
      const userId = req.user.id;
      const { start_date, end_date } = req.query;

      const byCategory = await TransactionService.getTransactionsByCategory(
        userId,
        start_date,
        end_date
      );

      res.status(200).json({
        success: true,
        data: byCategory,
      });
    } catch (error) {
      console.error(
        `[${getLocalTime()}] Error getting transactions by category:`,
        error.message
      );
      res.status(500).json({
        success: false,
        error: error.message,
      });
    }
  },

  async getRecurringTransactions(req, res) {
    try {
      const userId = req.user.id;
      const transactions = await TransactionService.getRecurringTransactions(
        userId
      );

      res.status(200).json({
        success: true,
        data: transactions,
        count: transactions.length,
      });
    } catch (error) {
      console.error(
        `[${getLocalTime()}] Error getting recurring transactions:`,
        error.message
      );
      res.status(500).json({
        success: false,
        error: error.message,
      });
    }
  },

  async getMonthlyReport(req, res) {
    try {
      const userId = req.user.id;
      const { year, month } = req.params;

      const report = await TransactionService.getMonthlyReport(
        userId,
        parseInt(year),
        parseInt(month)
      );

      res.status(200).json({
        success: true,
        data: report,
      });
    } catch (error) {
      console.error(
        `[${getLocalTime()}] Error getting monthly report:`,
        error.message
      );
      res.status(500).json({
        success: false,
        error: error.message,
      });
    }
  },
};
