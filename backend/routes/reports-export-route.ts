import { Router } from "express";
import { requireAuth } from "@/auth/guard";
import { asyncRoute } from "@/utils/async-route";
import { reportsExportController } from "@/controllers/backup-controller";

const router = Router();
router.get("/", requireAuth, asyncRoute(reportsExportController));
export default router;
