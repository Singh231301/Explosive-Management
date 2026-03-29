import { UserRole } from "@prisma/client";
import { hashPassword } from "../auth/password";
import { prisma } from "../db/prisma";
import { logAuditEvent } from "../utils/audit-log";
import { HttpError, notFound } from "../utils/http-error";

function toSafeUser(user: { id: string; name: string; email: string; role: UserRole; createdAt: Date; updatedAt: Date }) {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt
  };
}

export async function listUsers() {
  const users = await prisma.user.findMany({
    where: { deletedAt: null },
    orderBy: { createdAt: "asc" },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      createdAt: true,
      updatedAt: true
    }
  });

  return users.map(toSafeUser);
}

export async function createUser(input: { name: string; email: string; password: string; role: UserRole }) {
  const existing = await prisma.user.findFirst({ where: { email: input.email, deletedAt: null } });
  if (existing) throw new HttpError(409, "A user with this email already exists");

  const user = await prisma.user.create({
    data: {
      name: input.name,
      email: input.email,
      passwordHash: await hashPassword(input.password),
      role: input.role
    },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      createdAt: true,
      updatedAt: true
    }
  });

  logAuditEvent("user.created", { userId: user.id, email: user.email, role: user.role });
  return toSafeUser(user);
}

export async function updateUserPassword(id: string, password: string) {
  const user = await prisma.user.findFirst({ where: { id, deletedAt: null } });
  if (!user) throw notFound("User not found");

  const updated = await prisma.user.update({
    where: { id },
    data: { passwordHash: await hashPassword(password) },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      createdAt: true,
      updatedAt: true
    }
  });

  logAuditEvent("user.password_changed", { userId: updated.id, email: updated.email });
  return toSafeUser(updated);
}

export async function updateUserRole(id: string, role: UserRole) {
  const user = await prisma.user.findFirst({ where: { id, deletedAt: null } });
  if (!user) throw notFound("User not found");

  const updated = await prisma.user.update({
    where: { id },
    data: { role },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      createdAt: true,
      updatedAt: true
    }
  });

  logAuditEvent("user.role_changed", { userId: updated.id, email: updated.email, role: updated.role });
  return toSafeUser(updated);
}

