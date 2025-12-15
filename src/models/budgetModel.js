import { supabase } from "../config/supabase.js";

export const BudgetModel = {
  async create(budgetData) {
    const { data, error } = await supabase
      .from("budgets")
      .insert([budgetData])
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async findByUserId(userId) {
    const { data, error } = await supabase
      .from("budgets")
      .select(
        `
        *,
        categories (
          id,
          name,
          type
        )
      `
      )
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (error) throw error;
    return data;
  },

  async findByUserIdAndPeriod(userId, period) {
    const { data, error } = await supabase
      .from("budgets")
      .select(
        `
        *,
        categories (
          id,
          name,
          type
        )
      `
      )
      .eq("user_id", userId)
      .eq("period", period)
      .order("created_at", { ascending: false });

    if (error) throw error;
    return data;
  },

  async findById(id) {
    const { data, error } = await supabase
      .from("budgets")
      .select(
        `
        *,
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

  async findByUserAndCategory(userId, categoryId) {
    const { data, error } = await supabase
      .from("budgets")
      .select(
        `
        *,
        categories (
          id,
          name,
          type
        )
      `
      )
      .eq("user_id", userId)
      .eq("category_id", categoryId)
      .single();

    if (error) throw error;
    return data;
  },

  async update(id, budgetData) {
    const { data, error } = await supabase
      .from("budgets")
      .update(budgetData)
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async delete(id) {
    const { error } = await supabase.from("budgets").delete().eq("id", id);

    if (error) throw error;
    return { message: "Budget deleted successfully" };
  },

  async getTotalBudgetByUser(userId, period = null) {
    let query = supabase
      .from("budgets")
      .select("amount_limit")
      .eq("user_id", userId);

    if (period) {
      query = query.eq("period", period);
    }

    const { data, error } = await query;

    if (error) throw error;

    const total = data.reduce(
      (sum, budget) => sum + parseFloat(budget.amount_limit || 0),
      0
    );

    return total;
  },
};
