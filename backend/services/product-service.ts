import { prisma } from "../db/prisma";
import { productSchema } from "../validations/schemas";

export async function listProducts() {
  return prisma.product.findMany({ where: { deletedAt: null }, orderBy: { name: "asc" } });
}

export async function createProduct(input: unknown) {
  const parsed = productSchema.parse(input);
  const normalizedName = parsed.name.trim();

  const existing = await prisma.product.findFirst({
    where: {
      deletedAt: null,
      name: { equals: normalizedName, mode: "insensitive" }
    }
  });

  if (existing) throw new Error("Product already exists. Please use a different name.");

  return prisma.product.create({
    data: { ...parsed, name: normalizedName, description: parsed.description?.trim() || null }
  });
}

export async function updateProduct(id: string, input: unknown) {
  const parsed = productSchema.parse(input);
  const normalizedName = parsed.name.trim();

  const existing = await prisma.product.findFirst({
    where: {
      deletedAt: null,
      id: { not: id },
      name: { equals: normalizedName, mode: "insensitive" }
    }
  });

  if (existing) throw new Error("Product already exists. Please use a different name.");

  return prisma.product.update({
    where: { id },
    data: { ...parsed, name: normalizedName, description: parsed.description?.trim() || null }
  });
}

export async function deleteProduct(id: string) {
  const linked = await prisma.transactionItem.findFirst({ where: { productId: id } });
  if (linked) throw new Error("Product already used in transactions. Edit instead of delete.");

  return prisma.product.update({ where: { id }, data: { deletedAt: new Date() } });
}

