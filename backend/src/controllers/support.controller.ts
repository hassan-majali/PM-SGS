import { Request, Response, NextFunction } from "express";
import prisma from "../prisma";

export async function listByProject(req: Request, res: Response, next: NextFunction) {
  try {
    const items = await prisma.supportItem.findMany({
      where: { projectId: String(req.params.projectId) },
      orderBy: { createdAt: "desc" },
    });
    res.json(items);
  } catch (e) { next(e); }
}

export async function createForProject(req: Request, res: Response, next: NextFunction) {
  try {
    const item = await prisma.supportItem.create({
      data: {
        ...req.body,
        projectId: String(req.params.projectId),
        dueDate: req.body.dueDate ? new Date(req.body.dueDate) : undefined,
      },
    });
    res.status(201).json(item);
  } catch (e) { next(e); }
}

export async function listByInitiative(req: Request, res: Response, next: NextFunction) {
  try {
    const items = await prisma.supportItem.findMany({
      where: { initiativeId: String(req.params.initiativeId) },
      orderBy: { createdAt: "desc" },
    });
    res.json(items);
  } catch (e) { next(e); }
}

export async function createForInitiative(req: Request, res: Response, next: NextFunction) {
  try {
    const item = await prisma.supportItem.create({
      data: {
        ...req.body,
        initiativeId: String(req.params.initiativeId),
        dueDate: req.body.dueDate ? new Date(req.body.dueDate) : undefined,
      },
    });
    res.status(201).json(item);
  } catch (e) { next(e); }
}

export async function listByActivityLog(req: Request, res: Response, next: NextFunction) {
  try {
    const items = await prisma.supportItem.findMany({
      where: { activityLogId: String(req.params.logId) },
      orderBy: { createdAt: "desc" },
    });
    res.json(items);
  } catch (e) { next(e); }
}

export async function createForActivityLog(req: Request, res: Response, next: NextFunction) {
  try {
    const item = await prisma.supportItem.create({
      data: {
        ...req.body,
        activityLogId: String(req.params.logId),
        dueDate: req.body.dueDate ? new Date(req.body.dueDate) : undefined,
      },
    });
    res.status(201).json(item);
  } catch (e) { next(e); }
}

export async function update(req: Request, res: Response, next: NextFunction) {
  try {
    const data: Record<string, unknown> = { ...req.body };
    if (data.dueDate) data.dueDate = new Date(String(data.dueDate));
    const item = await prisma.supportItem.update({ where: { id: String(req.params.id) }, data });
    res.json(item);
  } catch (e) { next(e); }
}

export async function remove(req: Request, res: Response, next: NextFunction) {
  try {
    await prisma.supportItem.delete({ where: { id: String(req.params.id) } });
    res.status(204).send();
  } catch (e) { next(e); }
}
