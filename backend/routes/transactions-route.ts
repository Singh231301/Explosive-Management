import { Router } from "express";
import { requireAuth } from "@/auth/guard";
import { asyncRoute } from "@/utils/async-route";
import { createTransactionController, deleteTransactionController, listTransactionsController, updateTransactionController } from "@/controllers/transaction-controller";

const router = Router();
router.get("/", requireAuth, asyncRoute(listTransactionsController));
router.post("/", requireAuth, asyncRoute(createTransactionController));
router.put("/:id", requireAuth, asyncRoute(updateTransactionController));
router.delete("/:id", requireAuth, asyncRoute(deleteTransactionController));
export default router;
