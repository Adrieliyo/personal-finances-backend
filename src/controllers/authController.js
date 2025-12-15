import { AuthService } from "../services/authService.js";
import { UserService } from "../services/userService.js";
import { getLocalTime } from "../utils/dateFormatter.js";

export const AuthController = {
  async register(req, res) {
    try {
      const user = await UserService.createUser(req.body);
      console.log(`[${getLocalTime()}] User registered: ${user.email}`);
      res.status(201).json({
        success: true,
        data: user,
        message:
          "Registered user. Please check your email to activate your account.",
      });
    } catch (error) {
      console.error(
        `[${getLocalTime()}] Error registering user:`,
        error.message
      );
      res.status(400).json({
        success: false,
        error: error.message,
      });
    }
  },

  async signIn(req, res) {
    try {
      const { emailOrUsername, password } = req.body;

      if (!emailOrUsername || !password) {
        return res.status(400).json({
          success: false,
          message: "Email/Username and password are required",
        });
      }

      const result = await AuthService.signIn(emailOrUsername, password);

      console.log(
        `[${getLocalTime()}] User logged in: ${result.user.username}`
      );

      // Guardar token en cookie
      res
        .cookie("token", result.token, {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production", // true en producción
          sameSite: "lax",
          maxAge: 24 * 60 * 60 * 1000, // 1 día
        })
        .json({
          success: true,
          data: result.user,
          message: "Login successful",
        });
    } catch (error) {
      console.error(`[${getLocalTime()}] Login error:`, error.message);

      const statusCode =
        error.message === "User not found" ||
        error.message === "Password incorrect"
          ? 401
          : error.message.includes("activate") ||
            error.message.includes("suspended") ||
            error.message.includes("status")
          ? 403
          : 500;

      res.status(statusCode).json({
        success: false,
        message: error.message,
      });
    }
  },

  async logout(req, res) {
    try {
      console.log(`[${getLocalTime()}] User logged out: ${req.user.username}`);

      res
        .cookie("token", "", {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: "lax",
          expires: new Date(0),
        })
        .json({
          success: true,
          message: "Logout successful",
        });
    } catch (error) {
      console.error(`[${getLocalTime()}] Logout error:`, error.message);
      res.status(500).json({
        success: false,
        message: "Error during logout",
      });
    }
  },

  async verifyToken(req, res) {
    try {
      const user = await AuthService.verifySession(req.user.id);

      res.json({
        success: true,
        data: user,
      });
    } catch (error) {
      console.error(`[${getLocalTime()}] Verify token error:`, error.message);
      res.status(401).json({
        success: false,
        message: "Invalid session",
      });
    }
  },

  async activateAccount(req, res) {
    try {
      const { token } = req.params;
      const user = await UserService.activateAccount(token);
      console.log(`[${getLocalTime()}] Account activated: ${user.email}`);
      res.status(200).json({
        success: true,
        data: user,
        message: "Account successfully activated",
      });
    } catch (error) {
      console.error(
        `[${getLocalTime()}] Error activating account:`,
        error.message
      );
      res.status(400).json({
        success: false,
        error: error.message,
      });
    }
  },
};
