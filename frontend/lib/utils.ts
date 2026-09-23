import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(dateString: string | null | undefined): string {
  if (!dateString) return "N/A";
  try {
    const d = new Date(dateString);
    return d.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return dateString;
  }
}

export function formatScore(score: number | null | undefined): string {
  if (score === null || score === undefined) return "0.0";
  return Number(score).toFixed(1);
}

export function getStatusBadgeClass(status: string): string {
  switch (status) {
    case "Supported":
    case "VERIFIED":
    case "ANCHORED":
    case "READY":
    case "COMPLETED":
      return "bg-emerald-500/15 text-emerald-400 border-emerald-500/30";
    case "Partially Supported":
    case "Needs Human Review":
    case "EVALUATING":
    case "PENDING":
    case "IN_PROGRESS":
      return "bg-amber-500/15 text-amber-400 border-amber-500/30";
    case "Unsupported":
    case "Contradicted":
    case "TAMPERED":
    case "FAILED":
    case "INTEGRITY_VIOLATION":
      return "bg-rose-500/15 text-rose-400 border-rose-500/30";
    case "AI_AGENT":
    case "CLAIMS_IDENTIFIED":
    case "EXTRACTING":
    case "VERIFYING":
      return "bg-indigo-500/15 text-indigo-400 border-indigo-500/30";
    default:
      return "bg-slate-800 text-slate-300 border-slate-700";
  }
}
