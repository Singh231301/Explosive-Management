import { Router } from "express";
import { requireAuth, requireRole } from "../auth/guard";
import { asyncRoute } from "../utils/async-route";
import { createTransactionController, deleteTransactionController, listTransactionsController, updateTransactionController } from "../controllers/transaction-controller";
import { createRateLimit } from "../middleware/rate-limit";

const router = Router();
router.get("/", requireAuth, asyncRoute(listTransactionsController));
router.post("/", requireAuth, requireRole("ADMIN", "OPERATOR"), createRateLimit({ windowMs: 60 * 1000, max: 30, message: "Too many transaction requests. Please slow down." }), asyncRoute(createTransactionController));
router.put("/:id", requireAuth, requireRole("ADMIN", "OPERATOR"), asyncRoute(updateTransactionController));
router.delete("/:id", requireAuth, requireRole("ADMIN", "OPERATOR"), asyncRoute(deleteTransactionController));
export default router;

