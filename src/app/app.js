import express from "express";
import cors from "cors";
import { supabase } from "../config/supabase.js";
import userRoutes from "../routes/userRoutes.js";

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

// Routes
app.get("/health", (req, res) => {
  res.send("Server Status OK");
});

app.use("/api/users", userRoutes);

export { app };
