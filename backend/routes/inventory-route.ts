import { Router } from "express";
import { requireAuth } from "@/auth/guard";
import { asyncRoute } from "@/utils/async-route";
import { inventoryDashboardController, inventoryLimitController, inventorySummaryController } from "@/controllers/inventory-controller";

const router = Router();
router.get("/", requireAuth, asyncRoute(inventorySummaryController));
router.get("/dashboard", requireAuth, asyncRoute(inventoryDashboardController));
router.put("/limits/:productId", requireAuth, asyncRoute(inventoryLimitController));
export default router;
