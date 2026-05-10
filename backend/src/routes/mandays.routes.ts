import { Router } from "express";
import * as ctrl from "../controllers/mandays.controller";

const router = Router();

router.get("/:projectId/mandays", ctrl.get);
router.put("/:projectId/mandays", ctrl.update);

export default router;
