import { Request, Response, NextFunction } from "express";
import prisma from "../prisma";
import * as XLSX from "xlsx";
import fs from "fs";

export async function list(req: Request, res: Response, next: NextFunction) {
  try {
    const items = await prisma.deliverable.findMany({
      where: { projectId: req.params.projectId },
      include: { paymentPlans: { select: { billedQty: true } } },
      orderBy: { createdAt: "desc" },
    });
    const result = items.map(({ paymentPlans, ...d }) => {
      const billedQty = paymentPlans.reduce((s, p) => s + (p.billedQty || 0), 0);
      return { ...d, billedQty, remainingQty: d.qty - billedQty };
    });
    res.json(result);
  } catch (e) { next(e); }
}

export async function create(req: Request, res: Response, next: NextFunction) {
  try {
    const qty = parseFloat(req.body.qty ?? 1);
    const unitPrice = parseFloat(req.body.unitPrice ?? 0);
    const amount = qty * unitPrice;
    const item = await prisma.deliverable.create({
      data: { name: req.body.name, description: req.body.description, projectId: req.params.projectId, qty, unitPrice, amount },
    });
    res.status(201).json({ ...item, billedQty: 0, remainingQty: item.qty });
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
    const qty = data.qty !== undefined ? parseFloat(String(data.qty)) : undefined;
    const unitPrice = data.unitPrice !== undefined ? parseFloat(String(data.unitPrice)) : undefined;
    if (qty !== undefined) data.qty = qty;
    if (unitPrice !== undefined) data.unitPrice = unitPrice;
    if (qty !== undefined || unitPrice !== undefined) {
      const existing = await prisma.deliverable.findUnique({ where: { id: req.params.id } });
      if (existing) data.amount = (qty ?? existing.qty) * (unitPrice ?? existing.unitPrice);
    }
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
    const item = await prisma.deliverable.update({ where: { id: req.params.id }, data: { attachmentUrl: url } });
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
      if (!name) continue;
      const qty = parseFloat(String(row["qty"] || row["Qty"] || 1));
      const unitPrice = parseFloat(String(row["unitPrice"] || row["Unit Price"] || row["price"] || 0));
      const amount = qty * unitPrice;
      const d = await prisma.deliverable.create({
        data: { name, qty, unitPrice, amount, projectId: req.params.projectId, description: String(row["description"] || row["Description"] || "") },
      });
      created.push(d);
    }
    fs.unlinkSync(req.file.path);
    res.status(201).json({ imported: created.length, items: created });
  } catch (e) { next(e); }
}
