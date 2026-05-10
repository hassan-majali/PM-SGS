import { Request, Response, NextFunction } from "express";
import prisma from "../prisma";

export async function list(req: Request, res: Response, next: NextFunction) {
  try {
    const { clientId, status } = req.query;
    const projects = await prisma.project.findMany({
      where: {
        ...(clientId ? { clientId: String(clientId) } : {}),
        ...(status ? { status: String(status) } : {}),
      },
      include: {
        client: { select: { id: true, name: true } },
        _count: { select: { deliverables: true, resources: true, risks: true } },
      },
      orderBy: { createdAt: "desc" },
    });
    res.json(projects);
  } catch (e) { next(e); }
}

export async function create(req: Request, res: Response, next: NextFunction) {
  try {
    const project = await prisma.project.create({
      data: {
        ...req.body,
        startDate: new Date(req.body.startDate),
        endDate: new Date(req.body.endDate),
        budget: parseFloat(req.body.budget),
      },
      include: { client: { select: { id: true, name: true } } },
    });
    res.status(201).json(project);
  } catch (e) { next(e); }
}

export async function get(req: Request, res: Response, next: NextFunction) {
  try {
    const project = await prisma.project.findUniqueOrThrow({
      where: { id: req.params.id },
      include: { client: true },
    });
    res.json(project);
  } catch (e) { next(e); }
}

export async function update(req: Request, res: Response, next: NextFunction) {
  try {
    const data: Record<string, unknown> = { ...req.body };
    if (data.startDate) data.startDate = new Date(String(data.startDate));
    if (data.endDate) data.endDate = new Date(String(data.endDate));
    if (data.budget) data.budget = parseFloat(String(data.budget));
    const project = await prisma.project.update({
      where: { id: req.params.id },
      data,
      include: { client: { select: { id: true, name: true } } },
    });
    res.json(project);
  } catch (e) { next(e); }
}

export async function remove(req: Request, res: Response, next: NextFunction) {
  try {
    await prisma.project.delete({ where: { id: req.params.id } });
    res.status(204).send();
  } catch (e) { next(e); }
}

export async function dashboard(req: Request, res: Response, next: NextFunction) {
  try {
    const id = req.params.id;

    const [project, paymentPlans, resources, risks, mandays] = await Promise.all([
      prisma.project.findUniqueOrThrow({ where: { id }, include: { client: true } }),
      prisma.paymentPlan.findMany({ where: { projectId: id } }),
      prisma.resource.findMany({ where: { projectId: id } }),
      prisma.riskIssue.findMany({ where: { projectId: id, status: { in: ["OPEN", "MITIGATED"] } }, orderBy: { impact: "desc" }, take: 5 }),
      prisma.mandays.findUnique({ where: { projectId: id } }),
    ]);

    const financials = {
      totalBudget: project.budget,
      totalForecasted: paymentPlans.reduce((s, p) => s + p.amount, 0),
      totalInvoiced: paymentPlans.filter(p => ["INVOICED", "COLLECTED"].includes(p.status)).reduce((s, p) => s + p.amount, 0),
      totalCollected: paymentPlans.filter(p => p.status === "COLLECTED").reduce((s, p) => s + p.amount, 0),
      totalPending: paymentPlans.filter(p => p.status === "PENDING").reduce((s, p) => s + p.amount, 0),
    };

    const resourcesSummary = resources.map(r => ({
      ...r,
      computedWeeklyCost: r.weeklyHours * r.costPerHour,
    }));

    const mandaysSummary = mandays
      ? { ...mandays, remaining: mandays.totalContracted - mandays.used }
      : null;

    res.json({ project, financials, resources: resourcesSummary, topRisks: risks, mandays: mandaysSummary });
  } catch (e) { next(e); }
}
