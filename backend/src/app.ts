import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import path from "path";
import { errorHandler } from "./middleware/errorHandler";
import { authenticate } from "./middleware/authenticate";
import authRoutes from "./routes/auth.routes";
import routes from "./routes";

const app = express();

const allowedOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(",").map(o => o.trim())
  : ["http://localhost:5173"];

app.use(cors({ origin: allowedOrigins, credentials: true }));
app.use(cookieParser());
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));

app.use("/uploads", express.static(path.join(__dirname, "../uploads")));

app.get("/health", (_req, res) => { res.json({ ok: true }); });

// Public auth routes (login, refresh, logout)
app.use("/api/v1/auth", authRoutes);

// All other routes require authentication
app.use("/api/v1", authenticate, routes);

app.use(errorHandler);

export default app;
