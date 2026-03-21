import { z } from "zod";
import { ProductUnit, TransactionType } from "@prisma/client";

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6)
});

export const productSchema = z.object({
  name: z.string().min(2),
  unit: z.nativeEnum(ProductUnit),
  description: z.string().optional().nullable()
});

export const partySchema = z.object({
  name: z.string().min(2),
  phone: z.string().optional().nullable(),
  address: z.string().optional().nullable()
});

export const transactionItemSchema = z.object({
  productId: z.string().min(1),
  quantity: z.coerce.number().positive(),
  pricePerUnit: z.coerce.number().min(0).optional()
});

export const transactionSchema = z.object({
  type: z.nativeEnum(TransactionType),
  referenceNo: z.string().min(3).optional().nullable(),
  warehouseId: z.string().min(1),
  supplierId: z.string().optional().nullable(),
  customerId: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
  items: z.array(transactionItemSchema).min(1)
});
