import { Router } from "express";
import { requireAuth, requireRole } from "@/auth/guard";
import { asyncRoute } from "@/utils/async-route";
import { createProductController, deleteProductController, listProductsController, updateProductController } from "@/controllers/product-controller";

const router = Router();
router.get("/", requireAuth, asyncRoute(listProductsController));
router.post("/", requireAuth, requireRole("ADMIN"), asyncRoute(createProductController));
router.put("/:id", requireAuth, requireRole("ADMIN"), asyncRoute(updateProductController));
router.delete("/:id", requireAuth, requireRole("ADMIN"), asyncRoute(deleteProductController));
export default router;
