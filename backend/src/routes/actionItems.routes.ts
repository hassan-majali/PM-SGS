import { Router } from "express";
import * as ctrl from "../controllers/actionItems.controller";

const router = Router();

router.get("/:initiativeId/action-items", ctrl.list);
router.post("/:initiativeId/action-items", ctrl.create);
router.get("/:initiativeId/action-items/:id", ctrl.get);
router.put("/:initiativeId/action-items/:id", ctrl.update);
router.delete("/:initiativeId/action-items/:id", ctrl.remove);

export default router;
