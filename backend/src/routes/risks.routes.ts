import { Router } from "express";
import * as ctrl from "../controllers/risks.controller";

const router = Router();

router.get("/:projectId/risks", ctrl.list);
router.post("/:projectId/risks", ctrl.create);
router.get("/:projectId/risks/:id", ctrl.get);
router.put("/:projectId/risks/:id", ctrl.update);
router.delete("/:projectId/risks/:id", ctrl.remove);

export default router;
