import type { Request, Response } from "express";
import { verifyAccessToken } from "@/auth/session";
import { getReports } from "@/services/report-service";
import { generateBackupCsv } from "@/services/backup-service";

async function hasValidToken(authHeader?: string) {
  if (!authHeader?.startsWith("Bearer ")) return false;
  try {
    await verifyAccessToken(authHeader.replace("Bearer ", "").trim());
    return true;
  } catch {
    return false;
  }
}

export async function backupController(req: Request, res: Response) {
  const allowedByToken = await hasValidToken(req.headers.authorization);
  const allowedBySecret = req.headers["x-backup-secret"] === process.env.BACKUP_SECRET;
  if (!allowedByToken && !allowedBySecret) {
    return res.status(401).send("Unauthorized");
  }

  const csv = await generateBackupCsv();
  res.setHeader("Content-Type", "text/csv");
  res.setHeader("Content-Disposition", `attachment; filename="backup-${new Date().toISOString().slice(0, 10)}.csv"`);
  return res.send(csv);
}

export async function reportsExportController(req: Request, res: Response) {
  const format = String(req.query.format || "excel");
  const data = await getReports();

  if (format === "excel") {
    const csv = ["\"Product\",\"Quantity\"", ...data.inventory.map((row) => `\"${row.product.name}\",\"${row.quantity}\"`)].join("\n");
    res.setHeader("Content-Type", "text/csv");
    res.setHeader("Content-Disposition", 'attachment; filename="inventory-report.csv"');
    return res.send(csv);
  }

  const html = `<!doctype html><html><body><h1>Printable Report</h1>${data.inventory.map((row) => `<p>${row.product.name}: ${row.quantity}</p>`).join("")}<script>window.print()</script></body></html>`;
  res.setHeader("Content-Type", "text/html; charset=utf-8");
  return res.send(html);
}
