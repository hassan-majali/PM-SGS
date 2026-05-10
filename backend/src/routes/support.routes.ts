import { Router } from "express";
import * as ctrl from "../controllers/support.controller";

const router = Router();

router.get("/project/:projectId", ctrl.listByProject);
router.post("/project/:projectId", ctrl.createForProject);
router.get("/initiative/:initiativeId", ctrl.listByInitiative);
router.post("/initiative/:initiativeId", ctrl.createForInitiative);
router.get("/activity-log/:logId", ctrl.listByActivityLog);
router.post("/activity-log/:logId", ctrl.createForActivityLog);
router.put("/:id", ctrl.update);
router.delete("/:id", ctrl.remove);

export default router;
