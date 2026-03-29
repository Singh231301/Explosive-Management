import { PrismaClient, ProductUnit, UserRole } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  for (const user of [
    { name: "Magazine Admin", email: "admin@magazine.local", password: "admin123", role: UserRole.ADMIN },
    { name: "Magazine Operator", email: "operator@magazine.local", password: "operator123", role: UserRole.OPERATOR },
    { name: "Magazine Auditor", email: "auditor@magazine.local", password: "auditor123", role: UserRole.AUDITOR }
  ]) {
    await prisma.user.upsert({
      where: { email: user.email },
      update: {
        name: user.name,
        passwordHash: await bcrypt.hash(user.password, 10),
        role: user.role,
        deletedAt: null
      },
      create: {
        name: user.name,
        email: user.email,
        passwordHash: await bcrypt.hash(user.password, 10),
        role: user.role
      }
    });
  }

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
