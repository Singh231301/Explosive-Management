import { Router } from "express";
import { requireAuth } from "@/auth/guard";
import { asyncRoute } from "@/utils/async-route";
import { createProductController, deleteProductController, listProductsController, updateProductController } from "@/controllers/product-controller";

const router = Router();
router.get("/", requireAuth, asyncRoute(listProductsController));
router.post("/", requireAuth, asyncRoute(createProductController));
router.put("/:id", requireAuth, asyncRoute(updateProductController));
router.delete("/:id", requireAuth, asyncRoute(deleteProductController));
export default router;
