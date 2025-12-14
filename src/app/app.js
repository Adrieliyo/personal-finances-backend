import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { supabase } from "../config/supabase.js";
import userRoutes from "../routes/userRoutes.js";
import authRoutes from "../routes/authRoutes.js";

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

export { app };
