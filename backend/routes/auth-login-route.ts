import { Router } from "express";
import { asyncRoute } from "@/utils/async-route";
import { loginController } from "@/controllers/auth-controller";

const router = Router();
router.post("/login", asyncRoute(loginController));
export default router;
