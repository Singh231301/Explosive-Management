import "dotenv/config";
import cors from "cors";
import express from "express";
import helmet from "helmet";
import morgan from "morgan";
import { ZodError } from "zod";
import authRoutes from "./routes/auth-login-route";
import backupRoutes from "./routes/backup-route";
import customersRoutes from "./routes/customers-route";
import inventoryRoutes from "./routes/inventory-route";
import productsRoutes from "./routes/products-route";
import reportsExportRoutes from "./routes/reports-export-route";
import reportsRoutes from "./routes/reports-route";
import suppliersRoutes from "./routes/suppliers-route";
import transactionsRoutes from "./routes/transactions-route";
import usersRoutes from "./routes/users-route";
import warehousesRoutes from "./routes/warehouses-route";
import { HttpError } from "./utils/http-error";

function getAllowedOrigins() {
  return (process.env.FRONTEND_URL || "http://localhost:3000")
    .split(",")
    .map((value) => value.trim())
    .filter(Boolean);
}

export function createApp() {
  const app = express();
  const allowedOrigins = getAllowedOrigins();

  app.use(
    cors({
      origin(origin, callback) {
        if (!origin || allowedOrigins.includes(origin)) {
          callback(null, true);
          return;
        }
        callback(new HttpError(403, "Origin not allowed"));
      }
    })
  );
  app.use(helmet());
  app.use(morgan("tiny"));
  app.use(express.json({ limit: "1mb" }));

  app.get("/health", (_req, res) => res.json({ ok: true }));
  app.use("/api/auth", authRoutes);
  app.use("/api/products", productsRoutes);
  app.use("/api/suppliers", suppliersRoutes);
  app.use("/api/customers", customersRoutes);
  app.use("/api/users", usersRoutes);
  app.use("/api/warehouses", warehousesRoutes);
  app.use("/api/inventory", inventoryRoutes);
  app.use("/api/transactions", transactionsRoutes);
  app.use("/api/reports", reportsRoutes);
  app.use("/api/reports/export", reportsExportRoutes);
  app.use("/api/backup", backupRoutes);

  app.use((req, res) => {
    res.status(404).json({ success: false, message: `Route not found: ${req.method} ${req.originalUrl}` });
  });

  app.use((error: unknown, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
    if (error instanceof ZodError) {
      return res.status(422).json({
        success: false,
        message: error.issues[0]?.message || "Validation failed"
      });
    }

    if (error instanceof HttpError) {
      return res.status(error.status).json({ success: false, message: error.message });
    }

    const message = error instanceof Error ? error.message : "Unexpected server error";
    const lowered = message.toLowerCase();

    if (lowered.includes("unauthorized") || lowered.includes("invalid token")) {
      return res.status(401).json({ success: false, message });
    }

    if (lowered.includes("forbidden")) {
      return res.status(403).json({ success: false, message });
    }

    if (lowered.includes("not found")) {
      return res.status(404).json({ success: false, message });
    }

    if (lowered.includes("already exists")) {
      return res.status(409).json({ success: false, message });
    }

    console.error(error);
    return res.status(500).json({ success: false, message: "Unexpected server error" });
  });

  return app;
}

const app = createApp();

export default app;

