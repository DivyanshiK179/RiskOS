// Shared badge/status utilities — centralised so all components stay consistent
import type { HazardLevel, PlanStatus, AlertSeverity } from "../types";

export function hazardBadgeClass(level: HazardLevel): string {
  switch (level) {
    case "RED": return "badge-red";
    case "HIGH": return "badge-high";
    case "MODERATE": return "badge-moderate";
    case "SAFE": return "badge-safe";
    default: return "badge-info";
  }
}

export function hazardLabel(level: HazardLevel): string {
  switch (level) {
    case "RED": return "Red Zone";
    case "HIGH": return "High Risk";
    case "MODERATE": return "Moderate";
    case "SAFE": return "Safe";
    default: return level;
  }
}

export function statusBadgeClass(status: PlanStatus): string {
  switch (status) {
    case "PROPOSED": return "inline-flex px-2 py-0.5 rounded text-[11px] font-semibold uppercase bg-slate-800 text-slate-300 border border-slate-700";
    case "APPROVED": return "inline-flex px-2 py-0.5 rounded text-[11px] font-semibold uppercase bg-blue-950 text-blue-400 border border-blue-800/60";
    case "IN_PROGRESS": return "inline-flex px-2 py-0.5 rounded text-[11px] font-semibold uppercase bg-yellow-950 text-yellow-400 border border-yellow-800/60";
    case "COMPLETED": return "inline-flex px-2 py-0.5 rounded text-[11px] font-semibold uppercase bg-green-950 text-green-400 border border-green-800/60";
    default: return "inline-flex px-2 py-0.5 rounded text-[11px] font-semibold uppercase bg-slate-800 text-slate-400";
  }
}

export function alertSeverityClass(severity: AlertSeverity): string {
  switch (severity) {
    case "CRITICAL": return "badge-red";
    case "WARNING": return "badge-high";
    case "INFO": return "badge-info";
    default: return "badge-info";
  }
}

export function priorityBadgeClass(priority: string): string {
  switch (priority) {
    case "IMMEDIATE": return "inline-flex px-2 py-0.5 rounded text-[11px] font-semibold uppercase bg-red-950 text-red-400 border border-red-800/60";
    case "SHORT_TERM": return "inline-flex px-2 py-0.5 rounded text-[11px] font-semibold uppercase bg-orange-950 text-orange-400 border border-orange-800/60";
    case "MEDIUM_TERM": return "inline-flex px-2 py-0.5 rounded text-[11px] font-semibold uppercase bg-slate-800 text-slate-300 border border-slate-700";
    default: return "inline-flex px-2 py-0.5 rounded text-[11px] font-semibold uppercase bg-slate-800 text-slate-300";
  }
}

export function hazardDotColor(level: HazardLevel): string {
  switch (level) {
    case "RED": return "bg-red-500";
    case "HIGH": return "bg-orange-500";
    case "MODERATE": return "bg-yellow-500";
    case "SAFE": return "bg-green-500";
    default: return "bg-slate-500";
  }
}

export function formatNumber(n: number): string {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + "M";
  if (n >= 1_000) return (n / 1_000).toFixed(1) + "K";
  return n.toLocaleString();
}
