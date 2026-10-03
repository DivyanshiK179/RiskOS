import client from "./client";
import type { HabitationGeoJSON, HabitationDetail, SafeSiteMatch } from "../types";

export interface HabitationFilterParams {
  district?: string;
  hazard_level?: string;
  search?: string;
  in_bbox?: string;
}

export async function getHabitations(params?: HabitationFilterParams): Promise<HabitationGeoJSON> {
  try {
    const res = await client.get<HabitationGeoJSON>("/geodata/habitations/", { params });
    if (res.data?.features && res.data.features.length > 0) {
      return res.data;
    }
    throw new Error("No features returned from live backend");
  } catch (err) {
    console.warn("Live habitations backend query failed/unreachable. Loading authoritative offline GeoJSON layer:", err);
    try {
      const fallback = await fetch("/data/habitations.json");
      if (!fallback.ok) throw new Error(`HTTP error ${fallback.status}`);
      const data: HabitationGeoJSON = await fallback.json();
      if (params?.district || params?.hazard_level) {
        const filteredFeatures = data.features.filter((f) => {
          if (params.district && f.properties.district?.toLowerCase() !== params.district.toLowerCase()) return false;
          if (params.hazard_level && f.properties.hazard_level !== params.hazard_level) return false;
          return true;
        });
        return { ...data, features: filteredFeatures };
      }
      return data;
    } catch (fallbackErr) {
      console.error("Failed to load static habitations dataset:", fallbackErr);
      throw err;
    }
  }
}

export async function getHabitationDetail(id: number): Promise<HabitationDetail> {
  const res = await client.get<HabitationDetail>(`/geodata/habitations/${id}/`);
  return res.data;
}

export async function getSafeSiteMatches(habitationId: number): Promise<SafeSiteMatch[]> {
  const res = await client.get<SafeSiteMatch[]>(`/geodata/habitations/${habitationId}/safe_sites/`);
  return res.data;
}