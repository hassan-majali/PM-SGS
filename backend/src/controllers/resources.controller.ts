import { Request, Response, NextFunction } from "express";
import prisma from "../prisma";

function withCost(r: { weeklyHours: number; costPerHour: number; utilizationPct: number; [key: string]: unknown }) {
  return { ...r, computedWeeklyCost: r.weeklyHours * r.costPerHour };
}

export async function list(req: Request, res: Response, next: NextFunction) {
  try {
    const items = await prisma.resource.findMany({
      where: { projectId: req.params.projectId },
      orderBy: { createdAt: "desc" },
    });
    res.json(items.map(withCost));
  } catch (e) { next(e); }
}

export async function create(req: Request, res: Response, next: NextFunction) {
  try {
    const item = await prisma.resource.create({
      data: {
        ...req.body,
        projectId: req.params.projectId,
        utilizationPct: parseFloat(req.body.utilizationPct ?? 0),
        weeklyHours: parseFloat(req.body.weeklyHours ?? 0),
        costPerHour: parseFloat(req.body.costPerHour ?? 0),
        startDate: req.body.startDate ? new Date(req.body.startDate) : undefined,
        endDate: req.body.endDate ? new Date(req.body.endDate) : undefined,
      },
    });
    res.status(201).json(withCost(item));
  } catch (e) { next(e); }
}

export async function get(req: Request, res: Response, next: NextFunction) {
  try {
    const item = await prisma.resource.findUniqueOrThrow({ where: { id: req.params.id } });
    res.json(withCost(item));
  } catch (e) { next(e); }
}

export async function update(req: Request, res: Response, next: NextFunction) {
  try {
    const data: Record<string, unknown> = { ...req.body };
    if (data.utilizationPct !== undefined) data.utilizationPct = parseFloat(String(data.utilizationPct));
    if (data.weeklyHours !== undefined) data.weeklyHours = parseFloat(String(data.weeklyHours));
    if (data.costPerHour !== undefined) data.costPerHour = parseFloat(String(data.costPerHour));
    if (data.startDate) data.startDate = new Date(String(data.startDate));
    if (data.endDate) data.endDate = new Date(String(data.endDate));
    const item = await prisma.resource.update({ where: { id: req.params.id }, data });
    res.json(withCost(item));
  } catch (e) { next(e); }
}

export async function remove(req: Request, res: Response, next: NextFunction) {
  try {
    await prisma.resource.delete({ where: { id: req.params.id } });
    res.status(204).send();
  } catch (e) { next(e); }
}
