import { prisma } from "@/db/prisma";
import { warehouseSchema } from "@/validations/schemas";

function normalize(input: unknown) {
  const data = warehouseSchema.parse(input);
  return {
    name: data.name.trim(),
    location: data.location?.trim() || null
  };
}

function makeWarehouseId(name: string) {
  const slug = name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "") || "warehouse";
  return `${slug}-${Date.now()}`;
}

export async function listWarehouses() {
  return prisma.warehouse.findMany({ where: { deletedAt: null }, orderBy: { name: "asc" } });
}

export async function createWarehouse(input: unknown) {
  const data = normalize(input);
  const existing = await prisma.warehouse.findFirst({ where: { name: { equals: data.name, mode: "insensitive" }, deletedAt: null } });
  if (existing) throw new Error("Warehouse already exists");

  return prisma.warehouse.create({
    data: {
      id: makeWarehouseId(data.name),
      name: data.name,
      location: data.location
    }
  });
}
