import { Router } from "express";
import { requireAuth } from "@/auth/guard";
import { asyncRoute } from "@/utils/async-route";
import { createCustomerController, deleteCustomerController, listCustomersController, updateCustomerController } from "@/controllers/party-controller";

const router = Router();
router.get("/", requireAuth, asyncRoute(listCustomersController));
router.post("/", requireAuth, asyncRoute(createCustomerController));
router.put("/:id", requireAuth, asyncRoute(updateCustomerController));
router.delete("/:id", requireAuth, asyncRoute(deleteCustomerController));
export default router;
