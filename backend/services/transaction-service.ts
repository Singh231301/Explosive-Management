import { Prisma, TransactionType } from "@prisma/client";
import { prisma } from "@/db/prisma";
import { transactionSchema } from "@/validations/schemas";

function signedQuantity(type: TransactionType, quantity: number) {
  if (type === TransactionType.PURCHASE || type === TransactionType.ADJUSTMENT) return quantity;
  return quantity * -1;
}

function makeReferenceNo(type: TransactionType) {
  const prefix = type === TransactionType.PURCHASE ? "PUR" : type === TransactionType.USAGE ? "USE" : type === TransactionType.TRANSFER ? "TRF" : "ADJ";
  const stamp = new Date().toISOString().replace(/[-:TZ.]/g, "").slice(0, 14);
  return `${prefix}-${stamp}`;
}

export function mapTransactionRecord(row: Prisma.TransactionGetPayload<{ include: { items: { include: { product: true } }; supplier: true; customer: true } }>) {
  return {
    id: row.id,
    type: row.type,
    referenceNo: row.referenceNo,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
    supplierId: row.supplierId,
    customerId: row.customerId,
    supplierName: row.supplier?.name ?? null,
    customerName: row.customer?.name ?? null,
    notes: row.notes,
    warehouseId: row.warehouseId,
    totalQuantity: row.items.reduce((sum, item) => sum + Number(item.quantity), 0),
    items: row.items.map((item) => ({
      id: item.id,
      productId: item.productId,
      quantity: Number(item.quantity),
      pricePerUnit: Number(item.pricePerUnit ?? 0),
      product: { name: item.product.name }
    }))
  };
}

async function reverseTransaction(tx: Prisma.TransactionClient, transactionId: string) {
  const existing = await tx.transaction.findUnique({
    where: { id: transactionId },
    include: { items: true, inventoryLedger: true }
  });

  if (!existing) throw new Error("Transaction not found");

  for (const ledger of existing.inventoryLedger) {
    const inventoryRow = await tx.inventory.findUnique({
      where: { productId_warehouseId: { productId: ledger.productId, warehouseId: ledger.warehouseId } }
    });

    if (!inventoryRow) continue;
    const nextBalance = Number(inventoryRow.quantity) - Number(ledger.changeQuantity);
    if (nextBalance < 0) throw new Error("Cannot reverse transaction because stock would become negative");

    await tx.inventory.update({ where: { id: inventoryRow.id }, data: { quantity: nextBalance } });
  }

  await tx.inventoryLedger.deleteMany({ where: { transactionId } });
  await tx.financialLedger.deleteMany({ where: { transactionId } });
  await tx.transactionItem.deleteMany({ where: { transactionId } });

  return existing;
}

async function applyTransaction(tx: Prisma.TransactionClient, transactionId: string, input: unknown, createdBy: string, keepReferenceNo?: string) {
  const data = transactionSchema.parse(input);
  const referenceNo = keepReferenceNo || data.referenceNo || makeReferenceNo(data.type);

  await tx.transaction.update({
    where: { id: transactionId },
    data: {
      type: data.type,
      referenceNo,
      warehouseId: data.warehouseId,
      createdBy,
      supplierId: data.supplierId ?? null,
      customerId: data.customerId ?? null,
      notes: data.notes ?? null,
      deletedAt: null
    }
  });

  let totalAmount = new Prisma.Decimal(0);

  for (const item of data.items) {
    await tx.transactionItem.create({
      data: {
        transactionId,
        productId: item.productId,
        quantity: item.quantity,
        pricePerUnit: item.pricePerUnit ?? 0
      }
    });

    const inventoryRow = await tx.inventory.upsert({
      where: { productId_warehouseId: { productId: item.productId, warehouseId: data.warehouseId } },
      update: {},
      create: { productId: item.productId, warehouseId: data.warehouseId, quantity: 0 }
    });

    const nextBalance = Number(inventoryRow.quantity) + signedQuantity(data.type, item.quantity);
    if (nextBalance < 0) throw new Error("Stock cannot become negative");

    await tx.inventory.update({ where: { id: inventoryRow.id }, data: { quantity: nextBalance } });
    await tx.inventoryLedger.create({ data: { productId: item.productId, warehouseId: data.warehouseId, transactionId, changeQuantity: signedQuantity(data.type, item.quantity), balanceAfter: nextBalance } });

    totalAmount = totalAmount.add(new Prisma.Decimal(item.quantity).mul(new Prisma.Decimal(item.pricePerUnit ?? 0)));
  }

  await tx.financialLedger.create({
    data: {
      transactionId,
      debit: data.type === TransactionType.PURCHASE ? totalAmount : 0,
      credit: data.type === TransactionType.USAGE ? totalAmount : 0,
      description: `${data.type.toLowerCase()} transaction ${referenceNo}`
    }
  });

  return tx.transaction.findUnique({ where: { id: transactionId }, include: { items: { include: { product: true } }, supplier: true, customer: true } });
}

export async function createInventoryTransaction(input: unknown, createdBy: string) {
  return prisma.$transaction(async (tx) => {
    const transaction = await tx.transaction.create({
      data: {
        type: TransactionType.PURCHASE,
        referenceNo: `TMP-${Date.now()}`,
        warehouseId: transactionSchema.parse(input).warehouseId,
        createdBy
      }
    });

    return applyTransaction(tx, transaction.id, input, createdBy);
  });
}

export async function updateInventoryTransaction(id: string, input: unknown, createdBy: string) {
  return prisma.$transaction(async (tx) => {
    const existing = await tx.transaction.findUnique({ where: { id } });
    if (!existing) throw new Error("Transaction not found");
    await reverseTransaction(tx, id);
    return applyTransaction(tx, id, input, createdBy, existing.referenceNo);
  });
}

export async function deleteInventoryTransaction(id: string) {
  return prisma.$transaction(async (tx) => {
    await reverseTransaction(tx, id);
    return tx.transaction.update({ where: { id }, data: { deletedAt: new Date(), notes: "Deleted for correction" } });
  });
}

export async function listTransactions() {
  const rows = await prisma.transaction.findMany({ where: { deletedAt: null }, include: { items: { include: { product: true } }, supplier: true, customer: true }, orderBy: { createdAt: "desc" }, take: 50 });
  return rows.map(mapTransactionRecord);
}
