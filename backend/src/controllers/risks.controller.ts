import { Request, Response, NextFunction } from "express";
import prisma from "../prisma";

export async function list(req: Request, res: Response, next: NextFunction) {
  try {
    const { type, status } = req.query;
    const items = await prisma.riskIssue.findMany({
      where: {
        projectId: req.params.projectId,
        ...(type ? { type: String(type) } : {}),
        ...(status ? { status: String(status) } : {}),
      },
      orderBy: [{ impact: "desc" }, { createdAt: "desc" }],
    });
    res.json(items);
  } catch (e) { next(e); }
}

export async function create(req: Request, res: Response, next: NextFunction) {
  try {
    const item = await prisma.riskIssue.create({
      data: {
        ...req.body,
        projectId: req.params.projectId,
        dueDate: req.body.dueDate ? new Date(req.body.dueDate) : undefined,
      },
    });
    res.status(201).json(item);
  } catch (e) { next(e); }
}

export async function get(req: Request, res: Response, next: NextFunction) {
  try {
    const item = await prisma.riskIssue.findUniqueOrThrow({ where: { id: req.params.id } });
    res.json(item);
  } catch (e) { next(e); }
}

export async function update(req: Request, res: Response, next: NextFunction) {
  try {
    const data: Record<string, unknown> = { ...req.body };
    if (data.dueDate) data.dueDate = new Date(String(data.dueDate));
    const item = await prisma.riskIssue.update({ where: { id: req.params.id }, data });
    res.json(item);
  } catch (e) { next(e); }
}

export async function remove(req: Request, res: Response, next: NextFunction) {
  try {
    await prisma.riskIssue.delete({ where: { id: req.params.id } });
    res.status(204).send();
  } catch (e) { next(e); }
}
