import { Router } from "express";
import * as ctrl from "../controllers/auth.controller";
import { authenticate, requireRole } from "../middleware/authenticate";

const router = Router();

router.post("/login", ctrl.login);
router.post("/refresh", ctrl.refresh);
router.post("/logout", ctrl.logout);
router.get("/me", authenticate, ctrl.me);

// Admin-only user management
router.get("/users", authenticate, requireRole("ADMIN"), ctrl.listUsers);
router.post("/users", authenticate, requireRole("ADMIN"), ctrl.createUser);
router.put("/users/:id", authenticate, requireRole("ADMIN"), ctrl.updateUser);
router.put("/users/:id/password", authenticate, requireRole("ADMIN"), ctrl.resetPassword);

export default router;
