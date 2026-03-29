import type { Request, Response } from "express";
import { getBillingReport, getBillingReportPdf, getReports } from "../services/report-service";

export async function reportsController(_req: Request, res: Response) {
  res.json({ success: true, data: await getReports() });
}

export async function billingReportController(req: Request, res: Response) {
  res.json({
    success: true,
    data: await getBillingReport({
      range: typeof req.query.range === "string" ? req.query.range : undefined,
      startDate: typeof req.query.startDate === "string" ? req.query.startDate : undefined,
      endDate: typeof req.query.endDate === "string" ? req.query.endDate : undefined,
      partyType: typeof req.query.partyType === "string" ? req.query.partyType : undefined,
      partyId: typeof req.query.partyId === "string" ? req.query.partyId : undefined,
      warehouseId: typeof req.query.warehouseId === "string" ? req.query.warehouseId : undefined
    })
  });
}

export async function billingReportPdfController(req: Request, res: Response) {
  const query = {
    range: typeof req.query.range === "string" ? req.query.range : undefined,
    startDate: typeof req.query.startDate === "string" ? req.query.startDate : undefined,
    endDate: typeof req.query.endDate === "string" ? req.query.endDate : undefined,
    partyType: typeof req.query.partyType === "string" ? req.query.partyType : undefined,
    partyId: typeof req.query.partyId === "string" ? req.query.partyId : undefined,
    warehouseId: typeof req.query.warehouseId === "string" ? req.query.warehouseId : undefined
  };
  const pdfBytes = await getBillingReportPdf(query);
  const disposition = req.query.download === "1" ? "attachment" : "inline";

  res.setHeader("Content-Type", "application/pdf");
  res.setHeader("Content-Disposition", `${disposition}; filename="billing-statement.pdf"`);
  res.send(Buffer.from(pdfBytes));
}

