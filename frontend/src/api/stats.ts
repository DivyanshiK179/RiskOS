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
  selected_district?: string;
}

export async function getGeoStats(district?: string): Promise<GeoStats> {
  const params: any = {};
  if (district && district !== "All Uttarakhand") {
    params.district = district;
  }
  const res = await client.get<GeoStats>("/geodata/stats/", { params });
  return res.data;
}

export interface RiskTierDistribution {
  red_count: number;
  red_pct: number;
  red_population: number;
  high_count: number;
  high_pct: number;
  high_population: number;
  mod_count: number;
  mod_pct: number;
  mod_population: number;
  safe_count: number;
  safe_pct: number;
  safe_population: number;
}

export interface DistrictComparisonItem {
  district: string;
  total_habitations: number;
  high_risk_count: number;
  population_at_risk: number;
  total_population: number;
  shelter_capacity: number;
  capacity_coverage_pct: number;
  vulnerability_index: number;
  is_selected: boolean;
}

export interface RelocationRecentPlan {
  id: number;
  habitation_id: number;
  habitation_name: string;
  district: string;
  safe_site_id: number;
  safe_site_name: string;
  priority: string;
  status: string;
  population_to_relocate: number;
  notes: string;
  created_at: string | null;
}

export interface RelocationPipelineStats {
  by_status: {
    PROPOSED: { count: number; population: number };
    APPROVED: { count: number; population: number };
    IN_PROGRESS: { count: number; population: number };
    COMPLETED: { count: number; population: number };
  };
  recent_plans: RelocationRecentPlan[];
}

export interface HazardTriggerItem {
  id: string;
  label: string;
  label_hi: string;
  count: number;
  pct: number;
  color: string;
}

export interface AnalyticsOverviewData {
  timestamp: string;
  selected_district: string;
  districts: string[];
  metrics: {
    total_settlements: number;
    population_at_risk: number;
    total_population: number;
    total_shelter_capacity: number;
    total_shelter_occupied: number;
    remaining_shelter_capacity: number;
    occupancy_rate: number;
    total_safe_sites: number;
    total_plans: number;
    proposed_plans: number;
    approved_plans: number;
    in_progress_plans: number;
    completed_plans: number;
    pending_plans: number;
    population_in_relocation: number;
  };
  risk_distribution: RiskTierDistribution;
  district_comparisons: DistrictComparisonItem[];
  relocation_pipeline: RelocationPipelineStats;
  hazard_triggers: HazardTriggerItem[];
}

export async function getAnalyticsOverview(district?: string): Promise<AnalyticsOverviewData> {
  const params: any = {};
  if (district && district !== "All Uttarakhand") {
    params.district = district;
  }
  const res = await client.get<AnalyticsOverviewData>("/v1/analytics/overview/", { params });
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
