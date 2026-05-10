import { Router } from "express";
import * as ctrl from "../controllers/paymentPlans.controller";
import { uploadPayment, uploadExcel } from "../middleware/upload";

const router = Router();

router.get("/:projectId/payment-plans", ctrl.list);
router.post("/:projectId/payment-plans", ctrl.create);
router.get("/:projectId/payment-plans/summary", ctrl.summary);
router.get("/:projectId/payment-plans/:id", ctrl.get);
router.put("/:projectId/payment-plans/:id", ctrl.update);
router.delete("/:projectId/payment-plans/:id", ctrl.remove);
router.post("/:projectId/payment-plans/:id/attachment", uploadPayment.single("file"), ctrl.uploadAttachment);
router.post("/:projectId/payment-plans/import/excel", uploadExcel.single("file"), ctrl.importExcel);

export default router;
