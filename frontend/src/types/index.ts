export type HazardLevel = "SAFE" | "MODERATE" | "HIGH" | "RED";
export type PriorityLevel = "IMMEDIATE" | "SHORT_TERM" | "MEDIUM_TERM";
export type PlanStatus = "PROPOSED" | "APPROVED" | "IN_PROGRESS" | "COMPLETED";
export type AlertSeverity = "INFO" | "WARNING" | "CRITICAL";
export type UserRole = "PUBLIC" | "OFFICIAL" | "SUPERADMIN";
export type NdmaRole = "DISTRICT_MAGISTRATE" | "DEOC_OPERATOR" | "SDRF_COMMANDER" | "PUBLIC_CITIZEN";
export type ApprovalStatus = "APPROVED" | "PENDING" | "REJECTED";

export type OfficialTier = "NATIONAL_NDMA" | "STATE_SDMA" | "DISTRICT_DEOC" | "FIELD_RESPONDER";

export interface TierMetadata {
  tier: OfficialTier;
  titleEn: string;
  titleHi: string;
  shortTitle: string;
  badgeClass: string;
  jurisdictionEn: string;
  jurisdictionHi: string;
  scopeDescription: string;
}

export const TIER_METADATA: Record<OfficialTier, TierMetadata> = {
  NATIONAL_NDMA: {
    tier: "NATIONAL_NDMA",
    titleEn: "NDMA Apex Director / National Command",
    titleHi: "एनडीएमए शीर्ष निदेशक / राष्ट्रीय कमान",
    shortTitle: "Tier 1: NDMA Apex",
    badgeClass: "bg-purple-100 text-purple-800 border-purple-300 dark:bg-purple-950/70 dark:text-purple-300 dark:border-purple-800",
    jurisdictionEn: "National & Multi-State Overview",
    jurisdictionHi: "राष्ट्रीय एवं अंतर-राज्यीय पर्यवेक्षण",
    scopeDescription: "Statewide & inter-state overview, national resource mobilization, full audit logs",
  },
  STATE_SDMA: {
    tier: "STATE_SDMA",
    titleEn: "SEOC State Officer / SDMA Secretariat",
    titleHi: "एसईओसी राज्य अधिकारी / एसडीएमए सचिवालय",
    shortTitle: "Tier 2: State SDMA",
    badgeClass: "bg-blue-100 text-blue-800 border-blue-300 dark:bg-blue-950/70 dark:text-blue-300 dark:border-blue-800",
    jurisdictionEn: "State Command (Uttarakhand SEOC)",
    jurisdictionHi: "राज्य कमान (उत्तराखंड एसईओसी)",
    scopeDescription: "Full GIS command, AI scenario blast execution, evacuation order authorization",
  },
  DISTRICT_DEOC: {
    tier: "DISTRICT_DEOC",
    titleEn: "District Magistrate (DM) / DEOC Nodal Officer",
    titleHi: "जिला मजिस्ट्रेट (डीएम) / डीईओसी नोडल अधिकारी",
    shortTitle: "Tier 3: District DEOC",
    badgeClass: "bg-amber-100 text-amber-800 border-amber-300 dark:bg-amber-950/70 dark:text-amber-300 dark:border-amber-800",
    jurisdictionEn: "District Command (District EOC)",
    jurisdictionHi: "जिला कमान (जिला आपातकालीन केंद्र)",
    scopeDescription: "District-scoped telemetry, local shelter management, incident dispatch forms",
  },
  FIELD_RESPONDER: {
    tier: "FIELD_RESPONDER",
    titleEn: "SDRF Field Commander / Tehsil Revenue Officer",
    titleHi: "एसडीआरएफ फील्ड कमांडर / तहसील राजस्व अधिकारी",
    shortTitle: "Tier 4: SDRF Field",
    badgeClass: "bg-emerald-100 text-emerald-800 border-emerald-300 dark:bg-emerald-950/70 dark:text-emerald-300 dark:border-emerald-800",
    jurisdictionEn: "Tehsil & Field Operations",
    jurisdictionHi: "तहसील एवं जमीनी राहत अभियान",
    scopeDescription: "Mobile field incident reporting, SOS verification, shelter capacity updates",
  },
};

export interface UserProfile {
  id: number;
  username: string;
  email: string;
  first_name?: string;
  last_name?: string;
  role: UserRole;
  tier?: OfficialTier;
  official_id?: string;
  cadre_designation?: string;
  assigned_district?: string;
  is_2fa_enrolled?: boolean;
  is_approved_by_nodal?: boolean;
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
  type?: string;
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
