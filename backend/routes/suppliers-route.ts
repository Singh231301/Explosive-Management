import { Router } from "express";
import { requireAuth } from "@/auth/guard";
import { asyncRoute } from "@/utils/async-route";
import { createSupplierController, deleteSupplierController, listSupplierTransactionsController, listSuppliersController, updateSupplierController } from "@/controllers/party-controller";

const router = Router();
router.get("/", requireAuth, asyncRoute(listSuppliersController));
router.get("/:id/transactions", requireAuth, asyncRoute(listSupplierTransactionsController));
router.post("/", requireAuth, asyncRoute(createSupplierController));
router.put("/:id", requireAuth, asyncRoute(updateSupplierController));
router.delete("/:id", requireAuth, asyncRoute(deleteSupplierController));
export default router;
