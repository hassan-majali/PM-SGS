import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import type { Initiative, ActivityLog, Project } from "@/types";
import { formatDate, formatCurrency } from "./utils";

export function exportInitiativePDF(initiative: Initiative) {
  const doc = new jsPDF();
  const purple = [99, 102, 241] as [number, number, number];

  doc.setFillColor(...purple);
  doc.rect(0, 0, 220, 30, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(18);
  doc.setFont("helvetica", "bold");
  doc.text("Initiative Report", 14, 18);
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text(`Generated: ${formatDate(new Date().toISOString())}`, 140, 18);

  doc.setTextColor(30, 30, 30);
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.text(initiative.name, 14, 44);

  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  const details = [
    ["Type", initiative.type === "SUTHERLAND_DRIVEN" ? "Sutherland Driven" : "RFP"],
    ["Owner", initiative.owner],
    ["Qualification", initiative.qualificationDecision],
    ["Expected Revenue", initiative.expectedRevenue ? formatCurrency(initiative.expectedRevenue) : "—"],
    ["Client", initiative.client?.name || "—"],
  ];
  let y = 52;
  for (const [label, value] of details) {
    doc.setFont("helvetica", "bold");
    doc.text(`${label}:`, 14, y);
    doc.setFont("helvetica", "normal");
    doc.text(String(value), 60, y);
    y += 7;
  }

  if (initiative.description) {
    y += 4;
    doc.setFont("helvetica", "bold");
    doc.text("Description:", 14, y);
    y += 6;
    doc.setFont("helvetica", "normal");
    const lines = doc.splitTextToSize(initiative.description, 180);
    doc.text(lines, 14, y);
    y += lines.length * 5 + 4;
  }

  if (initiative.actionItems?.length) {
    y += 4;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.text("Action Items", 14, y);
    y += 2;

    autoTable(doc, {
      startY: y + 2,
      head: [["Title", "Owner", "Status", "Due Date", "Updates"]],
      body: initiative.actionItems.map(a => [
        a.title,
        a.owner,
        a.status,
        formatDate(a.dueDate),
        a.updates || "—",
      ]),
      headStyles: { fillColor: purple },
      styles: { fontSize: 9 },
      columnStyles: { 4: { cellWidth: 50 } },
    });
  }

  if (initiative.supportItems?.length) {
    const finalY = (doc as jsPDF & { lastAutoTable: { finalY: number } }).lastAutoTable?.finalY || y + 10;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.text("Support Needed", 14, finalY + 10);

    autoTable(doc, {
      startY: finalY + 14,
      head: [["Description", "Owner", "Status", "Priority", "Due Date"]],
      body: initiative.supportItems.map(s => [
        s.description,
        s.owner || "—",
        s.status,
        s.priority,
        formatDate(s.dueDate),
      ]),
      headStyles: { fillColor: purple },
      styles: { fontSize: 9 },
    });
  }

  doc.save(`initiative-${initiative.name.replace(/\s+/g, "-")}.pdf`);
}

export function exportActivityReportPDF(project: Project, logs: ActivityLog[]) {
  const doc = new jsPDF();
  const purple = [99, 102, 241] as [number, number, number];

  doc.setFillColor(...purple);
  doc.rect(0, 0, 220, 30, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(18);
  doc.setFont("helvetica", "bold");
  doc.text("Weekly Activity Report", 14, 18);
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text(`Generated: ${formatDate(new Date().toISOString())}`, 130, 18);

  doc.setTextColor(30, 30, 30);
  doc.setFontSize(13);
  doc.setFont("helvetica", "bold");
  doc.text(`Project: ${project.name}`, 14, 42);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.text(`Manager: ${project.manager}  |  Client: ${(project as Project & { client?: { name: string } }).client?.name || "—"}`, 14, 50);

  autoTable(doc, {
    startY: 58,
    head: [["Week", "Reported By", "Summary", "Accomplishments", "Next Week", "Blockers"]],
    body: logs.map(l => [
      formatDate(l.weekStartDate, "MMM d, yyyy"),
      l.reportedBy,
      l.summary,
      l.accomplishments || "—",
      l.plannedNextWeek || "—",
      l.blockers || "—",
    ]),
    headStyles: { fillColor: purple },
    styles: { fontSize: 8, cellPadding: 3 },
    columnStyles: { 2: { cellWidth: 35 }, 3: { cellWidth: 35 }, 4: { cellWidth: 35 } },
  });

  doc.save(`activity-report-${project.name.replace(/\s+/g, "-")}.pdf`);
}
