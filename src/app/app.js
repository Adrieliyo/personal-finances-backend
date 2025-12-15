import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { supabase } from "../config/supabase.js";
import userRoutes from "../routes/userRoutes.js";
import authRoutes from "../routes/authRoutes.js";
import accountRoutes from "../routes/accountRoutes.js";
import categoryRoutes from "../routes/categoryRoutes.js";
import budgetRoutes from "../routes/budgetRoutes.js";
import debtRoutes from "../routes/debtRoutes.js";
import goalRoutes from "../routes/goalRoutes.js";

const app = express();

// Middlewares
app.use(cookieParser());
app.use(
  cors({
    origin: "http://localhost:4000",
    credentials: true,
    allowedHeaders: [
      "Content-Type",
      "Authorization",
      "Access-Control-Allow-Origin",
    ],
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
  })
);
app.use(express.json());

// Routes
app.get("/health", (req, res) => {
  res.send("Server Status OK");
});

app.use("/api/users", userRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/accounts", accountRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/budgets", budgetRoutes);
app.use("/api/debts", debtRoutes);
app.use("/api/goals", goalRoutes);

export { app };
