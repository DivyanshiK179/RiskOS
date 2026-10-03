export type HazardLevel = "SAFE" | "MODERATE" | "HIGH" | "RED";
export type PriorityLevel = "IMMEDIATE" | "SHORT_TERM" | "MEDIUM_TERM";
export type PlanStatus = "PROPOSED" | "APPROVED" | "IN_PROGRESS" | "COMPLETED";
export type AlertSeverity = "INFO" | "WARNING" | "CRITICAL";
export type UserRole = "PUBLIC" | "OFFICIAL" | "SUPERADMIN";
export type NdmaRole = "DISTRICT_MAGISTRATE" | "DEOC_OPERATOR" | "SDRF_COMMANDER" | "PUBLIC_CITIZEN";
export type ApprovalStatus = "APPROVED" | "PENDING" | "REJECTED";

export interface UserProfile {
  id: number;
  username: string;
  email: string;
  first_name?: string;
  last_name?: string;
  role: UserRole;
  approval_status?: ApprovalStatus;
  clearanceRole?: NdmaRole;
  department: string;
  designation?: string;
  district: string;
  phone_number?: string;
  employee_id?: string;
  is_staff: boolean;
  date_joined?: string;
  twoFactorVerified?: boolean;
}

export interface HabitationFeatureProperties {
  name: string;
  district: string;
  state: string;
  population: number;
  hazard_score: number;
  vulnerability_score: number;
  hazard_level: HazardLevel;
  updated_at?: string;
}

export interface HabitationFeature {
  id: number;
  type: "Feature";
  geometry: {
    type: "Point";
    coordinates: [number, number]; // [lng, lat]
  };
  properties: HabitationFeatureProperties;
}

export interface HabitationGeoJSON {
  type: "FeatureCollection";
  features: HabitationFeature[];
}

export interface HabitationDetail {
  id: number;
  name: string;
  district: string;
  state: string;
  population: number;
  latitude: number;
  longitude: number;
  seismic_zone: string;
  avg_annual_rainfall_mm: number;
  extreme_rainfall_days: number;
  distance_to_river_km: number;
  elevation_m: number;
  pct_dilapidated_housing: number;
  pct_kutcha_roof_wall: number;
  pct_no_drinking_water_premises: number;
  pct_no_toilet: number;
  pct_no_drainage: number;
  hazard_score: number;
  vulnerability_score: number;
  hazard_level: HazardLevel;
  score_breakdown: {
    hazard: {
      seismic: number;
      rainfall_extreme: number;
      river_proximity: number;
      landslide_elevation: number;
    };
    vulnerability: {
      dilapidated_housing: number;
      kutcha_roof_wall: number;
      no_drinking_water: number;
      no_toilet: number;
      no_drainage: number;
    };
  };
  scored_at?: string;
}

export interface SafeSiteFeatureProperties {
  name: string;
  district: string;
  available_area_hectares: number;
  estimated_capacity: number;
  current_occupied: number;
  remaining_capacity: number;
  hazard_score: number;
  road_access: boolean;
  water_availability: boolean;
  facility_type?: string;
}

export interface SafeSiteFeature {
  id: number;
  type: "Feature";
  geometry: {
    type: "Point";
    coordinates: [number, number];
  };
  properties: SafeSiteFeatureProperties;
}

export interface SafeSiteGeoJSON {
  type: "FeatureCollection";
  features: SafeSiteFeature[];
}

export interface SafeSiteMatch {
  id: number;
  name: string;
  district: string;
  distance_km: number;
  remaining_capacity: number;
  suitability_score: number;
  can_fully_accommodate: boolean;
  latitude: number;
  longitude: number;
}

export interface RelocationPlan {
  id: number;
  habitation: number;
  habitation_name: string;
  safe_site: number;
  safe_site_name: string;
  priority: PriorityLevel;
  status: PlanStatus;
  population_to_relocate: number;
  notes?: string;
  created_by?: number;
  created_by_name?: string;
  created_at: string;
  updated_at: string;
}

export interface AlertItem {
  id: number;
  habitation?: number | null;
  habitation_name?: string | null;
  title: string;
  message: string;
  severity: AlertSeverity;
  created_by?: number | null;
  created_by_name?: string | null;
  created_at: string;
}

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
