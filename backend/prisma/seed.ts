import { PrismaClient, ProductUnit, UserRole } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const passwordHash = await bcrypt.hash("admin123", 10);

  await prisma.user.upsert({
    where: { email: "admin@magazine.local" },
    update: {},
    create: {
      name: "Magazine Admin",
      email: "admin@magazine.local",
      passwordHash,
      role: UserRole.ADMIN
    }
  });

  await prisma.warehouse.upsert({
    where: { id: "default-warehouse" },
    update: {},
    create: {
      id: "default-warehouse",
      name: "Main Magazine",
      location: "Licensed blasting warehouse"
    }
  });

  for (const setting of [
    { key: "language", value: "en" },
    { key: "low_stock_threshold", value: "10" }
  ]) {
    await prisma.setting.upsert({ where: { key: setting.key }, update: { value: setting.value }, create: setting });
  }

  for (const product of [
    { name: "Detonators", unit: ProductUnit.PIECES },
    { name: "Gelatin Sticks", unit: ProductUnit.BOX },
    { name: "Fuse", unit: ProductUnit.PIECES }
  ]) {
    await prisma.product.upsert({ where: { name: product.name }, update: {}, create: product });
  }
}

main().finally(async () => prisma.$disconnect());
