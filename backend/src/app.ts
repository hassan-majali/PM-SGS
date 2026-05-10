import express from "express";
import cors from "cors";
import path from "path";
import { errorHandler } from "./middleware/errorHandler";
import routes from "./routes";

const app = express();

const allowedOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(",").map(o => o.trim())
  : ["http://localhost:5173"];

app.use(cors({ origin: allowedOrigins, credentials: true }));
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));

// Serve uploaded files statically
app.use("/uploads", express.static(path.join(__dirname, "../uploads")));

app.use("/api/v1", routes);

app.use(errorHandler);

export default app;
