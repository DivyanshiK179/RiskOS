import client from "./client";
import type { HabitationGeoJSON, HabitationDetail, SafeSiteMatch } from "../types";

export interface HabitationFilterParams {
  district?: string;
  hazard_level?: string;
  search?: string;
  in_bbox?: string;
}

export async function getHabitations(params?: HabitationFilterParams): Promise<HabitationGeoJSON> {
  const res = await client.get<HabitationGeoJSON>("/geodata/habitations/", { params });
  return res.data;
}

export async function getHabitationDetail(id: number): Promise<HabitationDetail> {
  const res = await client.get<HabitationDetail>(`/geodata/habitations/${id}/`);
  return res.data;
}

export async function getSafeSiteMatches(habitationId: number): Promise<SafeSiteMatch[]> {
  const res = await client.get<SafeSiteMatch[]>(`/geodata/habitations/${habitationId}/safe_sites/`);
  return res.data;
}