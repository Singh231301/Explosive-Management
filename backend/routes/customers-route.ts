import { Router } from "express";
import { requireAuth } from "@/auth/guard";
import { asyncRoute } from "@/utils/async-route";
import { createCustomerController, deleteCustomerController, listCustomerTransactionsController, listCustomersController, updateCustomerController } from "@/controllers/party-controller";

const router = Router();
router.get("/", requireAuth, asyncRoute(listCustomersController));
router.get("/:id/transactions", requireAuth, asyncRoute(listCustomerTransactionsController));
router.post("/", requireAuth, asyncRoute(createCustomerController));
router.put("/:id", requireAuth, asyncRoute(updateCustomerController));
router.delete("/:id", requireAuth, asyncRoute(deleteCustomerController));
export default router;
