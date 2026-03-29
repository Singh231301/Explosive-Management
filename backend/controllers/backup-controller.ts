import type { Response } from "express";
import type { AuthenticatedRequest } from "../auth/guard";
import { getReports } from "../services/report-service";
import { generateBackupCsv } from "../services/backup-service";
import { logAuditEvent } from "../utils/audit-log";

export async function backupController(req: AuthenticatedRequest, res: Response) {
  const csv = await generateBackupCsv();
  logAuditEvent("backup.downloaded", { actorId: req.user?.id, actorEmail: req.user?.email });
  res.setHeader("Content-Type", "text/csv");
  res.setHeader("Content-Disposition", `attachment; filename="backup-${new Date().toISOString().slice(0, 10)}.csv"`);
  return res.send(csv);
}

export async function reportsExportController(req: AuthenticatedRequest, res: Response) {
  const format = String(req.query.format || "excel");
  const data = await getReports();
  logAuditEvent("report.exported", { actorId: req.user?.id, actorEmail: req.user?.email, format });

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

