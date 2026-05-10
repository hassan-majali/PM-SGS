import { Request, Response, NextFunction } from "express";
import prisma from "../prisma";
import * as XLSX from "xlsx";
import fs from "fs";

export async function list(req: Request, res: Response, next: NextFunction) {
  try {
    const items = await prisma.deliverable.findMany({
      where: { projectId: req.params.projectId },
      orderBy: { createdAt: "desc" },
    });
    res.json(items);
  } catch (e) { next(e); }
}

export async function create(req: Request, res: Response, next: NextFunction) {
  try {
    const item = await prisma.deliverable.create({
      data: { ...req.body, projectId: req.params.projectId, amount: parseFloat(req.body.amount) },
    });
    res.status(201).json(item);
  } catch (e) { next(e); }
}

export async function get(req: Request, res: Response, next: NextFunction) {
  try {
    const item = await prisma.deliverable.findUniqueOrThrow({ where: { id: req.params.id } });
    res.json(item);
  } catch (e) { next(e); }
}

export async function update(req: Request, res: Response, next: NextFunction) {
  try {
    const data: Record<string, unknown> = { ...req.body };
    if (data.amount) data.amount = parseFloat(String(data.amount));
    const item = await prisma.deliverable.update({ where: { id: req.params.id }, data });
    res.json(item);
  } catch (e) { next(e); }
}

export async function remove(req: Request, res: Response, next: NextFunction) {
  try {
    await prisma.deliverable.delete({ where: { id: req.params.id } });
    res.status(204).send();
  } catch (e) { next(e); }
}

export async function uploadAttachment(req: Request, res: Response, next: NextFunction) {
  try {
    if (!req.file) return res.status(400).json({ error: "No file uploaded" });
    const url = `/uploads/deliverables/${req.file.filename}`;
    const item = await prisma.deliverable.update({
      where: { id: req.params.id },
      data: { attachmentUrl: url },
    });
    res.json(item);
  } catch (e) { next(e); }
}

export async function importExcel(req: Request, res: Response, next: NextFunction) {
  try {
    if (!req.file) return res.status(400).json({ error: "No file uploaded" });
    const wb = XLSX.readFile(req.file.path);
    const ws = wb.Sheets[wb.SheetNames[0]];
    const rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(ws);

    const created = [];
    for (const row of rows) {
      const name = String(row["name"] || row["Name"] || row["Deliverable"] || "");
      const amount = parseFloat(String(row["amount"] || row["Amount"] || 0));
      if (!name) continue;
      const d = await prisma.deliverable.create({
        data: { name, amount, projectId: req.params.projectId, description: String(row["description"] || row["Description"] || "") },
      });
      created.push(d);
    }

    fs.unlinkSync(req.file.path);
    res.status(201).json({ imported: created.length, items: created });
  } catch (e) { next(e); }
}
