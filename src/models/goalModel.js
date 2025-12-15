import { supabase } from "../config/supabase.js";

export const GoalModel = {
  async create(goalData) {
    const { data, error } = await supabase
      .from("goals")
      .insert([goalData])
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async findByUserId(userId) {
    const { data, error } = await supabase
      .from("goals")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (error) throw error;
    return data;
  },

  async findByUserIdAndStatus(userId, status) {
    const { data, error } = await supabase
      .from("goals")
      .select("*")
      .eq("user_id", userId)
      .eq("status", status)
      .order("deadline", { ascending: true });

    if (error) throw error;
    return data;
  },

  async findById(id) {
    const { data, error } = await supabase
      .from("goals")
      .select("*")
      .eq("id", id)
      .single();

    if (error) throw error;
    return data;
  },

  async update(id, goalData) {
    const { data, error } = await supabase
      .from("goals")
      .update(goalData)
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async delete(id) {
    const { error } = await supabase.from("goals").delete().eq("id", id);

    if (error) throw error;
    return { message: "Goal deleted successfully" };
  },

  async updateCurrentAmount(id, newAmount) {
    const { data, error } = await supabase
      .from("goals")
      .update({ current_amount: newAmount })
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async updateStatus(id, status) {
    const { data, error } = await supabase
      .from("goals")
      .update({ status })
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },
};
