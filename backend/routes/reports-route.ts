import { Router } from "express";
import { requireAuth } from "@/auth/guard";
import { asyncRoute } from "@/utils/async-route";
import { reportsController } from "@/controllers/report-controller";

const router = Router();
router.get("/", requireAuth, asyncRoute(reportsController));
export default router;
