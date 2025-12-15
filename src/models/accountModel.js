import { supabase } from "../config/supabase.js";

export const AccountModel = {
  async create(accountData) {
    const { data, error } = await supabase
      .from("accounts")
      .insert([accountData])
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async findByUserId(userId) {
    const { data, error } = await supabase
      .from("accounts")
      .select(
        `
        *,
        account_types (
          id,
          name,
          is_credit,
          is_investment
        )
      `
      )
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (error) throw error;
    return data;
  },

  async findById(id) {
    const { data, error } = await supabase
      .from("accounts")
      .select(
        `
        *,
        account_types (
          id,
          name,
          is_credit,
          is_investment
        )
      `
      )
      .eq("id", id)
      .single();

    if (error) throw error;
    return data;
  },

  async update(id, accountData) {
    const { data, error } = await supabase
      .from("accounts")
      .update(accountData)
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async delete(id) {
    const { error } = await supabase.from("accounts").delete().eq("id", id);

    if (error) throw error;
    return { message: "Account deleted successfully" };
  },

  async updateBalance(id, newBalance) {
    const { data, error } = await supabase
      .from("accounts")
      .update({ current_balance: newBalance })
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },
};
