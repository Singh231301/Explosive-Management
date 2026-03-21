import { prisma } from "@/db/prisma";
import { comparePassword } from "@/auth/password";

export async function loginUser(email: string, password: string) {
  const user = await prisma.user.findFirst({ where: { email, deletedAt: null } });
  if (!user) throw new Error("User not found");
  const valid = await comparePassword(password, user.passwordHash);
  if (!valid) throw new Error("Invalid password");
  return user;
}
