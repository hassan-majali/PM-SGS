import { Request, Response, NextFunction } from "express";
import prisma from "../prisma";

export async function list(req: Request, res: Response, next: NextFunction) {
  try {
    const items = await prisma.activityLog.findMany({
      where: { projectId: req.params.projectId },
      include: { supportItems: true },
      orderBy: { weekStartDate: "desc" },
    });
    res.json(items);
  } catch (e) { next(e); }
}

export async function create(req: Request, res: Response, next: NextFunction) {
  try {
    const item = await prisma.activityLog.create({
      data: {
        ...req.body,
        projectId: req.params.projectId,
        weekStartDate: new Date(req.body.weekStartDate),
      },
      include: { supportItems: true },
    });
    res.status(201).json(item);
  } catch (e) { next(e); }
}

export async function get(req: Request, res: Response, next: NextFunction) {
  try {
    const item = await prisma.activityLog.findUniqueOrThrow({
      where: { id: req.params.id },
      include: { supportItems: true },
    });
    res.json(item);
  } catch (e) { next(e); }
}

export async function update(req: Request, res: Response, next: NextFunction) {
  try {
    const data: Record<string, unknown> = { ...req.body };
    if (data.weekStartDate) data.weekStartDate = new Date(String(data.weekStartDate));
    const item = await prisma.activityLog.update({
      where: { id: req.params.id },
      data,
      include: { supportItems: true },
    });
    res.json(item);
  } catch (e) { next(e); }
}

export async function remove(req: Request, res: Response, next: NextFunction) {
  try {
    await prisma.activityLog.delete({ where: { id: req.params.id } });
    res.status(204).send();
  } catch (e) { next(e); }
}

export async function exportLogs(req: Request, res: Response, next: NextFunction) {
  try {
    const items = await prisma.activityLog.findMany({
      where: { projectId: req.params.projectId },
      include: { supportItems: true },
      orderBy: { weekStartDate: "asc" },
    });
    res.json(items);
  } catch (e) { next(e); }
}
