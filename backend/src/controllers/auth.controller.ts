import { Request, Response, NextFunction } from "express";
import prisma from "../prisma";
import {
  hashPassword, verifyPassword, signAccessToken, signRefreshToken,
  verifyRefreshToken, PASSWORD_POLICY, PASSWORD_POLICY_MESSAGE,
  REFRESH_COOKIE, COOKIE_OPTIONS,
} from "../lib/auth";

export async function login(req: Request, res: Response, next: NextFunction) {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: "Email and password required" });

    const user = await prisma.user.findUnique({ where: { email: email.toLowerCase().trim() } });
    if (!user) return res.status(401).json({ error: "Invalid email or password" });
    if (user.status !== "ACTIVE") return res.status(403).json({ error: "Account is inactive. Contact your administrator." });

    const valid = await verifyPassword(password, user.passwordHash);
    if (!valid) return res.status(401).json({ error: "Invalid email or password" });

    await prisma.user.update({ where: { id: user.id }, data: { lastLoginAt: new Date() } });

    const accessToken = signAccessToken({ userId: user.id, role: user.role });
    const refreshToken = signRefreshToken({ userId: user.id });

    res.cookie(REFRESH_COOKIE, refreshToken, COOKIE_OPTIONS);
    res.json({
      accessToken,
      user: { id: user.id, email: user.email, name: user.name, role: user.role },
    });
  } catch (e) { next(e); }
}

export async function refresh(req: Request, res: Response, next: NextFunction) {
  try {
    const token = req.cookies?.[REFRESH_COOKIE];
    if (!token) return res.status(401).json({ error: "No refresh token" });

    const payload = verifyRefreshToken(token);
    const user = await prisma.user.findUnique({ where: { id: payload.userId } });
    if (!user || user.status !== "ACTIVE") return res.status(401).json({ error: "Unauthorized" });

    const accessToken = signAccessToken({ userId: user.id, role: user.role });
    const newRefresh = signRefreshToken({ userId: user.id });

    res.cookie(REFRESH_COOKIE, newRefresh, COOKIE_OPTIONS);
    res.json({
      accessToken,
      user: { id: user.id, email: user.email, name: user.name, role: user.role },
    });
  } catch {
    res.clearCookie(REFRESH_COOKIE);
    return res.status(401).json({ error: "Session expired. Please log in again." });
  }
}

export async function logout(_req: Request, res: Response) {
  res.clearCookie(REFRESH_COOKIE, { path: "/" });
  res.json({ message: "Logged out" });
}

export async function me(req: Request, res: Response, next: NextFunction) {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user!.userId },
      select: { id: true, email: true, name: true, role: true, status: true, lastLoginAt: true },
    });
    if (!user) return res.status(404).json({ error: "User not found" });
    res.json(user);
  } catch (e) { next(e); }
}

// ─── Admin: User Management ───────────────────────────────────────────────────

export async function listUsers(_req: Request, res: Response, next: NextFunction) {
  try {
    const users = await prisma.user.findMany({
      select: { id: true, email: true, name: true, role: true, status: true, lastLoginAt: true, createdAt: true },
      orderBy: { createdAt: "asc" },
    });
    res.json(users);
  } catch (e) { next(e); }
}

export async function createUser(req: Request, res: Response, next: NextFunction) {
  try {
    const { email, name, password, role } = req.body;
    if (!email || !name || !password) return res.status(400).json({ error: "Email, name and password required" });
    if (!PASSWORD_POLICY.test(password)) return res.status(400).json({ error: PASSWORD_POLICY_MESSAGE });

    const validRoles = ["ADMIN", "MANAGER", "VIEWER"];
    const assignedRole = validRoles.includes(role) ? role : "VIEWER";

    const exists = await prisma.user.findUnique({ where: { email: email.toLowerCase().trim() } });
    if (exists) return res.status(409).json({ error: "Email already in use" });

    const passwordHash = await hashPassword(password);
    const user = await prisma.user.create({
      data: { email: email.toLowerCase().trim(), name, passwordHash, role: assignedRole },
      select: { id: true, email: true, name: true, role: true, status: true, createdAt: true },
    });
    res.status(201).json(user);
  } catch (e) { next(e); }
}

export async function updateUser(req: Request, res: Response, next: NextFunction) {
  try {
    const { name, role, status } = req.body;
    const data: Record<string, unknown> = {};
    if (name) data.name = name;
    if (role && ["ADMIN", "MANAGER", "VIEWER"].includes(role)) data.role = role;
    if (status && ["ACTIVE", "INACTIVE"].includes(status)) data.status = status;

    const user = await prisma.user.update({
      where: { id: String(req.params.id) },
      data,
      select: { id: true, email: true, name: true, role: true, status: true },
    });
    res.json(user);
  } catch (e) { next(e); }
}

export async function resetPassword(req: Request, res: Response, next: NextFunction) {
  try {
    const { password } = req.body;
    if (!password) return res.status(400).json({ error: "Password required" });
    if (!PASSWORD_POLICY.test(password)) return res.status(400).json({ error: PASSWORD_POLICY_MESSAGE });

    const passwordHash = await hashPassword(password);
    await prisma.user.update({ where: { id: String(req.params.id) }, data: { passwordHash } });
    res.json({ message: "Password updated" });
  } catch (e) { next(e); }
}
