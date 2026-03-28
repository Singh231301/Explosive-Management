import { prisma } from "@/db/prisma";

type LimitRule = {
  maxLimit?: number | null;
  lowLimit?: number | null;
};

type LimitMap = Record<string, LimitRule>;

async function getLimitMap() {
  const raw = (await prisma.setting.findUnique({ where: { key: "inventory_limits_json" } }))?.value;
  if (!raw) return {} as LimitMap;

  try {
    return JSON.parse(raw) as LimitMap;
  } catch {
    return {} as LimitMap;
  }
}

export async function updateInventoryLimit(productId: string, maxLimit: number | null, lowLimit: number | null) {
  const map = await getLimitMap();
  map[productId] = { maxLimit, lowLimit };

  await prisma.setting.upsert({
    where: { key: "inventory_limits_json" },
    update: { value: JSON.stringify(map) },
    create: { key: "inventory_limits_json", value: JSON.stringify(map) }
  });

  return map[productId];
}

export async function getInventorySummary() {
  const rows = await prisma.inventory.findMany({ include: { product: true, warehouse: true }, orderBy: { updatedAt: "desc" } });
  const defaultLowStockThreshold = Number((await prisma.setting.findUnique({ where: { key: "low_stock_threshold" } }))?.value ?? 10);
  const limitMap = await getLimitMap();

  return rows.map((row) => {
    const limits = limitMap[row.productId] || {};
    const quantity = Number(row.quantity);
    const lowLimit = limits.lowLimit ?? defaultLowStockThreshold;
    const maxLimit = limits.maxLimit ?? null;

    return {
      id: row.id,
      productId: row.productId,
      productName: row.product.name,
      warehouseName: row.warehouse.name,
      unit: row.product.unit,
      quantity,
      lowLimit,
      maxLimit,
      isLowStock: quantity <= lowLimit,
      isOverLimit: maxLimit !== null ? quantity > maxLimit : false,
      updatedAt: row.updatedAt.toISOString()
    };
  });
}

export async function getDashboardMetrics() {
  const recentTransactions = await prisma.transaction.findMany({
    where: { deletedAt: null },
    include: { items: { include: { product: true } }, supplier: true, customer: true, warehouse: true },
    orderBy: { createdAt: "desc" },
    take: 5
  });

  return {
    recentTransactions: recentTransactions.map((row) => ({
      id: row.id,
      type: row.type,
      referenceNo: row.referenceNo,
      createdAt: row.createdAt.toISOString(),
      updatedAt: row.updatedAt.toISOString(),
      supplierId: row.supplierId,
      customerId: row.customerId,
      supplierName: row.supplier?.name ?? null,
      customerName: row.customer?.name ?? null,
      warehouseId: row.warehouseId,
      warehouseName: row.warehouse?.name ?? null,
      totalQuantity: row.items.reduce((sum, item) => sum + Number(item.quantity), 0),
      items: row.items.map((item) => ({ id: item.id, quantity: Number(item.quantity), product: { name: item.product.name } }))
    }))
  };
}
