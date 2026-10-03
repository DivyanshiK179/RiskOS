import client from "./client";
import type { SafeSiteGeoJSON } from "../types";

export async function getSafeSites(params?: { district?: string; type?: string }): Promise<SafeSiteGeoJSON> {
  try {
    const res = await client.get<SafeSiteGeoJSON>("/geodata/safesites/", { params });
    if (res.data?.features && res.data.features.length > 0) {
      return res.data;
    }
    throw new Error("No safe site features returned from backend");
  } catch (err) {
    console.warn("Live safe sites backend query failed/unreachable. Loading authoritative offline GeoJSON layer:", err);
    try {
      const fallback = await fetch("/data/safesites.json");
      if (!fallback.ok) throw new Error(`HTTP error ${fallback.status}`);
      const data: SafeSiteGeoJSON = await fallback.json();
      if (params?.district || params?.type) {
        const filteredFeatures = data.features.filter((f) => {
          if (params.district && f.properties.district?.toLowerCase() !== params.district.toLowerCase()) return false;
          if (params.type && f.properties.facility_type !== params.type) return false;
          return true;
        });
        return { ...data, features: filteredFeatures };
      }
      return data;
    } catch (fallbackErr) {
      console.error("Failed to load static safe sites dataset:", fallbackErr);
      throw err;
    }
  }
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
