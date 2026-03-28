import { Router } from "express";
import { requireAuth } from "@/auth/guard";
import { asyncRoute } from "@/utils/async-route";
import { billingReportController, billingReportPdfController, reportsController } from "@/controllers/report-controller";

const router = Router();
router.get("/", requireAuth, asyncRoute(reportsController));
router.get("/billing", requireAuth, asyncRoute(billingReportController));
router.get("/billing/pdf", requireAuth, asyncRoute(billingReportPdfController));
export default router;
