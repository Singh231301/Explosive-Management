import { prisma } from "@/db/prisma";
import { mapTransactionRecord } from "@/services/transaction-service";
import { partySchema } from "@/validations/schemas";

function normalize(data: { name: string; phone?: string | null; address?: string | null }) {
  return {
    name: data.name.trim(),
    phone: data.phone?.trim() || null,
    address: data.address?.trim() || null
  };
}

async function listPartyTransactions(kind: "supplier" | "customer", id: string, page: number, pageSize: number) {
  const where = kind === "supplier" ? { supplierId: id, deletedAt: null } : { customerId: id, deletedAt: null };
  const skip = (page - 1) * pageSize;

  const [total, rows] = await Promise.all([
    prisma.transaction.count({ where }),
    prisma.transaction.findMany({
      where,
      include: { items: { include: { product: true } }, supplier: true, customer: true },
      orderBy: { createdAt: "desc" },
      skip,
      take: pageSize
    })
  ]);

  return {
    page,
    pageSize,
    total,
    totalPages: Math.max(1, Math.ceil(total / pageSize)),
    items: rows.map(mapTransactionRecord)
  };
}

export async function listSuppliers() {
  return prisma.supplier.findMany({ where: { deletedAt: null }, orderBy: { name: "asc" } });
}

export async function createSupplier(input: unknown) {
  const data = normalize(partySchema.parse(input));
  return prisma.supplier.create({ data });
}

export async function updateSupplier(id: string, input: unknown) {
  const data = normalize(partySchema.parse(input));
  return prisma.supplier.update({ where: { id }, data });
}

export async function deleteSupplier(id: string) {
  const linked = await prisma.transaction.findFirst({ where: { supplierId: id, deletedAt: null } });
  if (linked) throw new Error("Supplier is used in transactions. Edit instead of delete.");
  return prisma.supplier.update({ where: { id }, data: { deletedAt: new Date() } });
}

export async function listSupplierTransactions(id: string, page = 1, pageSize = 10) {
  return listPartyTransactions("supplier", id, page, pageSize);
}

export async function listCustomers() {
  return prisma.customer.findMany({ where: { deletedAt: null }, orderBy: { name: "asc" } });
}

export async function createCustomer(input: unknown) {
  const data = normalize(partySchema.parse(input));
  return prisma.customer.create({ data });
}

export async function updateCustomer(id: string, input: unknown) {
  const data = normalize(partySchema.parse(input));
  return prisma.customer.update({ where: { id }, data });
}

export async function deleteCustomer(id: string) {
  const linked = await prisma.transaction.findFirst({ where: { customerId: id, deletedAt: null } });
  if (linked) throw new Error("Customer is used in transactions. Edit instead of delete.");
  return prisma.customer.update({ where: { id }, data: { deletedAt: new Date() } });
}

export async function listCustomerTransactions(id: string, page = 1, pageSize = 10) {
  return listPartyTransactions("customer", id, page, pageSize);
}
