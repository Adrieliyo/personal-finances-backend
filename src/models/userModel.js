import { supabase } from "../config/supabase.js";

export const UserModel = {
  async create(userData) {
    const { data, error } = await supabase
      .from("users")
      .insert([userData])
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async findAll() {
    const { data, error } = await supabase
      .from("users")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) throw error;
    return data;
  },

  async findById(id) {
    const { data, error } = await supabase
      .from("users")
      .select("*")
      .eq("id", id)
      .single();

    if (error) throw error;
    return data;
  },

  async findByEmail(email) {
    const { data, error } = await supabase
      .from("users")
      .select("*")
      .eq("email", email)
      .single();

    if (error) throw error;
    return data;
  },

  async findByActivationToken(token) {
    const { data, error } = await supabase
      .from("users")
      .select("*")
      .eq("activation_token", token)
      .single();

    if (error) throw error;
    return data;
  },

  async update(id, userData) {
    const { data, error } = await supabase
      .from("users")
      .update(userData)
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async delete(id) {
    const { error } = await supabase.from("users").delete().eq("id", id);

    if (error) throw error;
    return { message: "User deleted successfully" };
  },

  async updateStatus(id, status) {
    const { data, error } = await supabase
      .from("users")
      .update({ status })
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },
};
