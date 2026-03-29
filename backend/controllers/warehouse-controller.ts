import type { Request, Response } from "express";
import { createWarehouse, listWarehouses } from "@/services/warehouse-service";

export async function listWarehousesController(_req: Request, res: Response) {
  res.json({ success: true, data: await listWarehouses() });
}

export async function createWarehouseController(req: Request, res: Response) {
  res.status(201).json({ success: true, data: await createWarehouse(req.body) });
}
