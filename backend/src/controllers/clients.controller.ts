import { Request, Response, NextFunction } from "express";
import prisma from "../prisma";

export async function list(_req: Request, res: Response, next: NextFunction) {
  try {
    const clients = await prisma.client.findMany({
      include: { _count: { select: { projects: true } } },
      orderBy: { createdAt: "desc" },
    });
    res.json(clients);
  } catch (e) { next(e); }
}

export async function create(req: Request, res: Response, next: NextFunction) {
  try {
    const client = await prisma.client.create({ data: req.body });
    res.status(201).json(client);
  } catch (e) { next(e); }
}

export async function get(req: Request, res: Response, next: NextFunction) {
  try {
    const client = await prisma.client.findUniqueOrThrow({
      where: { id: req.params.id },
      include: {
        projects: { orderBy: { createdAt: "desc" } },
        initiatives: { orderBy: { createdAt: "desc" } },
      },
    });
    res.json(client);
  } catch (e) { next(e); }
}

export async function update(req: Request, res: Response, next: NextFunction) {
  try {
    const client = await prisma.client.update({
      where: { id: req.params.id },
      data: req.body,
    });
    res.json(client);
  } catch (e) { next(e); }
}

export async function remove(req: Request, res: Response, next: NextFunction) {
  try {
    await prisma.client.delete({ where: { id: req.params.id } });
    res.status(204).send();
  } catch (e) { next(e); }
}
