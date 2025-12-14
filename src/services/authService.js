import bcrypt from "bcrypt";
import { UserModel } from "../models/userModel.js";
import { createAccessToken } from "../utils/jwt.js";

export const AuthService = {
  async signIn(emailOrUsername, password) {
    try {
      // Buscar usuario por email o username
      const user = await UserModel.findByEmailOrUsername(emailOrUsername);

      if (!user) {
        throw new Error("User not found");
      }

      // Comparar contraseña
      const isMatch = await bcrypt.compare(password, user.password);

      if (!isMatch) {
        throw new Error("Password incorrect");
      }

      // Verificar estado de la cuenta
      if (user.status === "inactive") {
        throw new Error(
          "Please activate your account via the email sent to you"
        );
      } else if (user.status === "suspended") {
        throw new Error(
          "Your account is suspended and cannot be accessed at this time"
        );
      } else if (user.status !== "active") {
        throw new Error("Your account status is not valid for access");
      }

      // Crear token JWT
      const token = await createAccessToken({
        id: user.id,
        username: user.username,
        email: user.email,
      });

      // Retornar datos del usuario (sin password) y el token
      return {
        token,
        user: {
          id: user.id,
          username: user.username,
          full_name: user.full_name,
          email: user.email,
          currency: user.currency,
          status: user.status,
        },
      };
    } catch (error) {
      throw error;
    }
  },

  async verifySession(userId) {
    try {
      const user = await UserModel.findById(userId);

      if (!user) {
        throw new Error("User not found");
      }

      return {
        id: user.id,
        username: user.username,
        full_name: user.full_name,
        email: user.email,
        currency: user.currency,
        status: user.status,
      };
    } catch (error) {
      throw error;
    }
  },
};
