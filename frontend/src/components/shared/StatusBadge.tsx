import { cn } from "@/lib/utils";
import type { PaymentStatus, RiskLevel, RiskStatus, SupportStatus, ActionItemStatus } from "@/types";

type AnyStatus = PaymentStatus | RiskLevel | RiskStatus | SupportStatus | ActionItemStatus | string;

const statusConfig: Record<string, { label: string; className: string }> = {
  PENDING: { label: "Pending", className: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30" },
  IN_PROGRESS: { label: "In Progress", className: "bg-blue-500/20 text-blue-400 border-blue-500/30" },
  INVOICED: { label: "Invoiced", className: "bg-purple-500/20 text-purple-400 border-purple-500/30" },
  COLLECTED: { label: "Collected", className: "bg-green-500/20 text-green-400 border-green-500/30" },
  OPEN: { label: "Open", className: "bg-red-500/20 text-red-400 border-red-500/30" },
  MITIGATED: { label: "Mitigated", className: "bg-orange-500/20 text-orange-400 border-orange-500/30" },
  CLOSED: { label: "Closed", className: "bg-gray-500/20 text-gray-400 border-gray-500/30" },
  ACCEPTED: { label: "Accepted", className: "bg-teal-500/20 text-teal-400 border-teal-500/30" },
  RESOLVED: { label: "Resolved", className: "bg-green-500/20 text-green-400 border-green-500/30" },
  COMPLETED: { label: "Completed", className: "bg-green-500/20 text-green-400 border-green-500/30" },
  BLOCKED: { label: "Blocked", className: "bg-red-500/20 text-red-400 border-red-500/30" },
  LOW: { label: "Low", className: "bg-green-500/20 text-green-400 border-green-500/30" },
  MEDIUM: { label: "Medium", className: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30" },
  HIGH: { label: "High", className: "bg-orange-500/20 text-orange-400 border-orange-500/30" },
  CRITICAL: { label: "Critical", className: "bg-red-600/30 text-red-300 border-red-500/40" },
  ACTIVE: { label: "Active", className: "bg-green-500/20 text-green-400 border-green-500/30" },
  ON_HOLD: { label: "On Hold", className: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30" },
  CANCELLED: { label: "Cancelled", className: "bg-gray-500/20 text-gray-400 border-gray-500/30" },
  QUALIFIED: { label: "Qualified", className: "bg-green-500/20 text-green-400 border-green-500/30" },
  NOT_QUALIFIED: { label: "Not Qualified", className: "bg-red-500/20 text-red-400 border-red-500/30" },
  RFP: { label: "RFP", className: "bg-blue-500/20 text-blue-400 border-blue-500/30" },
  SUTHERLAND_DRIVEN: { label: "Sutherland Driven", className: "bg-purple-500/20 text-purple-400 border-purple-500/30" },
};

interface Props {
  status: AnyStatus;
  className?: string;
}

export function StatusBadge({ status, className }: Props) {
  const config = statusConfig[status] || { label: status, className: "bg-gray-500/20 text-gray-400 border-gray-500/30" };
  return (
    <span className={cn("inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border", config.className, className)}>
      {config.label}
    </span>
  );
}
