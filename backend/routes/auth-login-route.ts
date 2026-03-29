import { Router } from "express";
import { asyncRoute } from "../utils/async-route";
import { loginController } from "../controllers/auth-controller";
import { createRateLimit } from "../middleware/rate-limit";

const router = Router();
router.post("/login", createRateLimit({ windowMs: 10 * 60 * 1000, max: 10, message: "Too many login attempts. Please wait a few minutes." }), asyncRoute(loginController));
export default router;

