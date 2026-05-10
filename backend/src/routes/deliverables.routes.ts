import { Router } from "express";
import * as ctrl from "../controllers/deliverables.controller";
import { uploadDeliverable, uploadExcel } from "../middleware/upload";

const router = Router();

router.get("/:projectId/deliverables", ctrl.list);
router.post("/:projectId/deliverables", ctrl.create);
router.get("/:projectId/deliverables/:id", ctrl.get);
router.put("/:projectId/deliverables/:id", ctrl.update);
router.delete("/:projectId/deliverables/:id", ctrl.remove);
router.post("/:projectId/deliverables/:id/attachment", uploadDeliverable.single("file"), ctrl.uploadAttachment);
router.post("/:projectId/deliverables/import/excel", uploadExcel.single("file"), ctrl.importExcel);

export default router;
