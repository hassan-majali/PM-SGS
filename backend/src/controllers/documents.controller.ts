import { Request, Response, NextFunction } from "express";
import prisma from "../prisma";
import fs from "fs";
import path from "path";

export async function list(req: Request, res: Response, next: NextFunction) {
  try {
    const items = await prisma.document.findMany({
      where: { projectId: req.params.projectId },
      orderBy: { createdAt: "desc" },
    });
    res.json(items);
  } catch (e) { next(e); }
}

export async function upload(req: Request, res: Response, next: NextFunction) {
  try {
    if (!req.file) return res.status(400).json({ error: "No file uploaded" });
    const item = await prisma.document.create({
      data: {
        projectId: req.params.projectId,
        name: req.body.name || req.file.originalname,
        fileUrl: `/uploads/documents/${req.file.filename}`,
        mimeType: req.file.mimetype,
        sizeBytes: req.file.size,
        uploadedBy: req.body.uploadedBy,
        category: req.body.category,
      },
    });
    res.status(201).json(item);
  } catch (e) { next(e); }
}

export async function remove(req: Request, res: Response, next: NextFunction) {
  try {
    const doc = await prisma.document.findUniqueOrThrow({ where: { id: req.params.id } });
    const filePath = path.join(__dirname, "../../", doc.fileUrl);
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    await prisma.document.delete({ where: { id: req.params.id } });
    res.status(204).send();
  } catch (e) { next(e); }
}
