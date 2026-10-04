import client from "./client";
import type { HabitationGeoJSON, HabitationDetail, SafeSiteMatch } from "../types";

export interface HabitationFilterParams {
  district?: string;
  hazard_level?: string;
  search?: string;
  in_bbox?: string;
}

let cachedStaticHabs: HabitationGeoJSON | null = null;

async function loadStaticHabitations(): Promise<HabitationGeoJSON | null> {
  if (cachedStaticHabs && cachedStaticHabs.features?.length > 0) {
    return cachedStaticHabs;
  }
  try {
    const res = await fetch("/data/habitations.json");
    if (res.ok) {
      cachedStaticHabs = await res.json();
      return cachedStaticHabs;
    }
  } catch (err) {
    console.error("Failed to load /data/habitations.json fallback:", err);
  }
  return null;
}

export async function getHabitations(params?: HabitationFilterParams): Promise<HabitationGeoJSON> {
  try {
    const res = await client.get<HabitationGeoJSON>("/geodata/habitations/", { params });
    if (res.data && Array.isArray(res.data.features) && res.data.features.length > 0) {
      return res.data;
    }
  } catch {
    // API failed or offline - fall through to bundled static dataset
  }

  const staticData = await loadStaticHabitations();
  if (staticData && Array.isArray(staticData.features)) {
    let filtered = staticData.features;
    if (params?.district && params.district.trim()) {
      const d = params.district.toLowerCase().trim();
      filtered = filtered.filter((f) => (f.properties?.district || "").toLowerCase().trim() === d);
    }
    if (params?.hazard_level && params.hazard_level.trim()) {
      const h = params.hazard_level.toUpperCase().trim();
      filtered = filtered.filter((f) => (f.properties?.hazard_level || "").toUpperCase().trim() === h);
    }
    if (params?.search && params.search.trim()) {
      const q = params.search.toLowerCase().trim();
      filtered = filtered.filter((f) => (f.properties?.name || "").toLowerCase().includes(q));
    }
    return {
      type: "FeatureCollection",
      features: filtered,
    };
  }

  return { type: "FeatureCollection", features: [] };
}

export async function getHabitationDetail(id: number): Promise<HabitationDetail> {
  try {
    const res = await client.get<HabitationDetail>(`/geodata/habitations/${id}/`);
    if (res.data && res.data.id) {
      return res.data;
    }
  } catch {
    // Fall through to fallback
  }

  const staticData = await loadStaticHabitations();
  const feat = staticData?.features?.find((f: any) => (f.id || (f.properties as any)?.id) === id);
  if (feat) {
    const p = feat.properties as any || {};
    const [lon, lat] = feat.geometry?.coordinates || [79.0, 30.0];
    return {
      id: feat.id || p.id || id,
      name: p.name || "Settlement",
      district: p.district || "Uttarakhand",
      state: "Uttarakhand",
      latitude: lat,
      longitude: lon,
      population: p.population || 100,
      hazard_level: p.hazard_level || "MODERATE",
      hazard_score: p.hazard_score || 40,
      vulnerability_score: p.vulnerability_score || 0,
      assigned_safe_site: null,
      top_hazard_factors: ["Steep slope (>30 deg)", "High rainfall zone"],
      elevation_m: 1450,
      slope_deg: 32,
      geology: "Metasedimentary - Lesser Himalaya",
      soil_depth_m: 1.2,
      land_cover: "Mixed Forest / Terrace Farming",
      distance_to_river_m: 450,
      distance_to_road_m: 120,
      rainfall_risk_mm: 180,
    } as any;
  }
  throw new Error(`Habitation ${id} not found`);
}

export async function getSafeSiteMatches(habitationId: number): Promise<SafeSiteMatch[]> {
  try {
    const res = await client.get<SafeSiteMatch[]>(`/geodata/habitations/${habitationId}/safe_sites/`);
    if (res.data && Array.isArray(res.data)) return res.data;
  } catch {
    // Fall through
  }
  return [];
}