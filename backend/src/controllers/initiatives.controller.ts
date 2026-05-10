import { Request, Response, NextFunction } from "express";
import prisma from "../prisma";

export async function list(req: Request, res: Response, next: NextFunction) {
  try {
    const { type, qualificationDecision, clientId } = req.query;
    const items = await prisma.initiative.findMany({
      where: {
        ...(type ? { type: String(type) } : {}),
        ...(qualificationDecision ? { qualificationDecision: String(qualificationDecision) } : {}),
        ...(clientId ? { clientId: String(clientId) } : {}),
      },
      include: {
        client: { select: { id: true, name: true } },
        _count: { select: { actionItems: true } },
      },
      orderBy: { createdAt: "desc" },
    });
    res.json(items);
  } catch (e) { next(e); }
}

export async function create(req: Request, res: Response, next: NextFunction) {
  try {
    const item = await prisma.initiative.create({
      data: {
        ...req.body,
        expectedRevenue: req.body.expectedRevenue ? parseFloat(req.body.expectedRevenue) : undefined,
      },
      include: { client: { select: { id: true, name: true } } },
    });
    res.status(201).json(item);
  } catch (e) { next(e); }
}

export async function get(req: Request, res: Response, next: NextFunction) {
  try {
    const item = await prisma.initiative.findUniqueOrThrow({
      where: { id: req.params.id },
      include: {
        client: true,
        actionItems: { orderBy: { createdAt: "asc" } },
        supportItems: { orderBy: { createdAt: "desc" } },
      },
    });
    res.json(item);
  } catch (e) { next(e); }
}

export async function update(req: Request, res: Response, next: NextFunction) {
  try {
    const data: Record<string, unknown> = { ...req.body };
    if (data.expectedRevenue !== undefined) data.expectedRevenue = parseFloat(String(data.expectedRevenue));
    const item = await prisma.initiative.update({
      where: { id: req.params.id },
      data,
      include: { client: { select: { id: true, name: true } } },
    });
    res.json(item);
  } catch (e) { next(e); }
}

export async function remove(req: Request, res: Response, next: NextFunction) {
  try {
    await prisma.initiative.delete({ where: { id: req.params.id } });
    res.status(204).send();
  } catch (e) { next(e); }
}
