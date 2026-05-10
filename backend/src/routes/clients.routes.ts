import { Router } from "express";
import * as ctrl from "../controllers/clients.controller";

const router = Router();

router.get("/", ctrl.list);
router.post("/", ctrl.create);
router.get("/:id", ctrl.get);
router.put("/:id", ctrl.update);
router.delete("/:id", ctrl.remove);

export default router;
