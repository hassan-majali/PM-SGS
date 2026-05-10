import { Request, Response, NextFunction } from "express";
import prisma from "../prisma";
import * as XLSX from "xlsx";
import fs from "fs";

export async function list(req: Request, res: Response, next: NextFunction) {
  try {
    const { fiscalYear, status, unbilledOnly } = req.query;
    const items = await prisma.paymentPlan.findMany({
      where: {
        projectId: req.params.projectId,
        ...(fiscalYear ? { fiscalYear: String(fiscalYear) } : {}),
        ...(status ? { status: String(status) } : {}),
        ...(unbilledOnly === "true" ? { status: { in: ["PENDING", "IN_PROGRESS"] } } : {}),
      },
      include: { deliverable: { select: { id: true, name: true } } },
      orderBy: { invoicingDate: "asc" },
    });
    res.json(items);
  } catch (e) { next(e); }
}

export async function create(req: Request, res: Response, next: NextFunction) {
  try {
    const item = await prisma.paymentPlan.create({
      data: {
        ...req.body,
        projectId: req.params.projectId,
        amount: parseFloat(req.body.amount),
        invoicingDate: new Date(req.body.invoicingDate),
      },
      include: { deliverable: { select: { id: true, name: true } } },
    });
    res.status(201).json(item);
  } catch (e) { next(e); }
}

export async function get(req: Request, res: Response, next: NextFunction) {
  try {
    const item = await prisma.paymentPlan.findUniqueOrThrow({
      where: { id: req.params.id },
      include: { deliverable: true },
    });
    res.json(item);
  } catch (e) { next(e); }
}

export async function update(req: Request, res: Response, next: NextFunction) {
  try {
    const data: Record<string, unknown> = { ...req.body };
    if (data.amount) data.amount = parseFloat(String(data.amount));
    if (data.invoicingDate) data.invoicingDate = new Date(String(data.invoicingDate));
    const item = await prisma.paymentPlan.update({
      where: { id: req.params.id },
      data,
      include: { deliverable: { select: { id: true, name: true } } },
    });
    res.json(item);
  } catch (e) { next(e); }
}

export async function remove(req: Request, res: Response, next: NextFunction) {
  try {
    await prisma.paymentPlan.delete({ where: { id: req.params.id } });
    res.status(204).send();
  } catch (e) { next(e); }
}

export async function uploadAttachment(req: Request, res: Response, next: NextFunction) {
  try {
    if (!req.file) return res.status(400).json({ error: "No file uploaded" });
    const url = `/uploads/payment-plans/${req.file.filename}`;
    const item = await prisma.paymentPlan.update({
      where: { id: req.params.id },
      data: { attachmentUrl: url },
    });
    res.json(item);
  } catch (e) { next(e); }
}

export async function summary(req: Request, res: Response, next: NextFunction) {
  try {
    const { fiscalYear } = req.query;
    const plans = await prisma.paymentPlan.findMany({
      where: {
        projectId: req.params.projectId,
        ...(fiscalYear ? { fiscalYear: String(fiscalYear) } : {}),
      },
    });

    const byFY: Record<string, { fiscalYear: string; forecasted: number; invoiced: number; collected: number; pending: number }> = {};
    for (const p of plans) {
      if (!byFY[p.fiscalYear]) {
        byFY[p.fiscalYear] = { fiscalYear: p.fiscalYear, forecasted: 0, invoiced: 0, collected: 0, pending: 0 };
      }
      byFY[p.fiscalYear].forecasted += p.amount;
      if (["INVOICED", "COLLECTED"].includes(p.status)) byFY[p.fiscalYear].invoiced += p.amount;
      if (p.status === "COLLECTED") byFY[p.fiscalYear].collected += p.amount;
      if (p.status === "PENDING") byFY[p.fiscalYear].pending += p.amount;
    }

    res.json(Object.values(byFY));
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
      const amount = parseFloat(String(row["amount"] || row["Amount"] || 0));
      const invoicingDate = row["invoicingDate"] || row["InvoicingDate"] || row["date"] || new Date();
      const status = String(row["status"] || row["Status"] || "PENDING").toUpperCase();
      const fiscalYear = String(row["fiscalYear"] || row["FiscalYear"] || row["fiscal_year"] || "FY2025");
      const notes = String(row["notes"] || row["Notes"] || "");

      const p = await prisma.paymentPlan.create({
        data: {
          projectId: req.params.projectId,
          amount,
          invoicingDate: new Date(String(invoicingDate)),
          status: ["PENDING", "IN_PROGRESS", "INVOICED", "COLLECTED"].includes(status) ? status : "PENDING",
          fiscalYear,
          notes,
        },
      });
      created.push(p);
    }

    fs.unlinkSync(req.file.path);
    res.status(201).json({ imported: created.length, items: created });
  } catch (e) { next(e); }
}
