import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding database...");

  // ── Default Admin User ──────────────────────────────────────────────────────
  const adminEmail = "admin@pmportal.com";
  const existing = await prisma.user.findUnique({ where: { email: adminEmail } });
  if (!existing) {
    const passwordHash = await bcrypt.hash("Admin@1234!", 12);
    await prisma.user.create({
      data: { email: adminEmail, name: "Admin", passwordHash, role: "ADMIN", status: "ACTIVE" },
    });
    console.log("✅ Default admin created:");
    console.log("   Email:    admin@pmportal.com");
    console.log("   Password: Admin@1234!");
    console.log("   ⚠️  Change this password after first login!");
  } else {
    console.log("ℹ️  Admin user already exists, skipping.");
  }

  // ── Sample Data ─────────────────────────────────────────────────────────────
  const client = await prisma.client.create({
    data: {
      name: "Acme Corporation",
      industry: "Technology",
      contactName: "John Smith",
      contactEmail: "john@acme.com",
      notes: "Key strategic account",
    },
  });

  const project = await prisma.project.create({
    data: {
      name: "Digital Transformation Phase 1",
      description: "Core platform modernization",
      budget: 500000,
      startDate: new Date("2025-01-01"),
      endDate: new Date("2025-12-31"),
      status: "ACTIVE",
      manager: "Jane Doe",
      clientId: client.id,
    },
  });

  await prisma.deliverable.createMany({
    data: [
      { projectId: project.id, name: "Requirements & Architecture", qty: 1, unitPrice: 75000, amount: 75000 },
      { projectId: project.id, name: "Platform Development Phase 1", qty: 1, unitPrice: 200000, amount: 200000 },
      { projectId: project.id, name: "Integration & Testing", qty: 1, unitPrice: 125000, amount: 125000 },
      { projectId: project.id, name: "Go-Live & Hypercare", qty: 1, unitPrice: 100000, amount: 100000 },
    ],
  });

  await prisma.resource.createMany({
    data: [
      { projectId: project.id, name: "Alice Johnson", role: "Lead Developer", utilizationPct: 100, weeklyHours: 40, costPerHour: 95 },
      { projectId: project.id, name: "Bob Martinez", role: "Business Analyst", utilizationPct: 75, weeklyHours: 30, costPerHour: 75 },
      { projectId: project.id, name: "Carol Chen", role: "QA Engineer", utilizationPct: 50, weeklyHours: 20, costPerHour: 65 },
    ],
  });

  await prisma.riskIssue.createMany({
    data: [
      { projectId: project.id, type: "RISK", title: "Integration complexity higher than estimated", impact: "HIGH", probability: "MEDIUM", status: "OPEN", mitigationPlan: "Add 2-week buffer sprint in Phase 2" },
      { projectId: project.id, type: "RISK", title: "Key stakeholder availability during UAT", impact: "MEDIUM", probability: "HIGH", status: "MITIGATED", mitigationPlan: "Pre-booked stakeholder calendar slots" },
      { projectId: project.id, type: "ISSUE", title: "Legacy API documentation incomplete", impact: "HIGH", status: "OPEN", owner: "Bob Martinez" },
    ],
  });

  await prisma.mandays.create({
    data: { projectId: project.id, totalContracted: 200, used: 85, billed: 75 },
  });

  await prisma.activityLog.create({
    data: {
      projectId: project.id,
      weekStartDate: new Date("2025-05-05"),
      reportedBy: "Jane Doe",
      summary: "Completed API design review, started integration layer development",
      accomplishments: "API spec finalized. 3 of 8 integration endpoints implemented.",
      plannedNextWeek: "Complete remaining 5 endpoints. Begin unit testing.",
      blockers: "Waiting on client to provide legacy system credentials.",
    },
  });

  const initiative = await prisma.initiative.create({
    data: {
      clientId: client.id,
      type: "RFP",
      name: "Cloud Migration RFP — Q3 2025",
      owner: "Sarah Wilson",
      qualificationDecision: "QUALIFIED",
      expectedRevenue: 1200000,
      description: "Large-scale cloud migration opportunity.",
    },
  });

  await prisma.actionItem.createMany({
    data: [
      { initiativeId: initiative.id, title: "Complete technical assessment", owner: "Alice Johnson", status: "COMPLETED", dueDate: new Date("2025-06-15"), updates: "Assessment complete." },
      { initiativeId: initiative.id, title: "Submit commercial proposal", owner: "Sarah Wilson", status: "IN_PROGRESS", dueDate: new Date("2025-06-30") },
      { initiativeId: initiative.id, title: "Arrange client presentation", owner: "Jane Doe", status: "PENDING", dueDate: new Date("2025-07-10") },
    ],
  });

  console.log("✅ Seed complete!");
}

main()
  .catch(e => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
