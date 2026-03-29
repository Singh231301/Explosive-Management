import type { Request, Response } from "express";
import { createUserSchema, updateUserPasswordSchema, updateUserRoleSchema } from "../validations/schemas";
import { createUser, listUsers, updateUserPassword, updateUserRole } from "../services/user-service";

function getId(req: Request) {
  return String(req.params.id || "");
}

export async function listUsersController(_req: Request, res: Response) {
  res.json({ success: true, data: await listUsers() });
}

export async function createUserController(req: Request, res: Response) {
  const input = createUserSchema.parse(req.body);
  res.status(201).json({ success: true, data: await createUser(input) });
}

export async function updateUserPasswordController(req: Request, res: Response) {
  const input = updateUserPasswordSchema.parse(req.body);
  res.json({ success: true, data: await updateUserPassword(getId(req), input.password) });
}

export async function updateUserRoleController(req: Request, res: Response) {
  const input = updateUserRoleSchema.parse(req.body);
  res.json({ success: true, data: await updateUserRole(getId(req), input.role) });
}

