import type { Request, Response } from "express";
import { createCustomer, createSupplier, deleteCustomer, deleteSupplier, listCustomers, listCustomerTransactions, listSuppliers, listSupplierTransactions, updateCustomer, updateSupplier } from "@/services/party-service";

function getId(req: Request) {
  return String(req.params.id || "");
}

function getPage(req: Request) {
  return Math.max(1, Number(req.query.page || 1));
}

function getPageSize(req: Request) {
  return Math.max(1, Number(req.query.pageSize || 10));
}

export async function listSuppliersController(_req: Request, res: Response) {
  res.json({ success: true, data: await listSuppliers() });
}

export async function createSupplierController(req: Request, res: Response) {
  res.status(201).json({ success: true, data: await createSupplier(req.body) });
}

export async function updateSupplierController(req: Request, res: Response) {
  res.json({ success: true, data: await updateSupplier(getId(req), req.body) });
}

export async function deleteSupplierController(req: Request, res: Response) {
  res.json({ success: true, data: await deleteSupplier(getId(req)) });
}

export async function listSupplierTransactionsController(req: Request, res: Response) {
  res.json({ success: true, data: await listSupplierTransactions(getId(req), getPage(req), getPageSize(req)) });
}

export async function listCustomersController(_req: Request, res: Response) {
  res.json({ success: true, data: await listCustomers() });
}

export async function createCustomerController(req: Request, res: Response) {
  res.status(201).json({ success: true, data: await createCustomer(req.body) });
}

export async function updateCustomerController(req: Request, res: Response) {
  res.json({ success: true, data: await updateCustomer(getId(req), req.body) });
}

export async function deleteCustomerController(req: Request, res: Response) {
  res.json({ success: true, data: await deleteCustomer(getId(req)) });
}

export async function listCustomerTransactionsController(req: Request, res: Response) {
  res.json({ success: true, data: await listCustomerTransactions(getId(req), getPage(req), getPageSize(req)) });
}
