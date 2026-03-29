import { Router } from "express";
import { requireAuth, requireRole } from "../auth/guard";
import { asyncRoute } from "../utils/async-route";
import { createWarehouseController, listWarehousesController } from "../controllers/warehouse-controller";

const router = Router();
router.get("/", requireAuth, asyncRoute(listWarehousesController));
router.post("/", requireAuth, requireRole("ADMIN"), asyncRoute(createWarehouseController));
export default router;

