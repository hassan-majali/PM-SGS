import { Router } from "express";
import clientsRouter from "./clients.routes";
import projectsRouter from "./projects.routes";
import deliverablesRouter from "./deliverables.routes";
import paymentPlansRouter from "./paymentPlans.routes";
import resourcesRouter from "./resources.routes";
import documentsRouter from "./documents.routes";
import activityLogsRouter from "./activityLogs.routes";
import risksRouter from "./risks.routes";
import mandaysRouter from "./mandays.routes";
import initiativesRouter from "./initiatives.routes";
import actionItemsRouter from "./actionItems.routes";
import supportRouter from "./support.routes";

const router = Router();

router.use("/clients", clientsRouter);
router.use("/projects", projectsRouter);
router.use("/projects", deliverablesRouter);
router.use("/projects", paymentPlansRouter);
router.use("/projects", resourcesRouter);
router.use("/projects", documentsRouter);
router.use("/projects", activityLogsRouter);
router.use("/projects", risksRouter);
router.use("/projects", mandaysRouter);
router.use("/initiatives", initiativesRouter);
router.use("/initiatives", actionItemsRouter);
router.use("/support", supportRouter);

export default router;
