import { verifyToken } from "../utils/jwt.js";

export const authRequired = async (req, res, next) => {
  try {
    const token = req.cookies.token;

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "No token provided, authorization denied",
      });
    }

    const decoded = await verifyToken(token);
    req.user = decoded; // Guardar los datos del usuario en req.user

    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: "Invalid token",
      error: error.message,
    });
  }
};
