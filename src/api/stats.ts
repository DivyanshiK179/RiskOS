import client from "./client";

export interface GeoStats {
  total_habitations: number;
  red_count: number;
  high_count: number;
  moderate_count: number;
  safe_count: number;
  total_population_at_risk: number;
  total_safe_sites: number;
  total_shelter_capacity: number;
  districts: string[];
}

export async function getGeoStats(): Promise<GeoStats> {
  const res = await client.get<GeoStats>("/geodata/stats/");
  return res.data;
}

export interface SimulationResult {
  epicenter: { lat: number; lon: number; radius_km: number };
  affected_habitations: {
    id: number;
    name: string;
    population: number;
    lat: number;
    lon: number;
    assigned_safe_site?: { id: number; name: string; lat: number; lon: number } | null;
  }[];
  total_affected_population: number;
}

export async function simulateDisaster(lat: number, lon: number, radius_km: number, type: string): Promise<SimulationResult> {
  const res = await client.post<SimulationResult>("/geodata/simulate-disaster/", { lat, lon, radius_km, type });
  return res.data;
}
