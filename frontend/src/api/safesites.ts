import client from "./client";
import type { SafeSiteGeoJSON } from "../types";

let cachedStaticSites: SafeSiteGeoJSON | null = null;

async function loadStaticSafeSites(): Promise<SafeSiteGeoJSON | null> {
  if (cachedStaticSites && cachedStaticSites.features?.length > 0) {
    return cachedStaticSites;
  }
  try {
    const res = await fetch("/data/safesites.json");
    if (res.ok) {
      cachedStaticSites = await res.json();
      return cachedStaticSites;
    }
  } catch (err) {
    console.error("Failed to load /data/safesites.json fallback:", err);
  }
  return null;
}

export async function getSafeSites(params?: { district?: string; type?: string }): Promise<SafeSiteGeoJSON> {
  try {
    const res = await client.get<SafeSiteGeoJSON>("/geodata/safesites/", { params });
    if (res.data && Array.isArray(res.data.features) && res.data.features.length > 0) {
      return res.data;
    }
  } catch {
    // API failed or offline - fall through to bundled static dataset
  }

  const staticData = await loadStaticSafeSites();
  if (staticData && Array.isArray(staticData.features)) {
    let filtered = staticData.features;
    if (params?.district && params.district.trim()) {
      const d = params.district.toLowerCase().trim();
      filtered = filtered.filter((f) => (f.properties?.district || "").toLowerCase().trim() === d);
    }
    if (params?.type && params.type !== "all") {
      const t = params.type.toLowerCase().trim();
      filtered = filtered.filter(
        (f) =>
          ((f.properties as any)?.facility_type || (f.properties as any)?.type || "").toLowerCase().trim() === t
      );
    }
    return {
      type: "FeatureCollection",
      features: filtered,
    };
  }

  return { type: "FeatureCollection", features: [] };
}

export async function createSafeSite(data: {
  name: string;
  district: string;
  latitude: number;
  longitude: number;
  available_area_hectares: number;
  estimated_capacity: number;
  current_occupied?: number;
  hazard_score?: number;
  road_access?: boolean;
  water_availability?: boolean;
}) {
  const payload = {
    name: data.name,
    district: data.district,
    location: {
      type: "Point",
      coordinates: [data.longitude, data.latitude],
    },
    available_area_hectares: data.available_area_hectares,
    estimated_capacity: data.estimated_capacity,
    current_occupied: data.current_occupied ?? 0,
    hazard_score: data.hazard_score ?? 10,
    road_access: data.road_access ?? true,
    water_availability: data.water_availability ?? true,
  };
  const res = await client.post("/geodata/safesites/", payload);
  return res.data;
}
