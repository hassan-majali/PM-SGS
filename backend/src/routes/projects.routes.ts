import { Router } from "express";
import * as ctrl from "../controllers/projects.controller";

const router = Router();

router.get("/", ctrl.list);
router.post("/", ctrl.create);
router.get("/:id", ctrl.get);
router.put("/:id", ctrl.update);
router.delete("/:id", ctrl.remove);
router.get("/:id/dashboard", ctrl.dashboard);

export default router;
