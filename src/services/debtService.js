import { DebtModel } from "../models/debtModel.js";

export const DebtService = {
  async createDebt(userId, debtData) {
    // Validar que los montos sean válidos
    if (!debtData.total_amount || debtData.total_amount <= 0) {
      throw new Error("Total amount must be greater than 0");
    }

    // Si no se proporciona remaining_amount, usar total_amount
    const remainingAmount =
      debtData.remaining_amount !== undefined
        ? parseFloat(debtData.remaining_amount)
        : parseFloat(debtData.total_amount);

    // Validar que remaining_amount no sea mayor que total_amount
    if (remainingAmount > parseFloat(debtData.total_amount)) {
      throw new Error("Remaining amount cannot be greater than total amount");
    }

    // Validar que remaining_amount no sea negativo
    if (remainingAmount < 0) {
      throw new Error("Remaining amount cannot be negative");
    }

    // Validar tasa de interés
    if (
      debtData.interest_rate !== undefined &&
      debtData.interest_rate !== null
    ) {
      const interestRate = parseFloat(debtData.interest_rate);
      if (interestRate < 0 || interestRate > 100) {
        throw new Error("Interest rate must be between 0 and 100");
      }
    }

    // Validar pago mínimo
    if (
      debtData.minimum_payment !== undefined &&
      debtData.minimum_payment !== null
    ) {
      const minimumPayment = parseFloat(debtData.minimum_payment);
      if (minimumPayment < 0) {
        throw new Error("Minimum payment cannot be negative");
      }
      if (minimumPayment > parseFloat(debtData.total_amount)) {
        throw new Error("Minimum payment cannot be greater than total amount");
      }
    }

    // Validar día de vencimiento
    if (debtData.due_day !== undefined && debtData.due_day !== null) {
      const dueDay = parseInt(debtData.due_day);
      if (dueDay < 1 || dueDay > 31) {
        throw new Error("Due day must be between 1 and 31");
      }
    }

    // Validar nombre
    if (!debtData.name || debtData.name.trim().length === 0) {
      throw new Error("Debt name is required");
    }

    const newDebt = {
      user_id: userId,
      name: debtData.name.trim(),
      total_amount: parseFloat(debtData.total_amount),
      remaining_amount: remainingAmount,
      interest_rate: debtData.interest_rate
        ? parseFloat(debtData.interest_rate)
        : null,
      minimum_payment: debtData.minimum_payment
        ? parseFloat(debtData.minimum_payment)
        : null,
      due_day: debtData.due_day ? parseInt(debtData.due_day) : null,
    };

    return await DebtModel.create(newDebt);
  },

  async getUserDebts(userId) {
    const debts = await DebtModel.findByUserId(userId);

    // Calcular información adicional para cada deuda
    return debts.map((debt) => {
      const totalAmount = parseFloat(debt.total_amount || 0);
      const remainingAmount = parseFloat(debt.remaining_amount || 0);
      const paidAmount = totalAmount - remainingAmount;
      const paymentProgress =
        totalAmount > 0 ? ((paidAmount / totalAmount) * 100).toFixed(2) : 0;

      return {
        ...debt,
        paid_amount: paidAmount,
        payment_progress: parseFloat(paymentProgress),
        is_paid_off: remainingAmount === 0,
      };
    });
  },

  async getDebtById(id) {
    const debt = await DebtModel.findById(id);
    if (!debt) {
      throw new Error("Debt not found");
    }

    // Calcular información adicional
    const totalAmount = parseFloat(debt.total_amount || 0);
    const remainingAmount = parseFloat(debt.remaining_amount || 0);
    const paidAmount = totalAmount - remainingAmount;
    const paymentProgress =
      totalAmount > 0 ? ((paidAmount / totalAmount) * 100).toFixed(2) : 0;

    return {
      ...debt,
      paid_amount: paidAmount,
      payment_progress: parseFloat(paymentProgress),
      is_paid_off: remainingAmount === 0,
    };
  },

  async updateDebt(id, userId, debtData) {
    // Verificar que la deuda existe y pertenece al usuario
    const debt = await DebtModel.findById(id);

    if (!debt) {
      throw new Error("Debt not found");
    }

    if (debt.user_id !== userId) {
      throw new Error("You don't have permission to update this debt");
    }

    const updateData = {};

    // Validar y actualizar nombre
    if (debtData.name !== undefined) {
      if (debtData.name.trim().length === 0) {
        throw new Error("Debt name cannot be empty");
      }
      updateData.name = debtData.name.trim();
    }

    // Validar y actualizar monto total
    if (debtData.total_amount !== undefined) {
      const totalAmount = parseFloat(debtData.total_amount);
      if (totalAmount <= 0) {
        throw new Error("Total amount must be greater than 0");
      }

      // Si se actualiza el total, verificar que remaining_amount no sea mayor
      const currentRemaining = parseFloat(debt.remaining_amount);
      if (currentRemaining > totalAmount) {
        throw new Error(
          "Cannot set total amount less than remaining amount. Please update remaining amount first."
        );
      }

      updateData.total_amount = totalAmount;
    }

    // Validar y actualizar monto restante
    if (debtData.remaining_amount !== undefined) {
      const remainingAmount = parseFloat(debtData.remaining_amount);
      if (remainingAmount < 0) {
        throw new Error("Remaining amount cannot be negative");
      }

      const totalAmount = updateData.total_amount
        ? parseFloat(updateData.total_amount)
        : parseFloat(debt.total_amount);

      if (remainingAmount > totalAmount) {
        throw new Error("Remaining amount cannot be greater than total amount");
      }

      updateData.remaining_amount = remainingAmount;
    }

    // Validar y actualizar tasa de interés
    if (debtData.interest_rate !== undefined) {
      if (debtData.interest_rate !== null) {
        const interestRate = parseFloat(debtData.interest_rate);
        if (interestRate < 0 || interestRate > 100) {
          throw new Error("Interest rate must be between 0 and 100");
        }
        updateData.interest_rate = interestRate;
      } else {
        updateData.interest_rate = null;
      }
    }

    // Validar y actualizar pago mínimo
    if (debtData.minimum_payment !== undefined) {
      if (debtData.minimum_payment !== null) {
        const minimumPayment = parseFloat(debtData.minimum_payment);
        if (minimumPayment < 0) {
          throw new Error("Minimum payment cannot be negative");
        }

        const totalAmount = updateData.total_amount
          ? parseFloat(updateData.total_amount)
          : parseFloat(debt.total_amount);

        if (minimumPayment > totalAmount) {
          throw new Error(
            "Minimum payment cannot be greater than total amount"
          );
        }
        updateData.minimum_payment = minimumPayment;
      } else {
        updateData.minimum_payment = null;
      }
    }

    // Validar y actualizar día de vencimiento
    if (debtData.due_day !== undefined) {
      if (debtData.due_day !== null) {
        const dueDay = parseInt(debtData.due_day);
        if (dueDay < 1 || dueDay > 31) {
          throw new Error("Due day must be between 1 and 31");
        }
        updateData.due_day = dueDay;
      } else {
        updateData.due_day = null;
      }
    }

    return await DebtModel.update(id, updateData);
  },

  async deleteDebt(id, userId) {
    // Verificar que la deuda existe y pertenece al usuario
    const debt = await DebtModel.findById(id);

    if (!debt) {
      throw new Error("Debt not found");
    }

    if (debt.user_id !== userId) {
      throw new Error("You don't have permission to delete this debt");
    }

    return await DebtModel.delete(id);
  },

  async makePayment(id, userId, paymentAmount) {
    // Verificar que la deuda existe y pertenece al usuario
    const debt = await DebtModel.findById(id);

    if (!debt) {
      throw new Error("Debt not found");
    }

    if (debt.user_id !== userId) {
      throw new Error("You don't have permission to update this debt");
    }

    const payment = parseFloat(paymentAmount);

    if (payment <= 0) {
      throw new Error("Payment amount must be greater than 0");
    }

    const currentRemaining = parseFloat(debt.remaining_amount);

    if (payment > currentRemaining) {
      throw new Error(
        `Payment amount (${payment}) cannot be greater than remaining amount (${currentRemaining})`
      );
    }

    const newRemainingAmount = currentRemaining - payment;

    return await DebtModel.updateRemainingAmount(id, newRemainingAmount);
  },

  async getDebtsSummary(userId) {
    const debts = await DebtModel.findByUserId(userId);
    const totals = await DebtModel.getTotalDebtByUser(userId);

    const summary = {
      total_debts: debts.length,
      active_debts: debts.filter((d) => parseFloat(d.remaining_amount) > 0)
        .length,
      paid_off_debts: debts.filter((d) => parseFloat(d.remaining_amount) === 0)
        .length,
      total_debt_amount: totals.total_debt,
      total_remaining: totals.remaining_debt,
      total_paid: totals.paid_debt,
      payment_progress:
        totals.total_debt > 0
          ? ((totals.paid_debt / totals.total_debt) * 100).toFixed(2)
          : 0,
      debts_with_interest: debts.filter(
        (d) => d.interest_rate !== null && d.interest_rate > 0
      ).length,
      average_interest_rate: 0,
    };

    // Calcular tasa de interés promedio
    const debtsWithInterest = debts.filter(
      (d) => d.interest_rate !== null && d.interest_rate > 0
    );
    if (debtsWithInterest.length > 0) {
      const totalInterest = debtsWithInterest.reduce(
        (sum, d) => sum + parseFloat(d.interest_rate),
        0
      );
      summary.average_interest_rate = (
        totalInterest / debtsWithInterest.length
      ).toFixed(2);
    }

    return summary;
  },
};
