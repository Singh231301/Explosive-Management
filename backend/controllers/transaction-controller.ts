import type { Response } from "express";
import type { AuthenticatedRequest } from "../auth/guard";
import { createInventoryTransaction, deleteInventoryTransaction, listTransactions, updateInventoryTransaction } from "../services/transaction-service";

function getId(req: AuthenticatedRequest) {
  return String(req.params.id || "");
}

export async function listTransactionsController(_req: AuthenticatedRequest, res: Response) {
  res.json({ success: true, data: await listTransactions() });
}

export async function createTransactionController(req: AuthenticatedRequest, res: Response) {
  res.status(201).json({ success: true, data: await createInventoryTransaction(req.body, req.user!.id) });
}

export async function updateTransactionController(req: AuthenticatedRequest, res: Response) {
  res.json({ success: true, data: await updateInventoryTransaction(getId(req), req.body, req.user!.id) });
}

export async function deleteTransactionController(req: AuthenticatedRequest, res: Response) {
  res.json({ success: true, data: await deleteInventoryTransaction(getId(req)) });
}

