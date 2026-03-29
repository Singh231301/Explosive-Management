import { Router } from "express";
import { requireAuth, requireRole } from "../auth/guard";
import { asyncRoute } from "../utils/async-route";
import { createUserController, listUsersController, updateUserPasswordController, updateUserRoleController } from "../controllers/user-controller";

const router = Router();

router.get("/", requireAuth, requireRole("ADMIN"), asyncRoute(listUsersController));
router.post("/", requireAuth, requireRole("ADMIN"), asyncRoute(createUserController));
router.put("/:id/password", requireAuth, requireRole("ADMIN"), asyncRoute(updateUserPasswordController));
router.put("/:id/role", requireAuth, requireRole("ADMIN"), asyncRoute(updateUserRoleController));

export default router;

