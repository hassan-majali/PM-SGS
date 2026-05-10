import { Router } from "express";
import * as ctrl from "../controllers/activityLogs.controller";

const router = Router();

router.get("/:projectId/activity-logs", ctrl.list);
router.post("/:projectId/activity-logs", ctrl.create);
router.get("/:projectId/activity-logs/export", ctrl.exportLogs);
router.get("/:projectId/activity-logs/:id", ctrl.get);
router.put("/:projectId/activity-logs/:id", ctrl.update);
router.delete("/:projectId/activity-logs/:id", ctrl.remove);

export default router;
