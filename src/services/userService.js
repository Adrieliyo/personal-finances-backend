import bcrypt from "bcrypt";
import { UserModel } from "../models/userModel.js";
import { EmailService } from "../utils/emailService.js";
import {
  generateActivationToken,
  generateTokenExpiry,
} from "../utils/tokenGenerator.js";

export const UserService = {
  async createUser(userData) {
    // Verificar si el email ya existe
    try {
      const existingUser = await UserModel.findByEmail(userData.email);
      if (existingUser) {
        throw new Error("El email ya está registrado");
      }
    } catch (error) {
      // Si no existe, continuamos (el error es esperado)
      if (!error.message.includes("ya está registrado")) {
        // Ignorar error de "no encontrado"
      }
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(userData.password, 10);

    // Generar token de activación
    const activationToken = generateActivationToken();
    const tokenExpiry = generateTokenExpiry(24); // 24 horas

    const newUser = {
      username: userData.username,
      email: userData.email,
      full_name: userData.full_name,
      currency: userData.currency || "MXN",
      password: hashedPassword,
      status: "inactive", // Inicia como inactivo hasta que active la cuenta
      activation_token: activationToken,
      activation_token_expiry: tokenExpiry,
    };

    const createdUser = await UserModel.create(newUser);

    // Enviar email de activación
    try {
      await EmailService.sendActivationEmail(
        createdUser.email,
        createdUser.username,
        activationToken
      );
    } catch (emailError) {
      console.error("Error enviando email:", emailError);
      // No fallar el registro si el email falla
    }

    // No retornar datos sensibles
    delete createdUser.password;
    delete createdUser.activation_token;

    return createdUser;
  },

  async activateAccount(token) {
    const user = await UserModel.findByActivationToken(token);

    if (!user) {
      throw new Error("Token de activación inválido");
    }

    // Verificar si el token expiró
    if (new Date() > new Date(user.activation_token_expiry)) {
      throw new Error("El token de activación ha expirado");
    }

    // Activar la cuenta
    const updatedUser = await UserModel.update(user.id, {
      status: "active",
      activation_token: null,
      activation_token_expiry: null,
    });

    delete updatedUser.password;
    return updatedUser;
  },

  async getAllUsers() {
    return await UserModel.findAll();
  },

  async getUserById(id) {
    const user = await UserModel.findById(id);
    if (!user) {
      throw new Error("User not found");
    }
    // No retornar el password
    delete user.password;
    return user;
  },

  async updateUser(id, userData) {
    // Si se actualiza el password, hashearlo
    if (userData.password) {
      userData.password = await bcrypt.hash(userData.password, 10);
    }

    const updatedUser = await UserModel.update(id, userData);
    delete updatedUser.password;
    return updatedUser;
  },

  async deleteUser(id) {
    return await UserModel.delete(id);
  },

  async changeUserStatus(id, status) {
    if (!["active", "inactive", "suspended"].includes(status)) {
      throw new Error("Invalid status");
    }
    return await UserModel.updateStatus(id, status);
  },
};
