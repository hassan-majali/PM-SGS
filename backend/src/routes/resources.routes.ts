import { Router } from "express";
import * as ctrl from "../controllers/resources.controller";

const router = Router();

router.get("/:projectId/resources", ctrl.list);
router.post("/:projectId/resources", ctrl.create);
router.get("/:projectId/resources/:id", ctrl.get);
router.put("/:projectId/resources/:id", ctrl.update);
router.delete("/:projectId/resources/:id", ctrl.remove);

export default router;
