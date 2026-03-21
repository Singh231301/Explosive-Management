import { Router } from "express";
import { asyncRoute } from "@/utils/async-route";
import { backupController } from "@/controllers/backup-controller";

const router = Router();
router.get("/", asyncRoute(backupController));
export default router;
