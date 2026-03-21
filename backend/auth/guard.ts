import type { NextFunction, Request, Response } from "express";
import { verifyAccessToken } from "@/auth/session";

export type AuthenticatedRequest = Request & {
  user?: {
    id: string;
    name: string;
    email: string;
    role: string;
  };
};

export async function requireAuth(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith("Bearer ")) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const token = authHeader.replace("Bearer ", "").trim();
    req.user = await verifyAccessToken(token);
    next();
  } catch {
    return res.status(401).json({ success: false, message: "Invalid token" });
  }
}
