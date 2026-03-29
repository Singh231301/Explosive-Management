import "dotenv/config";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import authRoutes from "@/routes/auth-login-route";
import productsRoutes from "@/routes/products-route";
import suppliersRoutes from "@/routes/suppliers-route";
import customersRoutes from "@/routes/customers-route";
import inventoryRoutes from "@/routes/inventory-route";
import transactionsRoutes from "@/routes/transactions-route";
import reportsRoutes from "@/routes/reports-route";
import reportsExportRoutes from "@/routes/reports-export-route";
import backupRoutes from "@/routes/backup-route";
import warehousesRoutes from "@/routes/warehouses-route";

const app = express();
const port = Number(process.env.PORT || 4000);

app.use(cors({ origin: process.env.FRONTEND_URL || "http://localhost:3000" }));
app.use(helmet());
app.use(morgan("dev"));
app.use(express.json());

app.get("/health", (_req, res) => res.json({ ok: true }));
app.use("/api/auth", authRoutes);
app.use("/api/products", productsRoutes);
app.use("/api/suppliers", suppliersRoutes);
app.use("/api/customers", customersRoutes);
app.use("/api/warehouses", warehousesRoutes);
app.use("/api/inventory", inventoryRoutes);
app.use("/api/transactions", transactionsRoutes);
app.use("/api/reports", reportsRoutes);
app.use("/api/reports/export", reportsExportRoutes);
app.use("/api/backup", backupRoutes);

app.use((error: unknown, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  const message = error instanceof Error ? error.message : "Unexpected server error";
  res.status(400).json({ success: false, message });
});

app.listen(port, () => {
  console.log(`Backend running on http://localhost:${port}`);
});
