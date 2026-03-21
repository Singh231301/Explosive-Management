import type { Request, Response } from "express";
import { getReports } from "@/services/report-service";

export async function reportsController(_req: Request, res: Response) {
  res.json({ success: true, data: await getReports() });
}
