import client from "./client";
import type { SafeSiteGeoJSON } from "../types";

export async function getSafeSites(params?: { district?: string; type?: string }): Promise<SafeSiteGeoJSON> {
  const res = await client.get<SafeSiteGeoJSON>("/geodata/safesites/", { params });
  return res.data;
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
