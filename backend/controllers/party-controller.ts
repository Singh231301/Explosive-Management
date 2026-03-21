import type { Request, Response } from "express";
import { createCustomer, createSupplier, deleteCustomer, deleteSupplier, listCustomers, listSuppliers, updateCustomer, updateSupplier } from "@/services/party-service";

function getId(req: Request) {
  return String(req.params.id || "");
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
