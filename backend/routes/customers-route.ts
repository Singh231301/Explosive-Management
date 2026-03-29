import { Router } from "express";
import { requireAuth, requireRole } from "../auth/guard";
import { asyncRoute } from "../utils/async-route";
import { createCustomerController, deleteCustomerController, listCustomerTransactionsController, listCustomersController, updateCustomerController } from "../controllers/party-controller";

const router = Router();
router.get("/", requireAuth, asyncRoute(listCustomersController));
router.get("/:id/transactions", requireAuth, asyncRoute(listCustomerTransactionsController));
router.post("/", requireAuth, requireRole("ADMIN", "OPERATOR"), asyncRoute(createCustomerController));
router.put("/:id", requireAuth, requireRole("ADMIN", "OPERATOR"), asyncRoute(updateCustomerController));
router.delete("/:id", requireAuth, requireRole("ADMIN", "OPERATOR"), asyncRoute(deleteCustomerController));
export default router;

