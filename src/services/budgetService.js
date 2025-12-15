import { BudgetModel } from "../models/budgetModel.js";
import { CategoryModel } from "../models/categoryModel.js";

export const BudgetService = {
  async createBudget(userId, budgetData) {
    // Validar que el periodo sea válido
    if (!["monthly", "weekly"].includes(budgetData.period)) {
      throw new Error("Invalid period. Must be 'monthly' or 'weekly'");
    }

    // Validar que el monto sea mayor a 0
    if (!budgetData.amount_limit || budgetData.amount_limit <= 0) {
      throw new Error("Amount limit must be greater than 0");
    }

    // Verificar que la categoría existe y pertenece al usuario
    const category = await CategoryModel.findById(budgetData.category_id);

    if (!category) {
      throw new Error("Category not found");
    }

    if (category.user_id !== userId) {
      throw new Error("You don't have permission to use this category");
    }

    // Verificar si ya existe un presupuesto para esta categoría
    try {
      const existingBudget = await BudgetModel.findByUserAndCategory(
        userId,
        budgetData.category_id
      );

      if (existingBudget) {
        throw new Error(
          `Ya existe un presupuesto para la categoría "${category.name}"`
        );
      }
    } catch (error) {
      if (
        !error.message.includes("Ya existe un presupuesto") &&
        !error.message.includes("JSON object requested")
      ) {
        // Ignorar error de "no encontrado"
      } else if (error.message.includes("Ya existe un presupuesto")) {
        throw error;
      }
    }

    const newBudget = {
      user_id: userId,
      category_id: budgetData.category_id,
      amount_limit: parseFloat(budgetData.amount_limit),
      period: budgetData.period,
    };

    return await BudgetModel.create(newBudget);
  },

  async getUserBudgets(userId, period = null) {
    if (period) {
      // Validar que el periodo sea válido
      if (!["monthly", "weekly"].includes(period)) {
        throw new Error("Invalid period. Must be 'monthly' or 'weekly'");
      }
      return await BudgetModel.findByUserIdAndPeriod(userId, period);
    }

    return await BudgetModel.findByUserId(userId);
  },

  async getBudgetById(id) {
    const budget = await BudgetModel.findById(id);
    if (!budget) {
      throw new Error("Budget not found");
    }
    return budget;
  },

  async updateBudget(id, userId, budgetData) {
    // Verificar que el presupuesto existe y pertenece al usuario
    const budget = await BudgetModel.findById(id);

    if (!budget) {
      throw new Error("Budget not found");
    }

    if (budget.user_id !== userId) {
      throw new Error("You don't have permission to update this budget");
    }

    const updateData = {};

    // Validar y actualizar monto
    if (budgetData.amount_limit !== undefined) {
      if (budgetData.amount_limit <= 0) {
        throw new Error("Amount limit must be greater than 0");
      }
      updateData.amount_limit = parseFloat(budgetData.amount_limit);
    }

    // Validar y actualizar periodo
    if (budgetData.period) {
      if (!["monthly", "weekly"].includes(budgetData.period)) {
        throw new Error("Invalid period. Must be 'monthly' or 'weekly'");
      }
      updateData.period = budgetData.period;
    }

    // Validar y actualizar categoría
    if (budgetData.category_id) {
      const category = await CategoryModel.findById(budgetData.category_id);

      if (!category) {
        throw new Error("Category not found");
      }

      if (category.user_id !== userId) {
        throw new Error("You don't have permission to use this category");
      }

      // Verificar si ya existe un presupuesto para esta nueva categoría
      if (budgetData.category_id !== budget.category_id) {
        try {
          const existingBudget = await BudgetModel.findByUserAndCategory(
            userId,
            budgetData.category_id
          );

          if (existingBudget && existingBudget.id !== id) {
            throw new Error(
              `Ya existe un presupuesto para la categoría "${category.name}"`
            );
          }
        } catch (error) {
          if (
            !error.message.includes("Ya existe un presupuesto") &&
            !error.message.includes("JSON object requested")
          ) {
            // Ignorar error de "no encontrado"
          } else if (error.message.includes("Ya existe un presupuesto")) {
            throw error;
          }
        }
      }

      updateData.category_id = budgetData.category_id;
    }

    return await BudgetModel.update(id, updateData);
  },

  async deleteBudget(id, userId) {
    // Verificar que el presupuesto existe y pertenece al usuario
    const budget = await BudgetModel.findById(id);

    if (!budget) {
      throw new Error("Budget not found");
    }

    if (budget.user_id !== userId) {
      throw new Error("You don't have permission to delete this budget");
    }

    return await BudgetModel.delete(id);
  },

  async getBudgetsSummary(userId) {
    const allBudgets = await BudgetModel.findByUserId(userId);

    const summary = {
      total_budgets: allBudgets.length,
      monthly: {
        count: 0,
        total_amount: 0,
      },
      weekly: {
        count: 0,
        total_amount: 0,
      },
      by_category: {},
    };

    allBudgets.forEach((budget) => {
      const amount = parseFloat(budget.amount_limit) || 0;

      if (budget.period === "monthly") {
        summary.monthly.count++;
        summary.monthly.total_amount += amount;
      } else if (budget.period === "weekly") {
        summary.weekly.count++;
        summary.weekly.total_amount += amount;
      }

      // Agrupar por categoría
      const categoryName = budget.categories?.name || "Sin categoría";
      if (!summary.by_category[categoryName]) {
        summary.by_category[categoryName] = {
          amount: 0,
          period: budget.period,
        };
      }
      summary.by_category[categoryName].amount += amount;
    });

    return summary;
  },
};
