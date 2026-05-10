import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { format, parseISO } from "date-fns";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number, currency = "USD") {
  return new Intl.NumberFormat("en-US", { style: "currency", currency, maximumFractionDigits: 0 }).format(amount);
}

export function formatDate(date: string | Date | undefined, fmt = "MMM d, yyyy") {
  if (!date) return "—";
  try {
    const d = typeof date === "string" ? parseISO(date) : date;
    return format(d, fmt);
  } catch {
    return "—";
  }
}

export function formatNumber(n: number) {
  return new Intl.NumberFormat("en-US").format(n);
}

export function formatFileSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function getInitials(name: string) {
  return name
    .split(" ")
    .map(n => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

export function getCurrentFiscalYear() {
  const now = new Date();
  const year = now.getFullYear();
  return now.getMonth() >= 3 ? `FY${year + 1}` : `FY${year}`;
}

export function fiscalYearOptions(count = 5) {
  const current = new Date().getFullYear();
  return Array.from({ length: count }, (_, i) => `FY${current - 1 + i}`);
}
