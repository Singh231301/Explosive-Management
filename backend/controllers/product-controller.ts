import type { Request, Response } from "express";
import { createProduct, deleteProduct, listProducts, updateProduct } from "../services/product-service";

function getId(req: Request) {
  return String(req.params.id || "");
}

export async function listProductsController(_req: Request, res: Response) {
  res.json({ success: true, data: await listProducts() });
}

export async function createProductController(req: Request, res: Response) {
  res.status(201).json({ success: true, data: await createProduct(req.body) });
}

export async function updateProductController(req: Request, res: Response) {
  res.json({ success: true, data: await updateProduct(getId(req), req.body) });
}

export async function deleteProductController(req: Request, res: Response) {
  res.json({ success: true, data: await deleteProduct(getId(req)) });
}

