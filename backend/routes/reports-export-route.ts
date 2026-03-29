import { Router } from "express";
import { requireAuth, requireRole } from "../auth/guard";
import { asyncRoute } from "../utils/async-route";
import { reportsExportController } from "../controllers/backup-controller";
import { createRateLimit } from "../middleware/rate-limit";

const router = Router();
router.get("/", requireAuth, requireRole("ADMIN"), createRateLimit({ windowMs: 60 * 1000, max: 10, message: "Too many export requests. Please try again later." }), asyncRoute(reportsExportController));
export default router;

