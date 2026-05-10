export interface Client {
  id: string;
  name: string;
  industry?: string;
  contactName?: string;
  contactEmail?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  _count?: { projects: number };
  projects?: Project[];
  initiatives?: Initiative[];
}

export interface Project {
  id: string;
  name: string;
  description?: string;
  budget: number;
  startDate: string;
  endDate: string;
  status: "ACTIVE" | "ON_HOLD" | "COMPLETED" | "CANCELLED";
  manager: string;
  clientId: string;
  client?: { id: string; name: string };
  createdAt: string;
  updatedAt: string;
  _count?: { deliverables: number; resources: number; risks: number };
}

export interface Deliverable {
  id: string;
  projectId: string;
  name: string;
  amount: number;
  attachmentUrl?: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
}

export type PaymentStatus = "PENDING" | "IN_PROGRESS" | "INVOICED" | "COLLECTED";

export interface PaymentPlan {
  id: string;
  projectId: string;
  deliverableId?: string;
  deliverable?: { id: string; name: string };
  invoicingDate: string;
  status: PaymentStatus;
  amount: number;
  fiscalYear: string;
  attachmentUrl?: string;
  notes?: string;
  invoiceNumber?: string;
  createdAt: string;
  updatedAt: string;
}

export interface FiscalYearSummary {
  fiscalYear: string;
  forecasted: number;
  invoiced: number;
  collected: number;
  pending: number;
}

export interface Resource {
  id: string;
  projectId: string;
  name: string;
  role?: string;
  utilizationPct: number;
  weeklyHours: number;
  costPerHour: number;
  computedWeeklyCost: number;
  startDate?: string;
  endDate?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Document {
  id: string;
  projectId: string;
  name: string;
  fileUrl: string;
  mimeType?: string;
  sizeBytes?: number;
  uploadedBy?: string;
  category?: string;
  createdAt: string;
}

export interface ActivityLog {
  id: string;
  projectId: string;
  weekStartDate: string;
  reportedBy: string;
  summary: string;
  accomplishments?: string;
  plannedNextWeek?: string;
  blockers?: string;
  supportItems?: SupportItem[];
  createdAt: string;
  updatedAt: string;
}

export type SupportStatus = "OPEN" | "IN_PROGRESS" | "RESOLVED";

export interface SupportItem {
  id: string;
  description: string;
  status: SupportStatus;
  owner?: string;
  dueDate?: string;
  resolution?: string;
  priority: "LOW" | "MEDIUM" | "HIGH";
  projectId?: string;
  activityLogId?: string;
  initiativeId?: string;
  createdAt: string;
  updatedAt: string;
}

export type RiskLevel = "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
export type RiskStatus = "OPEN" | "MITIGATED" | "CLOSED" | "ACCEPTED";

export interface RiskIssue {
  id: string;
  projectId: string;
  type: "RISK" | "ISSUE";
  title: string;
  description?: string;
  probability?: RiskLevel;
  impact: RiskLevel;
  status: RiskStatus;
  owner?: string;
  mitigationPlan?: string;
  dueDate?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Mandays {
  id: string;
  projectId: string;
  totalContracted: number;
  used: number;
  billed: number;
  remaining: number;
  createdAt: string;
  updatedAt: string;
}

export type InitiativeType = "RFP" | "SUTHERLAND_DRIVEN";
export type QualificationDecision = "PENDING" | "QUALIFIED" | "NOT_QUALIFIED" | "ON_HOLD";

export interface Initiative {
  id: string;
  clientId?: string;
  client?: { id: string; name: string };
  type: InitiativeType;
  name: string;
  owner: string;
  qualificationDecision: QualificationDecision;
  expectedRevenue?: number;
  description?: string;
  actionItems?: ActionItem[];
  supportItems?: SupportItem[];
  createdAt: string;
  updatedAt: string;
  _count?: { actionItems: number };
}

export type ActionItemStatus = "PENDING" | "IN_PROGRESS" | "COMPLETED" | "BLOCKED";

export interface ActionItem {
  id: string;
  initiativeId: string;
  title: string;
  description?: string;
  status: ActionItemStatus;
  owner: string;
  dueDate?: string;
  updates?: string;
  createdAt: string;
  updatedAt: string;
}

export interface DashboardData {
  project: Project;
  financials: {
    totalBudget: number;
    totalForecasted: number;
    totalInvoiced: number;
    totalCollected: number;
    totalPending: number;
  };
  resources: Resource[];
  topRisks: RiskIssue[];
  mandays: (Mandays & { remaining: number }) | null;
}
