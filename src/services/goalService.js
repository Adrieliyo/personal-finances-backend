import { GoalModel } from "../models/goalModel.js";

export const GoalService = {
  async createGoal(userId, goalData) {
    // Validar nombre
    if (!goalData.name || goalData.name.trim().length === 0) {
      throw new Error("Goal name is required");
    }

    // Validar monto objetivo
    if (!goalData.target_amount || goalData.target_amount <= 0) {
      throw new Error("Target amount must be greater than 0");
    }

    // Si no se proporciona current_amount, inicializar en 0
    const currentAmount =
      goalData.current_amount !== undefined
        ? parseFloat(goalData.current_amount)
        : 0;

    // Validar que current_amount no sea mayor que target_amount
    if (currentAmount > parseFloat(goalData.target_amount)) {
      throw new Error("Current amount cannot be greater than target amount");
    }

    // Validar que current_amount no sea negativo
    if (currentAmount < 0) {
      throw new Error("Current amount cannot be negative");
    }

    // Validar fecha límite si se proporciona
    if (goalData.deadline) {
      const deadline = new Date(goalData.deadline);
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      if (deadline < today) {
        throw new Error("Deadline cannot be in the past");
      }
    }

    // Validar estado si se proporciona
    if (goalData.status) {
      if (!["active", "completed", "paused"].includes(goalData.status)) {
        throw new Error(
          "Invalid status. Must be 'active', 'completed', or 'paused'"
        );
      }
    }

    const newGoal = {
      user_id: userId,
      name: goalData.name.trim(),
      target_amount: parseFloat(goalData.target_amount),
      current_amount: currentAmount,
      deadline: goalData.deadline || null,
      status: goalData.status || "active",
    };

    return await GoalModel.create(newGoal);
  },

  async getUserGoals(userId, status = null) {
    if (status) {
      // Validar que el estado sea válido
      if (!["active", "completed", "paused"].includes(status)) {
        throw new Error(
          "Invalid status. Must be 'active', 'completed', or 'paused'"
        );
      }
      return await GoalModel.findByUserIdAndStatus(userId, status);
    }

    const goals = await GoalModel.findByUserId(userId);

    // Calcular información adicional para cada meta
    return goals.map((goal) => this.calculateGoalProgress(goal));
  },

  async getGoalById(id) {
    const goal = await GoalModel.findById(id);
    if (!goal) {
      throw new Error("Goal not found");
    }

    return this.calculateGoalProgress(goal);
  },

  calculateGoalProgress(goal) {
    const targetAmount = parseFloat(goal.target_amount || 0);
    const currentAmount = parseFloat(goal.current_amount || 0);
    const remainingAmount = targetAmount - currentAmount;
    const progress =
      targetAmount > 0 ? ((currentAmount / targetAmount) * 100).toFixed(2) : 0;

    // Calcular días restantes si hay deadline
    let daysRemaining = null;
    let isOverdue = false;

    if (goal.deadline) {
      const deadline = new Date(goal.deadline);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      deadline.setHours(0, 0, 0, 0);

      const timeDiff = deadline - today;
      daysRemaining = Math.ceil(timeDiff / (1000 * 60 * 60 * 24));
      isOverdue = daysRemaining < 0;
    }

    return {
      ...goal,
      remaining_amount: remainingAmount,
      progress: parseFloat(progress),
      is_completed: currentAmount >= targetAmount,
      days_remaining: daysRemaining,
      is_overdue: isOverdue,
    };
  },

  async updateGoal(id, userId, goalData) {
    // Verificar que la meta existe y pertenece al usuario
    const goal = await GoalModel.findById(id);

    if (!goal) {
      throw new Error("Goal not found");
    }

    if (goal.user_id !== userId) {
      throw new Error("You don't have permission to update this goal");
    }

    const updateData = {};

    // Validar y actualizar nombre
    if (goalData.name !== undefined) {
      if (goalData.name.trim().length === 0) {
        throw new Error("Goal name cannot be empty");
      }
      updateData.name = goalData.name.trim();
    }

    // Validar y actualizar monto objetivo
    if (goalData.target_amount !== undefined) {
      const targetAmount = parseFloat(goalData.target_amount);
      if (targetAmount <= 0) {
        throw new Error("Target amount must be greater than 0");
      }

      // Verificar que current_amount no sea mayor al nuevo target
      const currentAmount = parseFloat(goal.current_amount);
      if (currentAmount > targetAmount) {
        throw new Error(
          "Cannot set target amount less than current amount. Please update current amount first."
        );
      }

      updateData.target_amount = targetAmount;
    }

    // Validar y actualizar monto actual
    if (goalData.current_amount !== undefined) {
      const currentAmount = parseFloat(goalData.current_amount);
      if (currentAmount < 0) {
        throw new Error("Current amount cannot be negative");
      }

      const targetAmount = updateData.target_amount
        ? parseFloat(updateData.target_amount)
        : parseFloat(goal.target_amount);

      if (currentAmount > targetAmount) {
        throw new Error("Current amount cannot be greater than target amount");
      }

      updateData.current_amount = currentAmount;

      // Si se alcanza el objetivo, actualizar estado a completed
      if (currentAmount >= targetAmount && goal.status !== "completed") {
        updateData.status = "completed";
      }
    }

    // Validar y actualizar fecha límite
    if (goalData.deadline !== undefined) {
      if (goalData.deadline !== null) {
        const deadline = new Date(goalData.deadline);
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        if (deadline < today) {
          throw new Error("Deadline cannot be in the past");
        }
        updateData.deadline = goalData.deadline;
      } else {
        updateData.deadline = null;
      }
    }

    // Validar y actualizar estado
    if (goalData.status !== undefined) {
      if (!["active", "completed", "paused"].includes(goalData.status)) {
        throw new Error(
          "Invalid status. Must be 'active', 'completed', or 'paused'"
        );
      }
      updateData.status = goalData.status;
    }

    return await GoalModel.update(id, updateData);
  },

  async deleteGoal(id, userId) {
    // Verificar que la meta existe y pertenece al usuario
    const goal = await GoalModel.findById(id);

    if (!goal) {
      throw new Error("Goal not found");
    }

    if (goal.user_id !== userId) {
      throw new Error("You don't have permission to delete this goal");
    }

    return await GoalModel.delete(id);
  },

  async addFunds(id, userId, amount) {
    // Verificar que la meta existe y pertenece al usuario
    const goal = await GoalModel.findById(id);

    if (!goal) {
      throw new Error("Goal not found");
    }

    if (goal.user_id !== userId) {
      throw new Error("You don't have permission to update this goal");
    }

    const addAmount = parseFloat(amount);

    if (addAmount <= 0) {
      throw new Error("Amount must be greater than 0");
    }

    const currentAmount = parseFloat(goal.current_amount);
    const targetAmount = parseFloat(goal.target_amount);
    const newAmount = currentAmount + addAmount;

    if (newAmount > targetAmount) {
      throw new Error(
        `Adding ${addAmount} would exceed the target amount. Maximum you can add: ${
          targetAmount - currentAmount
        }`
      );
    }

    // Actualizar monto y estado si se completa
    const updateData = {
      current_amount: newAmount,
    };

    if (newAmount >= targetAmount && goal.status !== "completed") {
      updateData.status = "completed";
    }

    return await GoalModel.update(id, updateData);
  },

  async withdrawFunds(id, userId, amount) {
    // Verificar que la meta existe y pertenece al usuario
    const goal = await GoalModel.findById(id);

    if (!goal) {
      throw new Error("Goal not found");
    }

    if (goal.user_id !== userId) {
      throw new Error("You don't have permission to update this goal");
    }

    const withdrawAmount = parseFloat(amount);

    if (withdrawAmount <= 0) {
      throw new Error("Amount must be greater than 0");
    }

    const currentAmount = parseFloat(goal.current_amount);

    if (withdrawAmount > currentAmount) {
      throw new Error(
        `Cannot withdraw ${withdrawAmount}. Current amount: ${currentAmount}`
      );
    }

    const newAmount = currentAmount - withdrawAmount;

    // Actualizar monto y estado si ya no está completa
    const updateData = {
      current_amount: newAmount,
    };

    const targetAmount = parseFloat(goal.target_amount);
    if (newAmount < targetAmount && goal.status === "completed") {
      updateData.status = "active";
    }

    return await GoalModel.update(id, updateData);
  },

  async getGoalsSummary(userId) {
    const goals = await GoalModel.findByUserId(userId);

    const summary = {
      total_goals: goals.length,
      active_goals: 0,
      completed_goals: 0,
      paused_goals: 0,
      total_target: 0,
      total_saved: 0,
      total_remaining: 0,
      overall_progress: 0,
      goals_near_deadline: 0,
      overdue_goals: 0,
    };

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    goals.forEach((goal) => {
      const targetAmount = parseFloat(goal.target_amount || 0);
      const currentAmount = parseFloat(goal.current_amount || 0);

      summary.total_target += targetAmount;
      summary.total_saved += currentAmount;

      // Contar por estado
      if (goal.status === "active") summary.active_goals++;
      else if (goal.status === "completed") summary.completed_goals++;
      else if (goal.status === "paused") summary.paused_goals++;

      // Verificar deadline
      if (goal.deadline && goal.status !== "completed") {
        const deadline = new Date(goal.deadline);
        deadline.setHours(0, 0, 0, 0);
        const timeDiff = deadline - today;
        const daysRemaining = Math.ceil(timeDiff / (1000 * 60 * 60 * 24));

        if (daysRemaining < 0) {
          summary.overdue_goals++;
        } else if (daysRemaining <= 7) {
          summary.goals_near_deadline++;
        }
      }
    });

    summary.total_remaining = summary.total_target - summary.total_saved;
    summary.overall_progress =
      summary.total_target > 0
        ? ((summary.total_saved / summary.total_target) * 100).toFixed(2)
        : 0;

    return summary;
  },
};
