import type { Request, Response } from "express";
import { loginSchema } from "../validations/schemas";
import { loginUser } from "../services/auth-service";
import { signAccessToken } from "../auth/session";

export async function loginController(req: Request, res: Response) {
  const input = loginSchema.parse(req.body);
  const user = await loginUser(input.email, input.password);
  const token = await signAccessToken({ id: user.id, name: user.name, email: user.email, role: user.role });
  res.json({ success: true, data: { token, user: { id: user.id, name: user.name, email: user.email, role: user.role } } });
}

