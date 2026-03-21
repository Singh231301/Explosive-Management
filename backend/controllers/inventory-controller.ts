import type { Request, Response } from "express";
import { getDashboardMetrics, getInventorySummary, updateInventoryLimit } from "@/services/inventory-service";

export async function inventorySummaryController(_req: Request, res: Response) {
  res.json({ success: true, data: await getInventorySummary() });
}

export async function inventoryDashboardController(_req: Request, res: Response) {
  res.json({ success: true, data: await getDashboardMetrics() });
}

export async function inventoryLimitController(req: Request, res: Response) {
  const productId = String(req.params.productId || "");
  const maxLimit = req.body.maxLimit === null || req.body.maxLimit === "" ? null : Number(req.body.maxLimit);
  const lowLimit = req.body.lowLimit === null || req.body.lowLimit === "" ? null : Number(req.body.lowLimit);

  res.json({ success: true, data: await updateInventoryLimit(productId, maxLimit, lowLimit) });
}
