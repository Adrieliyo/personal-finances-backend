import { supabase } from "../config/supabase.js";

export const TransactionModel = {
  async create(transactionData) {
    const { data, error } = await supabase
      .from("transactions")
      .insert([transactionData])
      .select(
        `
        *,
        accounts (
          id,
          name,
          account_type_id
        ),
        categories (
          id,
          name,
          type
        )
      `
      )
      .single();

    if (error) throw error;
    return data;
  },

  async findByUserId(userId, filters = {}) {
    let query = supabase
      .from("transactions")
      .select(
        `
        *,
        accounts (
          id,
          name,
          account_type_id
        ),
        categories (
          id,
          name,
          type
        )
      `
      )
      .eq("user_id", userId);

    // Filtrar por tipo de transacción
    if (filters.type) {
      query = query.eq("type", filters.type);
    }

    // Filtrar por cuenta
    if (filters.account_id) {
      query = query.eq("account_id", filters.account_id);
    }

    // Filtrar por categoría
    if (filters.category_id) {
      query = query.eq("category_id", filters.category_id);
    }

    // Filtrar por rango de fechas
    if (filters.start_date) {
      query = query.gte("date", filters.start_date);
    }
    if (filters.end_date) {
      query = query.lte("date", filters.end_date);
    }

    // Filtrar por transacciones recurrentes
    if (filters.is_recurring !== undefined) {
      query = query.eq("is_recurring", filters.is_recurring);
    }

    query = query.order("date", { ascending: false });

    const { data, error } = await query;

    if (error) throw error;
    return data;
  },

  async findById(id) {
    const { data, error } = await supabase
      .from("transactions")
      .select(
        `
        *,
        accounts (
          id,
          name,
          account_type_id
        ),
        categories (
          id,
          name,
          type
        )
      `
      )
      .eq("id", id)
      .single();

    if (error) throw error;
    return data;
  },

  async update(id, transactionData) {
    const { data, error } = await supabase
      .from("transactions")
      .update(transactionData)
      .eq("id", id)
      .select(
        `
        *,
        accounts (
          id,
          name,
          account_type_id
        ),
        categories (
          id,
          name,
          type
        )
      `
      )
      .single();

    if (error) throw error;
    return data;
  },

  async delete(id) {
    const { error } = await supabase.from("transactions").delete().eq("id", id);

    if (error) throw error;
    return { message: "Transaction deleted successfully" };
  },

  async getTotalsByType(userId, startDate = null, endDate = null) {
    let query = supabase
      .from("transactions")
      .select("type, amount")
      .eq("user_id", userId);

    if (startDate) {
      query = query.gte("date", startDate);
    }
    if (endDate) {
      query = query.lte("date", endDate);
    }

    const { data, error } = await query;

    if (error) throw error;

    const totals = {
      income: 0,
      expense: 0,
      transfer: 0,
    };

    data.forEach((transaction) => {
      const amount = parseFloat(transaction.amount || 0);
      if (transaction.type === "income") {
        totals.income += amount;
      } else if (transaction.type === "expense") {
        totals.expense += amount;
      } else if (transaction.type === "transfer") {
        totals.transfer += amount;
      }
    });

    return totals;
  },

  async getByCategory(userId, startDate = null, endDate = null) {
    let query = supabase
      .from("transactions")
      .select(
        `
        amount,
        type,
        categories (
          id,
          name,
          type
        )
      `
      )
      .eq("user_id", userId);

    if (startDate) {
      query = query.gte("date", startDate);
    }
    if (endDate) {
      query = query.lte("date", endDate);
    }

    const { data, error } = await query;

    if (error) throw error;
    return data;
  },

  async getRecurringTransactions(userId) {
    const { data, error } = await supabase
      .from("transactions")
      .select(
        `
        *,
        accounts (
          id,
          name,
          account_type_id
        ),
        categories (
          id,
          name,
          type
        )
      `
      )
      .eq("user_id", userId)
      .eq("is_recurring", true)
      .order("date", { ascending: false });

    if (error) throw error;
    return data;
  },
};
