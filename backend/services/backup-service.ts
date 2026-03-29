import { prisma } from "../db/prisma";

function toCsvRow(values: Array<string | number | null | undefined>) {
  return values.map((value) => `"${String(value ?? "").replace(/"/g, '""')}"`).join(",");
}

export async function generateBackupCsv() {
  const [products, inventory, transactions, ledger] = await Promise.all([
    prisma.product.findMany({ where: { deletedAt: null }, orderBy: { name: "asc" } }),
    prisma.inventory.findMany({ include: { product: true, warehouse: true } }),
    prisma.transaction.findMany({ include: { items: true }, orderBy: { createdAt: "desc" } }),
    prisma.inventoryLedger.findMany({ orderBy: { createdAt: "desc" }, take: 500 })
  ]);

  return [
    "PRODUCTS",
    toCsvRow(["Name", "Unit", "Description"]),
    ...products.map((row) => toCsvRow([row.name, row.unit, row.description])),
    "",
    "INVENTORY",
    toCsvRow(["Product", "Warehouse", "Quantity"]),
    ...inventory.map((row) => toCsvRow([row.product.name, row.warehouse.name, Number(row.quantity)])),
    "",
    "TRANSACTIONS",
    toCsvRow(["Reference", "Type", "Warehouse", "Created At"]),
    ...transactions.map((row) => toCsvRow([row.referenceNo, row.type, row.warehouseId, row.createdAt.toISOString()])),
    "",
    "LEDGER",
    toCsvRow(["Transaction", "Product", "Change", "Balance", "Created At"]),
    ...ledger.map((row) => toCsvRow([row.transactionId, row.productId, Number(row.changeQuantity), Number(row.balanceAfter), row.createdAt.toISOString()]))
  ].join("\n");
}

