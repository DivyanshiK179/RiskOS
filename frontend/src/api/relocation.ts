import client from "./client";
import type { RelocationPlan, AlertItem, PriorityLevel, PlanStatus, AlertSeverity } from "../types";

export async function getAlerts(): Promise<AlertItem[]> {
  const res = await client.get<AlertItem[]>("/relocation/alerts/");
  return res.data;
}

export async function createAlert(data: {
  title: string;
  message: string;
  severity: AlertSeverity;
  habitation?: number | null;
}): Promise<AlertItem> {
  const res = await client.post<AlertItem>("/relocation/alerts/", data);
  return res.data;
}

export async function deleteAlert(id: number): Promise<void> {
  await client.delete(`/relocation/alerts/${id}/`);
}

export async function getRelocationPlans(): Promise<RelocationPlan[]> {
  const res = await client.get<RelocationPlan[]>("/relocation/plans/");
  return res.data;
}

export async function createRelocationPlan(data: {
  habitation: number;
  safe_site: number;
  priority: PriorityLevel;
  status?: PlanStatus;
  population_to_relocate: number;
  notes?: string;
}): Promise<RelocationPlan> {
  const res = await client.post<RelocationPlan>("/relocation/plans/", data);
  return res.data;
}

export async function updateRelocationPlan(
  id: number,
  data: Partial<{
    priority: PriorityLevel;
    status: PlanStatus;
    population_to_relocate: number;
    notes: string;
  }>
): Promise<RelocationPlan> {
  const res = await client.patch<RelocationPlan>(`/relocation/plans/${id}/`, data);
  return res.data;
}

export async function generateRelocationPlan(data: {
  habitation_id: number;
  safe_site_id?: number | null;
  population?: number;
  priority?: PriorityLevel;
}): Promise<RelocationPlan> {
  const res = await client.post<RelocationPlan>("/relocation/generate/", data);
  return res.data;
}

export async function broadcastEmergencyAlert(data: {
  title: string;
  message: string;
  severity: AlertSeverity;
  habitation_id?: number | null;
}): Promise<AlertItem> {
  const res = await client.post<AlertItem>("/alerts/broadcast/", data);
  return res.data;
}