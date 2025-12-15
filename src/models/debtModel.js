import { supabase } from "../config/supabase.js";

export const DebtModel = {
  async create(debtData) {
    const { data, error } = await supabase
      .from("debts")
      .insert([debtData])
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async findByUserId(userId) {
    const { data, error } = await supabase
      .from("debts")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (error) throw error;
    return data;
  },

  async findById(id) {
    const { data, error } = await supabase
      .from("debts")
      .select("*")
      .eq("id", id)
      .single();

    if (error) throw error;
    return data;
  },

  async update(id, debtData) {
    const { data, error } = await supabase
      .from("debts")
      .update(debtData)
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async delete(id) {
    const { error } = await supabase.from("debts").delete().eq("id", id);

    if (error) throw error;
    return { message: "Debt deleted successfully" };
  },

  async updateRemainingAmount(id, newAmount) {
    const { data, error } = await supabase
      .from("debts")
      .update({ remaining_amount: newAmount })
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async getTotalDebtByUser(userId) {
    const { data, error } = await supabase
      .from("debts")
      .select("total_amount, remaining_amount")
      .eq("user_id", userId);

    if (error) throw error;

    const totals = {
      total_debt: 0,
      remaining_debt: 0,
      paid_debt: 0,
    };

    data.forEach((debt) => {
      totals.total_debt += parseFloat(debt.total_amount || 0);
      totals.remaining_debt += parseFloat(debt.remaining_amount || 0);
    });

    totals.paid_debt = totals.total_debt - totals.remaining_debt;

    return totals;
  },
};
