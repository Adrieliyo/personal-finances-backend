import { TransactionModel } from "../models/transactionModel.js";
import { AccountModel } from "../models/accountModel.js";
import { CategoryModel } from "../models/categoryModel.js";

export const TransactionService = {
  async createTransaction(userId, transactionData) {
    // Validar tipo de transacción
    if (!["income", "expense", "transfer"].includes(transactionData.type)) {
      throw new Error(
        "Invalid transaction type. Must be 'income', 'expense', or 'transfer'"
      );
    }

    // Validar monto
    if (!transactionData.amount || transactionData.amount <= 0) {
      throw new Error("Amount must be greater than 0");
    }

    // Validar fecha
    if (!transactionData.date) {
      throw new Error("Date is required");
    }

    // Validar que la cuenta existe y pertenece al usuario
    const account = await AccountModel.findById(transactionData.account_id);
    if (!account) {
      throw new Error("Account not found");
    }
    if (account.user_id !== userId) {
      throw new Error("You don't have permission to use this account");
    }

    // Validar que la categoría existe y pertenece al usuario
    const category = await CategoryModel.findById(transactionData.category_id);
    if (!category) {
      throw new Error("Category not found");
    }
    if (category.user_id !== userId) {
      throw new Error("You don't have permission to use this category");
    }

    // Validar que el tipo de transacción coincida con el tipo de categoría
    if (transactionData.type === "income" && category.type !== "income") {
      throw new Error("Category type must be 'income' for income transactions");
    }
    if (transactionData.type === "expense" && category.type !== "expense") {
      throw new Error(
        "Category type must be 'expense' for expense transactions"
      );
    }

    const newTransaction = {
      user_id: userId,
      account_id: transactionData.account_id,
      category_id: transactionData.category_id,
      amount: parseFloat(transactionData.amount),
      date: transactionData.date,
      description: transactionData.description?.trim() || null,
      type: transactionData.type,
      is_recurring: transactionData.is_recurring || false,
    };

    // Crear la transacción
    const transaction = await TransactionModel.create(newTransaction);

    // Actualizar el balance de la cuenta
    await this.updateAccountBalance(
      transactionData.account_id,
      transactionData.type,
      parseFloat(transactionData.amount)
    );

    return transaction;
  },

  async getUserTransactions(userId, filters = {}) {
    return await TransactionModel.findByUserId(userId, filters);
  },

  async getTransactionById(id) {
    const transaction = await TransactionModel.findById(id);
    if (!transaction) {
      throw new Error("Transaction not found");
    }
    return transaction;
  },

  async updateTransaction(id, userId, transactionData) {
    // Verificar que la transacción existe y pertenece al usuario
    const transaction = await TransactionModel.findById(id);

    if (!transaction) {
      throw new Error("Transaction not found");
    }

    if (transaction.user_id !== userId) {
      throw new Error("You don't have permission to update this transaction");
    }

    // Si se está cambiando el monto o el tipo, revertir el balance anterior
    const oldAmount = parseFloat(transaction.amount);
    const oldType = transaction.type;
    const oldAccountId = transaction.account_id;

    const updateData = {};

    // Validar y actualizar tipo
    if (transactionData.type !== undefined) {
      if (!["income", "expense", "transfer"].includes(transactionData.type)) {
        throw new Error(
          "Invalid transaction type. Must be 'income', 'expense', or 'transfer'"
        );
      }
      updateData.type = transactionData.type;
    }

    // Validar y actualizar monto
    if (transactionData.amount !== undefined) {
      const amount = parseFloat(transactionData.amount);
      if (amount <= 0) {
        throw new Error("Amount must be greater than 0");
      }
      updateData.amount = amount;
    }

    // Validar y actualizar cuenta
    if (transactionData.account_id !== undefined) {
      const account = await AccountModel.findById(transactionData.account_id);
      if (!account) {
        throw new Error("Account not found");
      }
      if (account.user_id !== userId) {
        throw new Error("You don't have permission to use this account");
      }
      updateData.account_id = transactionData.account_id;
    }

    // Validar y actualizar categoría
    if (transactionData.category_id !== undefined) {
      const category = await CategoryModel.findById(
        transactionData.category_id
      );
      if (!category) {
        throw new Error("Category not found");
      }
      if (category.user_id !== userId) {
        throw new Error("You don't have permission to use this category");
      }

      // Validar coincidencia de tipo
      const newType = updateData.type || oldType;
      if (newType === "income" && category.type !== "income") {
        throw new Error(
          "Category type must be 'income' for income transactions"
        );
      }
      if (newType === "expense" && category.type !== "expense") {
        throw new Error(
          "Category type must be 'expense' for expense transactions"
        );
      }

      updateData.category_id = transactionData.category_id;
    }

    // Actualizar otros campos
    if (transactionData.date !== undefined) {
      updateData.date = transactionData.date;
    }
    if (transactionData.description !== undefined) {
      updateData.description = transactionData.description?.trim() || null;
    }
    if (transactionData.is_recurring !== undefined) {
      updateData.is_recurring = transactionData.is_recurring;
    }

    // Revertir el balance anterior
    await this.revertAccountBalance(oldAccountId, oldType, oldAmount);

    // Actualizar la transacción
    const updatedTransaction = await TransactionModel.update(id, updateData);

    // Aplicar el nuevo balance
    const newAmount = updateData.amount || oldAmount;
    const newType = updateData.type || oldType;
    const newAccountId = updateData.account_id || oldAccountId;

    await this.updateAccountBalance(newAccountId, newType, newAmount);

    return updatedTransaction;
  },

  async deleteTransaction(id, userId) {
    // Verificar que la transacción existe y pertenece al usuario
    const transaction = await TransactionModel.findById(id);

    if (!transaction) {
      throw new Error("Transaction not found");
    }

    if (transaction.user_id !== userId) {
      throw new Error("You don't have permission to delete this transaction");
    }

    // Revertir el balance de la cuenta
    await this.revertAccountBalance(
      transaction.account_id,
      transaction.type,
      parseFloat(transaction.amount)
    );

    return await TransactionModel.delete(id);
  },

  async updateAccountBalance(accountId, transactionType, amount) {
    const account = await AccountModel.findById(accountId);
    const currentBalance = parseFloat(account.current_balance);

    let newBalance;

    if (transactionType === "income" || transactionType === "transfer") {
      newBalance = currentBalance + amount;
    } else if (transactionType === "expense") {
      newBalance = currentBalance - amount;
    }

    await AccountModel.updateBalance(accountId, newBalance);
  },

  async revertAccountBalance(accountId, transactionType, amount) {
    const account = await AccountModel.findById(accountId);
    const currentBalance = parseFloat(account.current_balance);

    let newBalance;

    // Revertir: hacemos lo opuesto
    if (transactionType === "income" || transactionType === "transfer") {
      newBalance = currentBalance - amount;
    } else if (transactionType === "expense") {
      newBalance = currentBalance + amount;
    }

    await AccountModel.updateBalance(accountId, newBalance);
  },

  async getTransactionsSummary(userId, startDate = null, endDate = null) {
    const totals = await TransactionModel.getTotalsByType(
      userId,
      startDate,
      endDate
    );

    const transactions = await TransactionModel.findByUserId(userId, {
      start_date: startDate,
      end_date: endDate,
    });

    const summary = {
      total_transactions: transactions.length,
      income: totals.income,
      expense: totals.expense,
      transfer: totals.transfer,
      net_income: totals.income - totals.expense,
      recurring_transactions: transactions.filter((t) => t.is_recurring).length,
      transactions_by_type: {
        income: transactions.filter((t) => t.type === "income").length,
        expense: transactions.filter((t) => t.type === "expense").length,
        transfer: transactions.filter((t) => t.type === "transfer").length,
      },
    };

    return summary;
  },

  async getTransactionsByCategory(userId, startDate = null, endDate = null) {
    const transactions = await TransactionModel.getByCategory(
      userId,
      startDate,
      endDate
    );

    const categoryTotals = {};

    transactions.forEach((transaction) => {
      const categoryName = transaction.categories?.name || "Sin categoría";
      const amount = parseFloat(transaction.amount || 0);
      const type = transaction.type;

      if (!categoryTotals[categoryName]) {
        categoryTotals[categoryName] = {
          income: 0,
          expense: 0,
          total: 0,
          count: 0,
        };
      }

      if (type === "income") {
        categoryTotals[categoryName].income += amount;
        categoryTotals[categoryName].total += amount;
      } else if (type === "expense") {
        categoryTotals[categoryName].expense += amount;
        categoryTotals[categoryName].total += amount;
      }

      categoryTotals[categoryName].count++;
    });

    return categoryTotals;
  },

  async getRecurringTransactions(userId) {
    return await TransactionModel.getRecurringTransactions(userId);
  },

  async getMonthlyReport(userId, year, month) {
    // Construir fechas de inicio y fin del mes
    const startDate = new Date(year, month - 1, 1).toISOString().split("T")[0];
    const endDate = new Date(year, month, 0).toISOString().split("T")[0];

    const summary = await this.getTransactionsSummary(
      userId,
      startDate,
      endDate
    );
    const byCategory = await this.getTransactionsByCategory(
      userId,
      startDate,
      endDate
    );

    return {
      period: {
        year,
        month,
        start_date: startDate,
        end_date: endDate,
      },
      summary,
      by_category: byCategory,
    };
  },
};
