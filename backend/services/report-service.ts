import { startOfDay, startOfMonth } from "@/utils/date";
import { prisma } from "@/db/prisma";

export async function getReports() {
  const now = new Date();
  const [dailyCount, monthlyCount, financialLedger, inventory] = await Promise.all([
    prisma.transaction.count({ where: { createdAt: { gte: startOfDay(now) }, deletedAt: null } }),
    prisma.transaction.count({ where: { createdAt: { gte: startOfMonth(now) }, deletedAt: null } }),
    prisma.financialLedger.findMany({ orderBy: { createdAt: "desc" }, take: 50 }),
    prisma.inventory.findMany({ include: { product: true }, orderBy: { updatedAt: "desc" } })
  ]);

  return {
    dailyCount,
    monthlyCount,
    financialLedger: financialLedger.map((row) => ({ debit: Number(row.debit), credit: Number(row.credit) })),
    inventory: inventory.map((row) => ({ id: row.id, quantity: Number(row.quantity), product: { name: row.product.name } }))
  };
}
