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

export interface AffectedHabitation {
  id: number;
  name: string;
  district: string;
  hazard_level: string;
  hazard_score: number;
  population: number;
  lat: number;
  lon: number;
  distance_from_epicenter_km: number;
  distance_km?: number;
  impact_zone: "ZONE_1" | "ZONE_2" | "ZONE_3";
  severity_tier: "CRITICAL DIRECT HIT" | "HIGH WATCH" | "ADVISORY";
  assigned_safe_site?: { id: number; name: string; lat: number; lon: number; distance_km: number } | null;
}

export interface ReachableShelter {
  id: number;
  name: string;
  district: string;
  lat: number;
  lon: number;
  capacity: number;
  remaining_capacity: number;
  distance_km: number;
}

export interface SimulationResult {
  epicenter: {
    lat: number;
    lon: number;
    radius_km: number;
    type: string;
    landmark?: string;
  };
  disaster_type?: string;
  summary: {
    total_affected_habitations: number;
    total_affected_population: number;
    critical_red_count: number;
    high_risk_count: number;
    zone_1_count: number;
    zone_2_count: number;
    zone_3_count: number;
    active_safe_sites_count: number;
    estimated_evacuation_mins: number;
  };
  affected_habitations: AffectedHabitation[];
  total_affected_population: number;
  reachable_shelters?: ReachableShelter[];
}

export async function simulateDisaster(lat: number, lon: number, radius_km: number, type: string): Promise<SimulationResult> {
  const res = await client.post<SimulationResult>("/geodata/simulate-disaster/", { lat, lon, radius_km, type });
  return res.data;
}
