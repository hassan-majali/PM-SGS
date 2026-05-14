import { Request, Response, NextFunction } from "express";
import prisma from "../prisma";

export async function list(req: Request, res: Response, next: NextFunction) {
  try {
    const items = await prisma.actionItem.findMany({
      where: { initiativeId: String(req.params.initiativeId) },
      orderBy: { createdAt: "asc" },
    });
    res.json(items);
  } catch (e) { next(e); }
}

export async function create(req: Request, res: Response, next: NextFunction) {
  try {
    const item = await prisma.actionItem.create({
      data: {
        ...req.body,
        initiativeId: String(req.params.initiativeId),
        dueDate: req.body.dueDate ? new Date(req.body.dueDate) : undefined,
      },
    });
    res.status(201).json(item);
  } catch (e) { next(e); }
}

export async function get(req: Request, res: Response, next: NextFunction) {
  try {
    const item = await prisma.actionItem.findUniqueOrThrow({ where: { id: String(req.params.id) } });
    res.json(item);
  } catch (e) { next(e); }
}

export async function update(req: Request, res: Response, next: NextFunction) {
  try {
    const data: Record<string, unknown> = { ...req.body };
    if (data.dueDate) data.dueDate = new Date(String(data.dueDate));
    const item = await prisma.actionItem.update({ where: { id: String(req.params.id) }, data });
    res.json(item);
  } catch (e) { next(e); }
}

export async function remove(req: Request, res: Response, next: NextFunction) {
  try {
    await prisma.actionItem.delete({ where: { id: String(req.params.id) } });
    res.status(204).send();
  } catch (e) { next(e); }
}
