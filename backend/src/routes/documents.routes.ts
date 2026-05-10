import { Router } from "express";
import * as ctrl from "../controllers/documents.controller";
import { uploadDocument } from "../middleware/upload";

const router = Router();

router.get("/:projectId/documents", ctrl.list);
router.post("/:projectId/documents", uploadDocument.single("file"), ctrl.upload);
router.delete("/:projectId/documents/:id", ctrl.remove);

export default router;
