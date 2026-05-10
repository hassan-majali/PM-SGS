import { Request, Response, NextFunction } from "express";
import prisma from "../prisma";

export async function get(req: Request, res: Response, next: NextFunction) {
  try {
    let mandays = await prisma.mandays.findUnique({ where: { projectId: req.params.projectId } });
    if (!mandays) {
      mandays = await prisma.mandays.create({ data: { projectId: req.params.projectId } });
    }
    res.json({ ...mandays, remaining: mandays.totalContracted - mandays.used });
  } catch (e) { next(e); }
}

export async function update(req: Request, res: Response, next: NextFunction) {
  try {
    const data: Record<string, unknown> = {};
    if (req.body.totalContracted !== undefined) data.totalContracted = parseFloat(req.body.totalContracted);
    if (req.body.used !== undefined) data.used = parseFloat(req.body.used);
    if (req.body.billed !== undefined) data.billed = parseFloat(req.body.billed);

    const mandays = await prisma.mandays.upsert({
      where: { projectId: req.params.projectId },
      update: data,
      create: { projectId: req.params.projectId, ...data },
    });
    res.json({ ...mandays, remaining: mandays.totalContracted - mandays.used });
  } catch (e) { next(e); }
}
