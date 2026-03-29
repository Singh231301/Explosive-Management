import { prisma } from "@/db/prisma";
import { comparePassword } from "@/auth/password";
import { unauthorized } from "@/utils/http-error";

export async function loginUser(email: string, password: string) {
  const user = await prisma.user.findFirst({ where: { email, deletedAt: null } });
  if (!user) throw unauthorized("Invalid email or password");
  const valid = await comparePassword(password, user.passwordHash);
  if (!valid) throw unauthorized("Invalid email or password");
  return user;
}
