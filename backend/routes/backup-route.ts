import { Router } from "express";
import { requireAuth, requireRole } from "../auth/guard";
import { asyncRoute } from "../utils/async-route";
import { backupController } from "../controllers/backup-controller";
import { createRateLimit } from "../middleware/rate-limit";

const router = Router();
router.get("/", requireAuth, requireRole("ADMIN"), createRateLimit({ windowMs: 60 * 1000, max: 5, message: "Too many backup requests. Please try again later." }), asyncRoute(backupController));
export default router;

