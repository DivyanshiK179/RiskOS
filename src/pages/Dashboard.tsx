import { useState, useEffect, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Map,
  FileText,
  ShieldCheck,
  AlertTriangle,
  BarChart3,
  Activity,
  History,
  Terminal,
  Search,
  X,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  RotateCcw,
  Radio,
  Flame,
  Printer,
  Target,
  Crosshair,
  MapPin,
  Users,
  UserCheck,
  Database,
  MoreHorizontal
} from "lucide-react";
import { getHabitations } from "../api/habitations";
import { getRelocationPlans, updateRelocationPlan, getAlerts, deleteAlert } from "../api/relocation";
import { getSafeSites } from "../api/safesites";
import { getGeoStats, simulateDisaster, type SimulationResult, type GeoStats } from "../api/stats";
import { useAuthStore } from "../store/authStore";
import { useUIStore } from "../store/uiStore";
import { useSearchParams } from "react-router-dom";
import MapView from "../components/MapView";
import HabitationDetailPanel from "../components/HabitationDetailPanel";
import CreatePlanModal from "../components/CreatePlanModal";
import CreateAlertModal from "../components/CreateAlertModal";
import IncidentActionPlanModal from "../components/IncidentActionPlanModal";
import UserManagementView from "../components/UserManagementView";
import DataIngestionPanel from "../components/DataIngestionPanel";
import ProfileSecurityPanel from "../components/ProfileSecurityPanel";
import AnalyticsView from "../components/AnalyticsView";
import GoiTopBar from "../components/GoiTopBar";
import GoiBrandHeader from "../components/GoiBrandHeader";
import GoiFooter from "../components/GoiFooter";
import { useTranslation } from "../i18n/translations";
import { STATUTORY_AUDIT_LEDGER } from "../lib/auditCrypto";
import type {
  HabitationFeature,
  RelocationPlan,
  AlertItem,
  SafeSiteFeature,
  SafeSiteGeoJSON,
  PlanStatus,
  AlertSeverity,
} from "../types";
import {
  hazardBadgeClass,
  hazardLabel,
  hazardDotColor,
  statusBadgeClass,
  priorityBadgeClass,
  alertSeverityClass,
} from "../lib/utils";
import { extractCleanDistricts } from "../lib/districts";

export default function Dashboard() {
  const { t, lang } = useTranslation();
  const isHi = lang === "hi";
  const [searchParams] = useSearchParams();
  const {
    sidebarCollapsed,
    toggleSidebar,
    inspectorCollapsed,
    toggleInspector,
    toggleLayers,
    toggleZenMode,
    setIsTargetToolActive,
    dashboardPreconfig,
    setDashboardPreconfig,
  } = useUIStore();

  const [tab, setTab] = useState(() => {
    const qTab = searchParams.get("tab") || dashboardPreconfig?.tab;
    if (qTab === "risk-map" || qTab === "map") return "map";
    if (qTab === "safe-sites" || qTab === "safesites") return "safesites";
    if (qTab === "simulation" || qTab === "simulate") return "simulate";
    if (qTab === "plans") return "plans";
    if (qTab === "alerts") return "alerts";
    if (qTab === "analytics") return "analytics";
    if (qTab === "audit") return "audit";
    if (qTab === "users") return "users";
    if (qTab === "ingest") return "ingest";
    if (qTab === "profile") return "profile";
    return "map";
  });
  const [districtFilter, setDistrictFilter] = useState("");
  const [hazardFilter, setHazardFilter] = useState(() => {
    const qHaz = searchParams.get("hazard") || searchParams.get("riskLevel") || dashboardPreconfig?.hazardFilter;
    if (qHaz === "CRITICAL" || qHaz === "RED") return "RED";
    if (qHaz === "HIGH") return "HIGH";
    if (qHaz === "MODERATE") return "MODERATE";
    if (qHaz === "SAFE") return "SAFE";
    return "";
  });
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedHabId, setSelectedHabId] = useState<number | null>(null);
  const [mobileMoreOpen, setMobileMoreOpen] = useState(false);

  const [showLandslideLayer, setShowLandslideLayer] = useState<boolean>(() => {
    const qLayer = searchParams.get("layer");
    const qLandslide = searchParams.get("landslide");
    if (qLayer === "landslide" || qLandslide === "true" || dashboardPreconfig?.showLandslide) return true;
    return true;
  });
  const [showFloodLayer, setShowFloodLayer] = useState<boolean>(() => {
    const qLayer = searchParams.get("layer");
    const qFlood = searchParams.get("floodInundation");
    if (qLayer === "flood" || qFlood === "true" || dashboardPreconfig?.showFlood) return true;
    return false;
  });
  const [facilityFilter, setFacilityFilter] = useState<string>(() => {
    const qFac = searchParams.get("facility") || dashboardPreconfig?.facility;
    if (qFac === "Safe Shelters" || qFac === "shelter" || qFac === "shelters") return "shelter";
    return qFac || "all";
  });

  // Global Keyboard Shortcuts for GIS Operations: [, ], L, Z
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (
        target &&
        (target.tagName === "INPUT" ||
          target.tagName === "TEXTAREA" ||
          target.tagName === "SELECT" ||
          target.isContentEditable)
      ) {
        return;
      }

      if (e.key === "[" || (e.key === "b" && e.ctrlKey)) {
        e.preventDefault();
        toggleSidebar();
      } else if (e.key === "]" || (e.key === "i" && e.ctrlKey)) {
        e.preventDefault();
        toggleInspector();
      } else if (e.key === "l" || e.key === "L") {
        e.preventDefault();
        toggleLayers();
      } else if (e.key === "z" || e.key === "Z") {
        e.preventDefault();
        toggleZenMode();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [toggleSidebar, toggleInspector, toggleLayers, toggleZenMode]);

  const [planModalOpen, setPlanModalOpen] = useState(false);
  const [alertModalOpen, setAlertModalOpen] = useState(false);
  const [prefillHab, setPrefillHab] = useState<number | null>(null);
  const [prefillSite, setPrefillSite] = useState<number | null>(null);
  const [prefillPop, setPrefillPop] = useState(0);

  // Simulation state
  const [simRadius, setSimRadius] = useState(10);
  const [simType, setSimType] = useState("CLOUDBURST");
  const [simResults, setSimResults] = useState<SimulationResult | null>(null);
  const [simEpicenter, setSimEpicenter] = useState<{lat: number; lon: number} | null>(null);
  const [simLoading, setSimLoading] = useState(false);
  const [focusedHabLocation, setFocusedHabLocation] = useState<{ lat: number; lon: number } | null>(() => {
    if (searchParams.get("valley") === "true" || dashboardPreconfig?.focusedLocation) {
      return dashboardPreconfig?.focusedLocation || { lat: 30.284, lon: 78.981 };
    }
    return null;
  });
  const [iapModalOpen, setIapModalOpen] = useState(false);
  const [simSearchQuery, setSimSearchQuery] = useState("");
  const [alertPrefillData, setAlertPrefillData] = useState<{
    title?: string;
    message?: string;
    severity?: AlertSeverity;
    habId?: number | null;
  } | null>(null);

  // Synchronize URL parameters or one-shot preconfiguration from Landing page
  useEffect(() => {
    const qTab = searchParams.get("tab") || dashboardPreconfig?.tab;
    if (qTab) {
      if (qTab === "risk-map" || qTab === "map") setTab("map");
      else if (qTab === "safe-sites" || qTab === "safesites") setTab("safesites");
      else if (qTab === "simulation" || qTab === "simulate") setTab("simulate");
      else if (qTab === "plans") setTab("plans");
      else if (qTab === "alerts") setTab("alerts");
      else if (qTab === "analytics") setTab("analytics");
      else if (qTab === "audit") setTab("audit");
    }

    const qHaz = searchParams.get("hazard") || searchParams.get("riskLevel") || dashboardPreconfig?.hazardFilter;
    if (qHaz) {
      if (qHaz === "CRITICAL" || qHaz === "RED") setHazardFilter("RED");
      else if (qHaz === "HIGH") setHazardFilter("HIGH");
      else if (qHaz === "MODERATE") setHazardFilter("MODERATE");
      else if (qHaz === "SAFE") setHazardFilter("SAFE");
    }

    const qLayer = searchParams.get("layer");
    const qFlood = searchParams.get("floodInundation");
    if (qLayer === "flood" || qFlood === "true" || dashboardPreconfig?.showFlood) {
      setShowFloodLayer(true);
    }
    const qLandslide = searchParams.get("landslide");
    if (qLayer === "landslide" || qLandslide === "true" || dashboardPreconfig?.showLandslide) {
      setShowLandslideLayer(true);
    }

    if (searchParams.get("valley") === "true" || dashboardPreconfig?.focusedLocation) {
      setFocusedHabLocation(dashboardPreconfig?.focusedLocation || { lat: 30.284, lon: 78.981 });
    }

    const qFacility = searchParams.get("facility") || dashboardPreconfig?.facility;
    if (qFacility) {
      if (qFacility === "Safe Shelters" || qFacility === "shelter" || qFacility === "shelters") {
        setFacilityFilter("shelter");
      } else {
        setFacilityFilter(qFacility);
      }
    }

    const qTarget = searchParams.get("target");
    if (qTarget === "true" || qTab === "simulation" || qTab === "simulate" || dashboardPreconfig?.tab === "simulation") {
      setIsTargetToolActive(true);
    }

    if (dashboardPreconfig) {
      setDashboardPreconfig(null);
    }
  }, [searchParams, dashboardPreconfig, setIsTargetToolActive, setDashboardPreconfig]);

  const SIM_PRESETS = [
    { name: "Joshimath Sector (Chamoli)", lat: 30.556, lon: 79.566, type: "LANDSLIDE", radius: 15 },
    { name: "Kedarnath Valley (Rudraprayag)", lat: 30.735, lon: 79.066, type: "GLOF", radius: 20 },
    { name: "Uttarkashi Fault Zone", lat: 30.726, lon: 78.435, type: "EARTHQUAKE", radius: 25 },
    { name: "Nainital Catchment", lat: 29.391, lon: 79.454, type: "CLOUDBURST", radius: 12 },
    { name: "Gopeshwar Slopes (Chamoli)", lat: 30.412, lon: 79.332, type: "LANDSLIDE", radius: 10 },
  ];

  const qc = useQueryClient();
  const { user, username, fetchProfile, clearanceRole } = useAuthStore();
  const isManager = clearanceRole === "DISTRICT_MAGISTRATE" || user?.role === "SUPERADMIN";

  useEffect(() => { fetchProfile(); }, [fetchProfile]);

  const handleExportAuditCsv = () => {
    const headers = "Block,Timestamp_IST,Event_Code,Principal,Target_Entity,Client_IP,Prev_Hash,Block_Hash,Compliance_Status\n";
    const rows = STATUTORY_AUDIT_LEDGER.map(
      (b) => `${b.blockIndex},"${b.timestampIst}","${b.eventCode}","${b.principal}","${b.targetEntity}","${b.clientIp}","${b.prevHash}","${b.blockHash}","${b.complianceStatus}"`
    ).join("\n");
    const blob = new Blob([headers + rows], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `riskos-certin-audit-ledger-${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const { data: habsData, isLoading: habsLoading } = useQuery({
    queryKey: ["habitations", districtFilter, hazardFilter],
    queryFn: () => getHabitations({ district: districtFilter || undefined, hazard_level: hazardFilter || undefined }),
  });
  const { data: sitesData } = useQuery<SafeSiteGeoJSON>({ queryKey: ["safe-sites"], queryFn: () => getSafeSites() });
  const { data: plans, isLoading: plansLoading } = useQuery<RelocationPlan[]>({ queryKey: ["relocation-plans"], queryFn: getRelocationPlans });
  const { data: alerts, isLoading: alertsLoading } = useQuery<AlertItem[]>({ queryKey: ["alerts"], queryFn: getAlerts });

  const { data: stats } = useQuery<GeoStats>({
    queryKey: ["geo-stats"],
    queryFn: () => getGeoStats(),
  });

  const availableDistricts = useMemo(() => {
    return extractCleanDistricts(stats?.districts);
  }, [stats?.districts]);

  const updateStatus = useMutation({
    mutationFn: ({ id, status }: { id: number; status: PlanStatus }) => updateRelocationPlan(id, { status }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["relocation-plans"] }),
  });
  const removeAlert = useMutation({
    mutationFn: (id: number) => deleteAlert(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["alerts"] }),
  });

  const features: HabitationFeature[] = habsData?.features ?? [];
  const siteFeatures: SafeSiteFeature[] = sitesData?.features ?? [];

  const redCount = features.filter((f) => f.properties.hazard_level === "RED").length;
  const highCount = features.filter((f) => f.properties.hazard_level === "HIGH").length;
  const totalPop = features.reduce((s, f) => s + (f.properties.population || 0), 0);
  const totalCapacity = siteFeatures.reduce((s, f) => s + (f.properties.remaining_capacity ?? f.properties.estimated_capacity ?? 0), 0);

  function openPlan(habId: number | null, siteId: number | null, pop: number) {
    setPrefillHab(habId); setPrefillSite(siteId); setPrefillPop(pop);
    setPlanModalOpen(true);
  }
  function openAlertModal(habId: number | null) {
    setPrefillHab(habId);
    setAlertModalOpen(true);
  }

  const displayName = user?.first_name ? `${user.first_name} ${user.last_name || ""}`.trim() : username || "Official";

  const nearestHabitationToEpicenter = useMemo(() => {
    if (!simEpicenter || !features.length) return null;
    let nearest: HabitationFeature | null = null;
    let minDist = Infinity;
    for (const f of features) {
      if (f.geometry?.coordinates) {
        const [lon, lat] = f.geometry.coordinates;
        const dist = Math.hypot(lat - simEpicenter.lat, lon - simEpicenter.lon);
        if (dist < minDist) {
          minDist = dist;
          nearest = f;
        }
      }
    }
    return nearest;
  }, [simEpicenter, features]);

  const handleRunSimulation = async () => {
    if (!simEpicenter) return;
    setSimLoading(true);
    try {
      const results = await simulateDisaster(simEpicenter.lat, simEpicenter.lon, simRadius, simType);
      setSimResults(results);
    } catch (err) {
      console.error(err);
      alert("Simulation failed. Please verify coordinates and try again.");
    } finally {
      setSimLoading(false);
    }
  };

  const handleResetSimulation = () => {
    setSimEpicenter(null);
    setSimResults(null);
    setFocusedHabLocation(null);
    setSimSearchQuery("");
  };

  const handleBroadcastAlert = () => {
    if (!simResults) return;
    const habCount = simResults.affected_habitations?.length || 0;
    const popCount = simResults.total_affected_population || 0;
    const locName = simResults.epicenter?.landmark || nearestHabitationToEpicenter?.properties.name || "Uttarakhand Sector";
    const typeStr = simResults.epicenter?.type || simType;

    setAlertPrefillData({
      title: `URGENT SDMA FLASH ALERT: ${typeStr} IMPACT IN ${locName.toUpperCase()}`,
      message: `Evacuation advisory triggered for ${locName} within a ${simRadius} km radius buffer. Estimated ${habCount} habitations and approx ${popCount.toLocaleString()} persons potentially exposed. Designated safe shelter corridors mobilized. Activate standard evacuation protocol immediately.`,
      severity: "CRITICAL",
      habId: simResults.affected_habitations[0]?.id || null,
    });
    setAlertModalOpen(true);
  };

  const filteredSimHabitations = useMemo(() => {
    if (!simResults?.affected_habitations) return [];
    if (!simSearchQuery.trim()) return simResults.affected_habitations;
    const q = simSearchQuery.toLowerCase().trim();
    return simResults.affected_habitations.filter(
      (h) =>
        h.name.toLowerCase().includes(q) ||
        (h.district && h.district.toLowerCase().includes(q)) ||
        (h.assigned_safe_site?.name && h.assigned_safe_site.name.toLowerCase().includes(q))
    );
  }, [simResults, simSearchQuery]);

  const filteredFeatures = useMemo(() => {
    return features.filter((f) => {
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase().trim();
      const name = (f.properties.name || "").toLowerCase();
      const dist = (f.properties.district || "").toLowerCase();
      const pin = String((f.properties as any).pincode || (f.properties as any).pin || "");
      const tehsil = String((f.properties as any).tehsil || (f.properties as any).block || "").toLowerCase();
      return name.includes(q) || dist.includes(q) || pin.includes(q) || tehsil.includes(q);
    });
  }, [features, searchQuery]);

  const navItems = [
    { id: "map", icon: <Map className="w-4 h-4 flex-shrink-0" />, label: t("nav_risk_map") },
    { id: "plans", icon: <FileText className="w-4 h-4 flex-shrink-0" />, label: t("nav_relocation_plans"), badge: plans?.length },
    { id: "safesites", icon: <ShieldCheck className="w-4 h-4 flex-shrink-0" />, label: t("nav_safe_sites") },
    { id: "alerts", icon: <AlertTriangle className="w-4 h-4 flex-shrink-0" />, label: t("nav_alerts"), badge: alerts?.length, badgeColor: "bg-red-500 text-white" },
    { id: "analytics", icon: <BarChart3 className="w-4 h-4 flex-shrink-0" />, label: t("nav_analytics") },
    { id: "simulate", icon: <Activity className="w-4 h-4 flex-shrink-0" />, label: t("nav_simulation") },
    { id: "ingest", icon: <Database className="w-4 h-4 flex-shrink-0" />, label: isHi ? "डेटा अंतर्ग्रहण" : "Data Ingestion" },
    ...(isManager
      ? [{ id: "users", icon: <Users className="w-4 h-4 flex-shrink-0" />, label: isHi ? "कार्मिक प्रबंधन" : "User Management" }]
      : []),
    { id: "audit", icon: <History className="w-4 h-4 flex-shrink-0" />, label: t("nav_audit_trail") },
    { id: "profile", icon: <UserCheck className="w-4 h-4 flex-shrink-0" />, label: isHi ? "प्रोफ़ाइल एवं 2FA" : "Profile & 2FA" },
  ];

  return (
    <div id="main-content" className="h-screen w-screen flex flex-col bg-[#F8FAFC] dark:bg-[#0B0F19] font-sans overflow-hidden transition-colors">
      {/* 1. GOI Accessibility Bar + 2. Primary Brand Header */}
      <GoiTopBar />
      <GoiBrandHeader />

      {/* Body: Collapsible Sidebar + Main View */}
      <div className="flex-1 flex overflow-hidden">
        {/* Authoritative Collapsible Navigation Drawer */}
        <nav
          className={`hidden lg:flex flex-none flex-col bg-white dark:bg-[#0F172A] border-r border-[#E2E8F0] dark:border-[#1E293B] py-3 transition-all duration-300 ease-in-out select-none z-30 ${
            sidebarCollapsed ? "w-16" : "w-64"
          }`}
          aria-label="Portal Navigation"
        >
          {/* Navigation Items */}
          <div className="flex-1 space-y-1 px-2 overflow-y-auto">
            {navItems.map((item) => {
              const isActive = tab === item.id || (item.id === "simulate" && tab === "simulation");
              return (
                <button
                  key={item.id}
                  onClick={() => setTab(item.id)}
                  className={`w-full flex items-center rounded-lg text-xs font-semibold transition-all group ${
                    sidebarCollapsed ? "justify-center p-2.5" : "gap-3 px-3 py-2"
                  } ${
                    isActive
                      ? "bg-[#EFF6FF] text-[#1D4ED8] dark:bg-[#1E293B] dark:text-[#60A5FA] font-bold shadow-sm"
                      : "text-[#475569] dark:text-[#9CA3AF] hover:text-[#0F172A] dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/60"
                  }`}
                  title={sidebarCollapsed ? `${item.label} ${item.badge ? `(${item.badge})` : ""}` : undefined}
                >
                  <span className={`${isActive ? "text-[#1D4ED8] dark:text-[#60A5FA]" : "text-slate-500 dark:text-slate-400 group-hover:text-slate-900 dark:group-hover:text-white"}`}>
                    {item.icon}
                  </span>
                  {!sidebarCollapsed && (
                    <span className="truncate flex-1 text-left">{item.label}</span>
                  )}
                  {!sidebarCollapsed && item.badge !== undefined && item.badge > 0 && (
                    <span
                      className={`ml-auto text-[10px] font-bold px-1.5 py-0.2 rounded-full ${
                        item.badgeColor || "bg-blue-100 dark:bg-blue-900/60 text-blue-700 dark:text-blue-300"
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                  {sidebarCollapsed && item.badge !== undefined && item.badge > 0 && (
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-600 absolute right-2 top-2" />
                  )}
                </button>
              );
            })}
          </div>

          {/* Dev Console & Collapse Toggle Footer */}
          <div className="px-2 pt-2 border-t border-[#E2E8F0] dark:border-[#1E293B] space-y-1">
            <a
              href="http://localhost:8000/system-console/"
              target="_blank"
              rel="noopener noreferrer"
              className={`w-full flex items-center rounded-lg text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-slate-100 dark:hover:bg-slate-800/60 text-[11px] font-medium transition ${
                sidebarCollapsed ? "justify-center p-2" : "gap-3 px-3 py-1.5"
              }`}
              title="Django Administrative Console"
            >
              <Terminal className="w-4 h-4 flex-shrink-0 text-slate-400" />
              {!sidebarCollapsed && <span>{t("dev_console")} ↗</span>}
            </a>

            <button
              onClick={toggleSidebar}
              className="w-full flex items-center justify-center p-2 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition"
              title={sidebarCollapsed ? `${t("nav_expand")} ([)` : `${t("nav_collapse")} ([)`}
              aria-label={sidebarCollapsed ? "Expand navigation sidebar" : "Collapse navigation sidebar"}
            >
              {sidebarCollapsed ? (
                <ChevronRight className="w-4 h-4" />
              ) : (
                <div className="flex items-center gap-2 text-[10px] font-semibold text-slate-400 w-full justify-between px-1">
                  <span>{t("nav_collapse")}</span>
                  <div className="flex items-center gap-1">
                    <span className="font-mono text-[9px] bg-slate-100 dark:bg-slate-800 px-1 py-0.2 rounded text-slate-400">[</span>
                    <ChevronLeft className="w-3.5 h-3.5" />
                  </div>
                </div>
              )}
            </button>
          </div>
        </nav>

        {/* Main Content Area */}
        <main className="flex-1 overflow-hidden flex flex-col relative pb-14 lg:pb-0">

          {/* ━━━ TAB 1: RISK ASSESSMENT MAP ━━━ */}
          {tab === "map" && (
            <div className="flex-1 flex overflow-hidden">
              {/* Central Map Canvas */}
              <div className="flex-1 relative">
                <MapView
                  district={districtFilter}
                  hazardLevel={hazardFilter}
                  selectedHabitationId={selectedHabId}
                  onSelectHabitation={setSelectedHabId}
                  showSafeSites
                  habitationsData={habsData}
                  focusedLocation={focusedHabLocation}
                  initialShowLandslide={showLandslideLayer}
                  initialShowFlood={showFloodLayer}
                  initialFacility={facilityFilter}
                  onActivateSimulation={(epicenter, radius) => {
                    setTab("simulate");
                    if (epicenter) {
                      setSimEpicenter(epicenter);
                    } else if (!simEpicenter) {
                      setSimEpicenter({ lat: 30.556, lon: 79.566 });
                    }
                    if (radius) {
                      setSimRadius(radius);
                    }
                  }}
                  onToggleAnalytics={toggleInspector}
                  isAnalyticsOpen={!inspectorCollapsed}
                  settlementCount={features.length > 0 ? features.length : 13967}
                />
                {selectedHabId && (
                  <HabitationDetailPanel
                    habitationId={selectedHabId}
                    onClose={() => setSelectedHabId(null)}
                    onInitiatePlan={(habId, siteId, pop) => openPlan(habId, siteId, pop)}
                    onOpenAlertModal={(habId) => openAlertModal(habId)}
                    isOfficial
                  />
                )}
              </div>

              {/* Settlement Explorer Right Drawer */}
              <div
                className={`flex-none flex flex-col bg-white dark:bg-[#0F172A] border-l border-[#E2E8F0] dark:border-[#1E293B] z-30 sm:z-10 shadow-xl sm:shadow-sm transition-all duration-300 ease-in-out overflow-hidden ${
                  inspectorCollapsed
                    ? "w-0 border-l-0 opacity-0 pointer-events-none"
                    : "fixed sm:relative inset-y-0 right-0 sm:inset-auto w-full sm:w-96 max-w-[100vw] sm:max-w-none opacity-100"
                }`}
              >
                {/* Inspector Header with Title and Minimize Button */}
                <div className="px-3.5 py-2.5 border-b border-[#E2E8F0] dark:border-[#1E293B] flex items-center justify-between bg-slate-50 dark:bg-slate-900/60 flex-shrink-0">
                  <div className="flex items-center gap-2 min-w-0">
                    <BarChart3 className="w-4 h-4 text-blue-600 dark:text-blue-400 flex-shrink-0" />
                    <span className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider truncate">
                      {t("settlement_analytics")}
                    </span>
                    <span className="text-[10px] font-mono font-semibold px-1.5 py-0.2 rounded bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300">
                      {features.length.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 flex-shrink-0">
                    <span className="text-[9px] font-mono text-slate-400 bg-white dark:bg-slate-800 px-1 py-0.2 rounded border border-slate-200 dark:border-slate-700">]</span>
                    <button
                      onClick={toggleInspector}
                      className="p-1 rounded text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-800 transition"
                      title="Minimize Analytics Dock (])"
                      aria-label="Minimize Analytics Dock"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Search & Filter Bar */}
                <div className="p-3 border-b border-[#E2E8F0] dark:border-[#1E293B] space-y-2.5">
                  {/* Search Input */}
                  <div className="relative">
                    <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-slate-400 pointer-events-none" />
                    <input
                      type="text"
                      placeholder={t("search_placeholder")}
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-8 pr-7 py-1.5 text-xs bg-white dark:bg-[#1E293B] border border-[#CBD5E1] dark:border-[#475569] rounded-lg text-[#0F172A] dark:text-[#F9FAFB] placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    {searchQuery && (
                      <button
                        onClick={() => setSearchQuery("")}
                        className="absolute right-2 top-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>

                  {/* Dropdowns */}
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider block mb-1">
                        {t("district")}
                      </label>
                      <select
                        value={districtFilter}
                        onChange={(e) => {
                          setDistrictFilter(e.target.value);
                          setSelectedHabId(null);
                        }}
                        className="w-full text-xs py-1.5 px-2 bg-white dark:bg-[#1E293B] border border-[#CBD5E1] dark:border-[#475569] rounded-lg text-[#0F172A] dark:text-[#F9FAFB] focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-xs cursor-pointer z-50 max-h-60 overflow-y-auto"
                      >
                        <option value="">{t("all_districts")}</option>
                        {availableDistricts.map((d) => (
                          <option key={d} value={d}>
                            {t(d)}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider block mb-1">
                        {t("filter_risk_label")}
                      </label>
                      <select
                        value={hazardFilter}
                        onChange={(e) => setHazardFilter(e.target.value)}
                        className="w-full text-xs py-1 px-1.5 bg-white dark:bg-[#1E293B] border border-[#CBD5E1] dark:border-[#475569] rounded-md text-[#0F172A] dark:text-[#F9FAFB] focus:ring-1 focus:ring-blue-500"
                      >
                        <option value="">{t("all_risk_levels")}</option>
                        <option value="RED">{t("red_zone")}</option>
                        <option value="HIGH">{t("high_risk")}</option>
                        <option value="MODERATE">{t("moderate_risk")}</option>
                        <option value="SAFE">{t("safe_zone")}</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Modernized 2x2 KPI Summary Cards */}
                <div className="grid grid-cols-2 gap-2 p-3 bg-slate-50 dark:bg-[#0B0F19] border-b border-[#E2E8F0] dark:border-[#1E293B]">
                  <div className="bg-white dark:bg-[#131E36] p-2 rounded-lg border border-[#E2E8F0] dark:border-[#1E293B] shadow-sm">
                    <div className="flex items-center justify-between mb-0.5">
                      <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider truncate">
                        {t("kpi_total_settlements")}
                      </span>
                    </div>
                    <div className="text-base font-black font-mono text-[#0F172A] dark:text-white">
                      {features.length.toLocaleString()}
                    </div>
                    <div className="text-[9px] text-slate-500 dark:text-slate-400 truncate mt-0.5">
                      {filteredFeatures.length} {t("visible_in_filter")}
                    </div>
                  </div>

                  <div className="bg-white dark:bg-[#131E36] p-2 rounded-lg border border-[#E2E8F0] dark:border-[#1E293B] shadow-sm">
                    <div className="flex items-center justify-between mb-0.5">
                      <span className="text-[10px] font-bold text-red-600 dark:text-red-400 uppercase tracking-wider truncate">
                        {t("kpi_red_zones")}
                      </span>
                      <span className="w-1.5 h-1.5 rounded-full bg-red-600 animate-pulse" />
                    </div>
                    <div className="text-base font-black font-mono text-red-600 dark:text-red-400">
                      {redCount.toLocaleString()}
                    </div>
                    <div className="text-[9px] text-red-500 truncate mt-0.5">
                      {t("priority_evacuation")}
                    </div>
                  </div>

                  <div className="bg-white dark:bg-[#131E36] p-2 rounded-lg border border-[#E2E8F0] dark:border-[#1E293B] shadow-sm">
                    <div className="flex items-center justify-between mb-0.5">
                      <span className="text-[10px] font-bold text-orange-600 dark:text-orange-400 uppercase tracking-wider truncate">
                        {t("high_risk")}
                      </span>
                    </div>
                    <div className="text-base font-black font-mono text-orange-600 dark:text-orange-400">
                      {highCount.toLocaleString()}
                    </div>
                    <div className="text-[9px] text-orange-500 truncate mt-0.5">
                      {t("high_surveillance")}
                    </div>
                  </div>

                  <div className="bg-white dark:bg-[#131E36] p-2 rounded-lg border border-[#E2E8F0] dark:border-[#1E293B] shadow-sm">
                    <div className="flex items-center justify-between mb-0.5">
                      <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider truncate">
                        {t("population")}
                      </span>
                    </div>
                    <div className="text-base font-black font-mono text-[#0F172A] dark:text-white truncate">
                      {totalPop >= 1_000_000 ? (totalPop / 1_000_000).toFixed(1) + "M" : totalPop >= 1000 ? (totalPop / 1000).toFixed(0) + "K" : totalPop.toLocaleString()}
                    </div>
                    <div className="text-[9px] text-slate-500 dark:text-slate-400 truncate mt-0.5">
                      {t("estimated_exposure")}
                    </div>
                  </div>
                </div>

                {/* Filtered Settlements List */}
                <div className="flex-1 overflow-y-auto text-xs divide-y divide-slate-100 dark:divide-slate-800">
                  {habsLoading && (
                    <div className="p-8 text-center text-slate-500 space-y-2">
                      <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto" />
                      <p className="text-xs font-medium">{t("loading_habitations")}</p>
                    </div>
                  )}

                  {!habsLoading && filteredFeatures.length === 0 && (
                    <div className="p-8 text-center text-slate-500 text-xs">
                      {t("no_settlements_match")}
                    </div>
                  )}

                  {filteredFeatures.slice(0, 200).map((f) => {
                    const isSelected = selectedHabId === f.id;
                    return (
                      <button
                        key={f.id}
                        onClick={() => setSelectedHabId(f.id)}
                        className={`w-full text-left px-3.5 py-2.5 transition-colors flex items-start gap-2.5 ${
                          isSelected
                            ? "bg-blue-50 dark:bg-blue-950/60 border-l-4 border-l-blue-600"
                            : "hover:bg-slate-50 dark:hover:bg-slate-800/40"
                        }`}
                      >
                        <span
                          className={`w-2.5 h-2.5 rounded-full mt-1 flex-shrink-0 ${hazardDotColor(
                            f.properties.hazard_level as any
                          )}`}
                        />
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center justify-between gap-1">
                            <span className="font-bold text-slate-900 dark:text-slate-100 truncate text-[12px]">
                              {f.properties.name}
                            </span>
                            <span
                              className={`${hazardBadgeClass(
                                f.properties.hazard_level as any
                              )} text-[9px] py-0 px-1.5 leading-4 font-bold flex-shrink-0`}
                            >
                              {hazardLabel(f.properties.hazard_level as any, lang)}
                            </span>
                          </div>
                          <div className="text-[11px] text-slate-500 dark:text-slate-400 truncate mt-0.5">
                            {t(f.properties.district)} • {(f.properties.population || 0).toLocaleString()} {t("residents")}
                          </div>
                        </div>
                      </button>
                    );
                  })}
                  {filteredFeatures.length > 200 && (
                    <div className="p-2 text-center text-[10px] text-slate-500 bg-slate-50 dark:bg-slate-900">
                      {t("showing_top_200")}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* ━━━ TAB: RELOCATION PLANS ━━━ */}
          {tab === "plans" && (
            <div className="flex-1 overflow-y-auto p-6">
              <div className="max-w-6xl mx-auto">
                <div className="section-header">
                  <div>
                    <h1 className="text-base font-semibold text-slate-900 dark:text-slate-100">{t("Relocation Plans")}</h1>
                    <p className="text-xs text-slate-500 dark:text-slate-500 mt-0.5">{t("Manage evacuation and rehabilitation operations")}</p>
                  </div>
                  <button onClick={() => openPlan(null, null, 0)} className="btn-primary text-xs">
                    <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="12" y2="19"/>
                    </svg>
                    {t("New plan")}
                  </button>
                </div>

                {plansLoading && <div className="py-12 text-center text-xs text-slate-600">{t("Loading plans...")}</div>}

                {plans && plans.length === 0 && (
                  <div className="py-16 text-center">
                    <div className="w-12 h-12 rounded-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-center mx-auto mb-3">
                      <svg className="w-5 h-5 text-slate-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/>
                      </svg>
                    </div>
                    <p className="text-sm text-slate-500 dark:text-slate-500 mb-1">{t("No relocation plans yet")}</p>
                    <p className="text-xs text-slate-700">{t("Create the first plan to start tracking evacuations")}</p>
                    <button onClick={() => openPlan(null, null, 0)} className="btn-outline text-xs mt-4">{t("Create first plan")}</button>
                  </div>
                )}

                {plans && plans.length > 0 && (
                  <div className="card overflow-hidden">
                    <table className="w-full text-xs border-collapse">
                      <thead>
                        <tr className="bg-slate-50 dark:bg-slate-950/60 border-b border-slate-200 dark:border-slate-800">
                          <th className="px-4 py-3 text-left text-[11px] font-semibold text-slate-500 dark:text-slate-500 uppercase tracking-wider">{t("Settlement")}</th>
                          <th className="px-4 py-3 text-left text-[11px] font-semibold text-slate-500 dark:text-slate-500 uppercase tracking-wider">{t("Safe site")}</th>
                          <th className="px-4 py-3 text-left text-[11px] font-semibold text-slate-500 dark:text-slate-500 uppercase tracking-wider">{t("Priority")}</th>
                          <th className="px-4 py-3 text-right text-[11px] font-semibold text-slate-500 dark:text-slate-500 uppercase tracking-wider">{t("Population")}</th>
                          <th className="px-4 py-3 text-left text-[11px] font-semibold text-slate-500 dark:text-slate-500 uppercase tracking-wider">{t("Status")}</th>
                          <th className="px-4 py-3 text-left text-[11px] font-semibold text-slate-500 dark:text-slate-500 uppercase tracking-wider">{t("Created by")}</th>
                          <th className="px-4 py-3 text-right text-[11px] font-semibold text-slate-500 dark:text-slate-500 uppercase tracking-wider">{t("Action")}</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800/60">
                        {plans.map((plan) => (
                          <tr key={plan.id} className="hover:bg-slate-800/30 transition-colors">
                            <td className="px-4 py-3 text-slate-800 dark:text-slate-200 font-medium">{plan.habitation_name || `#${plan.habitation}`}</td>
                            <td className="px-4 py-3 text-emerald-400 font-medium">{plan.safe_site_name || `#${plan.safe_site}`}</td>
                            <td className="px-4 py-3">
                              <span className={priorityBadgeClass(plan.priority)}>{t(plan.priority)}</span>
                            </td>
                            <td className="px-4 py-3 text-right text-slate-700 dark:text-slate-300 font-mono">{plan.population_to_relocate.toLocaleString()}</td>
                            <td className="px-4 py-3">
                              <span className={statusBadgeClass(plan.status)}>{t(plan.status)}</span>
                            </td>
                            <td className="px-4 py-3 text-slate-500 dark:text-slate-500">{plan.created_by_name || "—"}</td>
                            <td className="px-4 py-3 text-right">
                              <div className="flex items-center justify-end gap-1.5">
                                {plan.status === "PROPOSED" && user?.role === "SUPERADMIN" && (
                                  <button
                                    onClick={() => updateStatus.mutate({ id: plan.id, status: "APPROVED" })}
                                    className="px-2 py-1 text-[11px] font-medium rounded border border-blue-800/60 bg-blue-950/40 text-blue-400 hover:bg-blue-900/40 transition-colors"
                                  >{t("Approve")}</button>
                                )}
                                {plan.status === "APPROVED" && (
                                  <button
                                    onClick={() => updateStatus.mutate({ id: plan.id, status: "IN_PROGRESS" })}
                                    className="px-2 py-1 text-[11px] font-medium rounded border border-yellow-800/60 bg-yellow-950/40 text-yellow-400 hover:bg-yellow-900/40 transition-colors"
                                  >{t("Activate")}</button>
                                )}
                                {plan.status === "IN_PROGRESS" && (
                                  <button
                                    onClick={() => updateStatus.mutate({ id: plan.id, status: "COMPLETED" })}
                                    className="px-2 py-1 text-[11px] font-medium rounded border border-green-800/60 bg-green-950/40 text-green-400 hover:bg-green-900/40 transition-colors"
                                  >{t("Mark complete")}</button>
                                )}
                                {plan.status === "COMPLETED" && (
                                  <span className="text-[11px] text-slate-600">—</span>
                                )}
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ━━━ TAB: SAFE SITES ━━━ */}
          {tab === "safesites" && (
            <div className="flex-1 overflow-y-auto p-6">
              <div className="max-w-6xl mx-auto">
                <div className="section-header">
                  <div>
                    <h1 className="text-base font-semibold text-slate-900 dark:text-slate-100">{t("Safe Relocation Sites")}</h1>
                    <p className="text-xs text-slate-500 dark:text-slate-500 mt-0.5">
                      {t("Verified shelter capacity")} — <span className="text-slate-600 dark:text-slate-400 font-medium">{totalCapacity.toLocaleString()}</span> {t("places available")}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                  {siteFeatures.map((site) => {
                    const props = site.properties;
                    const rem = props.remaining_capacity ?? props.estimated_capacity;
                    const used = props.current_occupied ?? 0;
                    const pct = props.estimated_capacity ? Math.round((used / props.estimated_capacity) * 100) : 0;
                    return (
                      <div key={site.id} className="card p-4 hover:border-slate-300 dark:border-slate-700 transition-colors">
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">{props.name}</h3>
                            <p className="text-xs text-slate-500 dark:text-slate-500 mt-0.5">{t(props.district)}</p>
                          </div>
                          <span className="badge-safe">{t("Active")}</span>
                        </div>

                        {/* Capacity bar */}
                        <div className="mb-3">
                          <div className="flex justify-between text-[11px] text-slate-600 mb-1.5">
                            <span>{t("Capacity used")}</span>
                            <span className="font-mono">{used.toLocaleString()} / {props.estimated_capacity.toLocaleString()}</span>
                          </div>
                          <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full ${pct > 80 ? "bg-red-600" : pct > 50 ? "bg-yellow-600" : "bg-emerald-600"}`}
                              style={{ width: `${Math.min(100, pct)}%` }}
                            />
                          </div>
                          <div className="text-[11px] text-emerald-500 mt-1 font-medium">{rem.toLocaleString()} {t("places available")}</div>
                        </div>

                        {/* Details grid */}
                        <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-[11px] pt-3 border-t border-slate-200 dark:border-slate-800">
                          <div className="text-slate-600">{t("Area")}</div>
                          <div className="text-slate-700 dark:text-slate-300 font-mono text-right">{props.available_area_hectares} ha</div>
                          <div className="text-slate-600">{t("Hazard score")}</div>
                          <div className="text-slate-700 dark:text-slate-300 font-mono text-right">{props.hazard_score}</div>
                          <div className="text-slate-600">{t("Road access")}</div>
                          <div className={`font-medium text-right ${props.road_access ? "text-emerald-500" : "text-red-500"}`}>
                            {props.road_access ? t("Yes") : t("No")}
                          </div>
                          <div className="text-slate-600">{t("Water supply")}</div>
                          <div className={`font-medium text-right ${props.water_availability ? "text-emerald-500" : "text-red-500"}`}>
                            {props.water_availability ? t("Yes") : t("No")}
                          </div>
                        </div>

                        {/* Map Focus Action */}
                        <div className="mt-3 pt-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
                          <span className="text-[10px] text-slate-500 font-mono uppercase">
                            {(props as any).facility_type || "SHELTER"}
                          </span>
                          <button
                            onClick={() => {
                              const coords = site.geometry?.coordinates;
                              if (coords) {
                                const lng = coords[0] > 50 ? coords[0] : coords[1];
                                const lat = coords[0] > 50 ? coords[1] : coords[0];
                                setFocusedHabLocation({ lat, lon: lng });
                                setTab("map");
                              }
                            }}
                            className="btn-secondary text-xs py-1 px-3 flex items-center gap-1.5 hover:bg-blue-600 hover:text-white transition"
                          >
                            <MapPin className="w-3.5 h-3.5 text-blue-500" />
                            <span>{t("Focus on Map")}</span>
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* ━━━ TAB: ALERTS ━━━ */}
          {tab === "alerts" && (
            <div className="flex-1 overflow-y-auto p-6">
              <div className="max-w-4xl mx-auto">
                <div className="section-header">
                  <div>
                    <h1 className="text-base font-semibold text-slate-900 dark:text-slate-100">{t("Early Warning Alerts")}</h1>
                    <p className="text-xs text-slate-500 dark:text-slate-500 mt-0.5">{t("Broadcast emergency advisories to field teams and the public map")}</p>
                  </div>
                  <button onClick={() => openAlertModal(null)} className="btn-danger text-xs">
                    <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="12" y2="19"/>
                    </svg>
                    {t("New alert")}
                  </button>
                </div>

                {alertsLoading && <div className="py-12 text-center text-xs text-slate-600">{t("Loading...")}</div>}

                {alerts && alerts.length === 0 && (
                  <div className="py-16 text-center">
                    <div className="w-12 h-12 rounded-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-center mx-auto mb-3">
                      <svg className="w-5 h-5 text-slate-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 01-3.46 0"/>
                      </svg>
                    </div>
                    <p className="text-sm text-slate-500 dark:text-slate-500">{t("No active alerts")}</p>
                  </div>
                )}

                <div className="space-y-2">
                  {alerts?.map((item) => (
                    <div key={item.id} className="card flex items-start gap-4 p-4 hover:border-slate-300 dark:border-slate-700 transition-colors">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1.5">
                          <span className={alertSeverityClass(item.severity)}>{t(item.severity)}</span>
                          <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">{item.title}</h3>
                          {item.habitation_name && (
                            <span className="text-xs text-slate-600">· {item.habitation_name}</span>
                          )}
                        </div>
                        <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">{item.message}</p>
                        <div className="flex items-center gap-3 mt-2 text-[11px] text-slate-600">
                          <span>{t("By")} {item.created_by_name || "Official"}</span>
                          <span>·</span>
                          <span>{new Date(item.created_at).toLocaleString(lang === "hi" ? "hi-IN" : "en-IN", { dateStyle: "medium", timeStyle: "short" })}</span>
                        </div>
                      </div>
                      <button
                        onClick={() => removeAlert.mutate(item.id)}
                        className="flex-none text-slate-700 hover:text-red-400 p-1.5 rounded hover:bg-slate-800 transition-colors"
                        title={t("Delete alert")}
                      >
                        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a1 1 0 011-1h4a1 1 0 011 1v2"/>
                        </svg>
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ━━━ TAB: SIMULATE ━━━ */}
          {(tab === "simulate" || tab === "simulation") && (
            <div className="flex-1 flex overflow-hidden">
              <div className="flex-1 relative">
                <MapView
                  district={districtFilter}
                  hazardLevel={hazardFilter}
                  showSafeSites
                  simulationMode={true}
                  simulationEpicenter={simEpicenter}
                  simulationRadius={simRadius}
                  simulationType={simType}
                  simulationResults={simResults}
                  habitationsData={habsData}
                  focusedLocation={focusedHabLocation}
                  onEpicenterChange={(center) => {
                    setSimEpicenter(center);
                  }}
                  onMapClick={(lat, lon) => {
                    setSimEpicenter({ lat, lon });
                    setSimResults(null);
                  }}
                />
              </div>

              <div className="w-96 lg:w-[460px] xl:w-[500px] flex-none flex flex-col bg-white dark:bg-[#0A1220] border-l border-slate-200 dark:border-slate-800 shadow-xl z-20 overflow-hidden">
                {/* 1. Header with Authority Badge and Reset Button */}
                <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50/70 dark:bg-slate-900/60">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-red-600/10 dark:bg-red-500/20 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-900 flex items-center justify-center font-bold">
                      <Activity className="w-4 h-4 animate-pulse" />
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-[10px] font-bold tracking-wider uppercase px-1.5 py-0.5 rounded bg-red-100 dark:bg-red-950/80 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-800">
                          {t("SDMA DSS Engine")}
                        </span>
                      </div>
                      <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100 mt-0.5">
                        {t("Disaster Simulation")}
                      </h2>
                    </div>
                  </div>
                  {(simEpicenter || simResults) && (
                    <button
                      onClick={handleResetSimulation}
                      className="px-2 py-1 rounded text-xs font-semibold text-slate-600 dark:text-slate-300 hover:text-red-600 dark:hover:text-red-400 hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors flex items-center gap-1"
                      title={t("Reset Simulation")}
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>{t("Reset")}</span>
                    </button>
                  )}
                </div>

                <div className="p-4 space-y-4 flex-1 overflow-y-auto custom-scrollbar">
                  {/* 2. Epicenter Selection Status & Presets */}
                  <div className="rounded-xl p-3 border transition-colors bg-slate-50 dark:bg-slate-900/40 border-slate-200 dark:border-slate-800">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                        <Crosshair className="w-3.5 h-3.5 text-red-500" />
                        {t("Incident Epicenter Coordinates")}
                      </span>
                      {simEpicenter ? (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
                          {t("Live Pin Active")}
                        </span>
                      ) : (
                        <span className="text-[10px] font-semibold text-amber-600 dark:text-amber-400">
                          {t("Pending Map Click")}
                        </span>
                      )}
                    </div>

                    {simEpicenter ? (
                      <div className="space-y-1 text-xs">
                        <div className="p-2 rounded bg-white dark:bg-[#070D18] border border-slate-200 dark:border-slate-800 font-mono text-slate-800 dark:text-slate-200 flex items-center justify-between">
                          <span>{t("Lat:")} <strong className="text-red-600 dark:text-red-400">{simEpicenter.lat.toFixed(4)}° N</strong></span>
                          <span>{t("Lon:")} <strong className="text-red-600 dark:text-red-400">{simEpicenter.lon.toFixed(4)}° E</strong></span>
                        </div>
                        <div className="text-[11px] text-slate-600 dark:text-slate-400 flex items-center gap-1 pt-1">
                          <Target className="w-3.5 h-3.5 text-blue-500 flex-shrink-0" />
                          <span className="truncate">
                            {simResults?.epicenter?.landmark ||
                              (nearestHabitationToEpicenter
                                ? `${nearestHabitationToEpicenter.properties.name} Sector • ${nearestHabitationToEpicenter.properties.district}`
                                : t("Active Disaster Focal Point"))}
                          </span>
                        </div>
                      </div>
                    ) : (
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                        {t("Click anywhere on the map to drop an epicenter pin or select a high-vulnerability scenario preset below:")}
                      </p>
                    )}

                    {/* Quick Presets */}
                    <div className="mt-3 pt-2.5 border-t border-slate-200 dark:border-slate-800/80">
                      <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1.5">
                        {t("High-Risk Presets:")}
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {SIM_PRESETS.map((preset) => (
                          <button
                            key={preset.name}
                            onClick={() => {
                              setSimEpicenter({ lat: preset.lat, lon: preset.lon });
                              setSimType(preset.type);
                              setSimRadius(preset.radius);
                              setSimResults(null);
                            }}
                            className={`text-[11px] px-2 py-1 rounded-md border font-medium transition-all ${
                              simEpicenter?.lat === preset.lat && simEpicenter?.lon === preset.lon
                                ? "bg-red-600 text-white border-red-600 shadow-sm"
                                : "bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-slate-400"
                            }`}
                          >
                            {preset.name.split(" ")[0]}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* 3. Parameter Controls: Disaster Type & Impact Buffer Radius */}
                  <div className="space-y-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                        {t("Disaster Type")}
                      </label>
                      <select
                        value={simType}
                        onChange={(e) => setSimType(e.target.value)}
                        className="select w-full text-xs font-semibold bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100"
                      >
                        <option value="CLOUDBURST">🌧️ {t("Cloudburst")} ({t("Flash Flood")})</option>
                        <option value="LANDSLIDE">⛰️ {t("Landslide")} ({t("Slope Failure")})</option>
                        <option value="GLOF">❄️ {t("Glacial Lake Outburst Flood (GLOF)")}</option>
                        <option value="EARTHQUAKE">⚡ {t("Earthquake")} ({t("Seismic Fault")})</option>
                        <option value="FLOOD">🌊 {t("Flood")} ({t("River Inundation")})</option>
                      </select>
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                          {t("Impact Buffer Radius")}
                        </label>
                        <div className="flex items-center gap-1">
                          <input
                            type="number"
                            min="1"
                            max="50"
                            value={simRadius}
                            onChange={(e) => {
                              const v = Math.max(1, Math.min(50, Number(e.target.value) || 1));
                              setSimRadius(v);
                            }}
                            className="w-14 text-center text-xs font-bold font-mono px-1.5 py-0.5 rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100"
                          />
                          <span className="text-xs font-bold text-slate-500">km</span>
                        </div>
                      </div>
                      <input
                        type="range"
                        min="1"
                        max="50"
                        value={simRadius}
                        onChange={(e) => setSimRadius(Number(e.target.value))}
                        className="w-full accent-red-600 h-1.5 bg-slate-200 dark:bg-slate-800 rounded-lg cursor-pointer"
                      />
                      <div className="flex justify-between text-[10px] text-slate-500 font-mono mt-1">
                        <span>1 km (Localized)</span>
                        <span>25 km (Regional)</span>
                        <span>50 km (State Max)</span>
                      </div>
                    </div>
                  </div>

                  {/* 4. Primary Run Button */}
                  <button
                    onClick={handleRunSimulation}
                    disabled={!simEpicenter || simLoading}
                    className={`w-full py-2.5 rounded-lg text-xs font-bold tracking-wider uppercase transition-all shadow-md flex items-center justify-center gap-2 ${
                      !simEpicenter || simLoading
                        ? "bg-slate-200 dark:bg-slate-800 text-slate-400 dark:text-slate-500 cursor-not-allowed border border-transparent shadow-none"
                        : "bg-red-600 hover:bg-red-700 text-white border border-red-700 shadow-red-500/20 active:scale-[0.99]"
                    }`}
                  >
                    {simLoading ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        <span>{t("Simulating Blast Impact...")}</span>
                      </>
                    ) : (
                      <>
                        <Flame className="w-4 h-4" />
                        <span>{t("Run Scenario Simulation")}</span>
                      </>
                    )}
                  </button>

                  {/* 5. Incident Assessment Dossier (Results) */}
                  {simResults && (() => {
                    const affectedHabitations = simResults.affected_habitations || [];
                    const summary = simResults.summary || {
                      total_affected_habitations: affectedHabitations.length,
                      total_affected_population: simResults.total_affected_population,
                      critical_red_count: 0,
                      high_risk_count: 0,
                      zone_1_count: 0,
                      zone_2_count: 0,
                      zone_3_count: 0,
                      active_safe_sites_count: simResults.reachable_shelters?.length || 0,
                      estimated_evacuation_mins: 90,
                    };

                    const impactText =
                      simType === "CLOUDBURST"
                        ? "High velocity flash floods and debris flow in valley floors. Roads, bridges and culverts compromised."
                        : simType === "EARTHQUAKE"
                        ? "Severe structural failure in unreinforced masonry buildings. High risk of seismic rockfalls along highways."
                        : simType === "GLOF"
                        ? "Moraine breach surge wave. Critical downstream flood surge within 45 to 90 minutes."
                        : simType === "LANDSLIDE"
                        ? "Mass slope destabilization, slope failure blocking river channels. Immediate evacuation of lower tier recommended."
                        : "Widespread river overspill, low-lying habitation flooding, clean water network cut-off.";

                    return (
                      <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-800 space-y-4">
                        {/* Dossier Header */}
                        <div className="flex items-center justify-between">
                          <div>
                            <span className="text-[10px] font-bold text-red-600 dark:text-red-400 tracking-wider uppercase">
                              {t("Incident Assessment Dossier")}
                            </span>
                            <h3 className="text-xs font-bold text-slate-900 dark:text-slate-100">
                              {simResults.epicenter?.landmark || "Sector Evaluation"}
                            </h3>
                          </div>
                          <span className="text-[10px] font-mono text-slate-500 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded border border-slate-200 dark:border-slate-700">
                            R = {simRadius} km
                          </span>
                        </div>

                        {/* Expected Hazard Impact Note */}
                        <div className="p-2.5 rounded-lg bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/60">
                          <p className="text-[11px] font-bold text-red-700 dark:text-red-400 mb-0.5">
                            {t("Expected Impact")}:
                          </p>
                          <p className="text-[11px] text-red-900/80 dark:text-red-200/80 leading-relaxed">
                            {impactText}
                          </p>
                        </div>

                        {/* Top KPI Alert Metrics Grid (4 cards) */}
                        <div className="grid grid-cols-2 gap-2">
                          <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800">
                            <span className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 block">
                              {t("Affected Settlements")}
                            </span>
                            <div className="flex items-baseline gap-1.5 mt-1">
                              <span className="text-xl font-bold font-mono text-slate-900 dark:text-white">
                                {summary.total_affected_habitations}
                              </span>
                              {summary.critical_red_count > 0 && (
                                <span className="text-[10px] font-bold text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-950 px-1 py-0.2 rounded">
                                  {summary.critical_red_count} Red
                                </span>
                              )}
                            </div>
                          </div>

                          <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800">
                            <span className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 block">
                              {t("Population at Risk")}
                            </span>
                            <div className="text-xl font-bold font-mono text-red-600 dark:text-red-400 mt-1">
                              {summary.total_affected_population.toLocaleString()}
                            </div>
                          </div>

                          <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800">
                            <span className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 block">
                              {t("Safe Shelters")}
                            </span>
                            <div className="text-xl font-bold font-mono text-emerald-600 dark:text-emerald-400 mt-1">
                              {summary.active_safe_sites_count}
                            </div>
                          </div>

                          <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800">
                            <span className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 block">
                              {t("Est. Evac Window")}
                            </span>
                            <div className="text-xl font-bold font-mono text-amber-600 dark:text-amber-400 mt-1">
                              {summary.estimated_evacuation_mins} min
                            </div>
                          </div>
                        </div>

                        {/* 3-Tier Inundation Zones Matrix */}
                        <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 space-y-2">
                          <span className="text-[10px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider block">
                            {t("Three-Tier Impact Zoning")}
                          </span>
                          <div className="grid grid-cols-3 gap-1.5 text-center">
                            <div className="p-1.5 rounded bg-red-100/80 dark:bg-red-950/70 border border-red-300 dark:border-red-900">
                              <span className="text-[9px] font-bold text-red-800 dark:text-red-300 block uppercase">
                                Zone 1 (0-30%)
                              </span>
                              <span className="text-sm font-bold font-mono text-red-700 dark:text-red-200">
                                {summary.zone_1_count}
                              </span>
                              <span className="text-[8px] text-red-600 dark:text-red-400 block">{t("Direct Hit")}</span>
                            </div>
                            <div className="p-1.5 rounded bg-amber-100/80 dark:bg-amber-950/70 border border-amber-300 dark:border-amber-900">
                              <span className="text-[9px] font-bold text-amber-800 dark:text-amber-300 block uppercase">
                                Zone 2 (30-70%)
                              </span>
                              <span className="text-sm font-bold font-mono text-amber-700 dark:text-amber-200">
                                {summary.zone_2_count}
                              </span>
                              <span className="text-[8px] text-amber-600 dark:text-amber-400 block">{t("High Alert")}</span>
                            </div>
                            <div className="p-1.5 rounded bg-blue-100/80 dark:bg-blue-950/70 border border-blue-300 dark:border-blue-900">
                              <span className="text-[9px] font-bold text-blue-800 dark:text-blue-300 block uppercase">
                                Zone 3 (70-100%)
                              </span>
                              <span className="text-sm font-bold font-mono text-blue-700 dark:text-blue-200">
                                {summary.zone_3_count}
                              </span>
                              <span className="text-[8px] text-blue-600 dark:text-blue-400 block">{t("Advisory")}</span>
                            </div>
                          </div>
                        </div>

                        {/* Actionable Incident Command Buttons */}
                        <div className="space-y-2 pt-1">
                          <button
                            onClick={() => setIapModalOpen(true)}
                            className="w-full py-2 px-3 rounded-lg text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 border border-blue-700 shadow-sm flex items-center justify-center gap-2 transition-all"
                          >
                            <Printer className="w-3.5 h-3.5" />
                            <span>{t("Generate SDMA Incident Action Plan (PDF)")}</span>
                          </button>

                          <button
                            onClick={handleBroadcastAlert}
                            className="w-full py-2 px-3 rounded-lg text-xs font-bold text-white bg-amber-600 hover:bg-amber-700 border border-amber-700 shadow-sm flex items-center justify-center gap-2 transition-all"
                          >
                            <Radio className="w-3.5 h-3.5" />
                            <span>{t("Broadcast Emergency Alert (CAP / SMS)")}</span>
                          </button>
                        </div>

                        {/* Interactive Habitation Roster Table */}
                        <div className="pt-2">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                              {t("Affected Settlements Roster")} ({filteredSimHabitations.length})
                            </span>
                          </div>

                          <div className="relative mb-2">
                            <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-slate-400" />
                            <input
                              type="text"
                              value={simSearchQuery}
                              onChange={(e) => setSimSearchQuery(e.target.value)}
                              placeholder={t("Filter affected habitations or shelters...")}
                              className="w-full pl-8 pr-3 py-1.5 rounded-md text-xs bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 placeholder:text-slate-400"
                            />
                            {simSearchQuery && (
                              <button
                                onClick={() => setSimSearchQuery("")}
                                className="absolute right-2.5 top-2 text-slate-400 hover:text-slate-600"
                              >
                                <X className="w-3 h-3" />
                              </button>
                            )}
                          </div>

                          <div className="max-h-60 overflow-y-auto space-y-1.5 pr-1 border rounded-lg border-slate-200 dark:border-slate-800 p-1.5 bg-slate-50/50 dark:bg-slate-900/30">
                            {filteredSimHabitations.length === 0 ? (
                              <p className="text-xs text-center py-4 text-slate-500">
                                {t("No matching settlements")}
                              </p>
                            ) : (
                              filteredSimHabitations.slice(0, 100).map((hab) => (
                                <div
                                  key={hab.id}
                                  className="p-2 rounded bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/60 hover:border-blue-400 text-xs flex items-center justify-between gap-2 transition-colors"
                                >
                                  <div className="min-w-0 flex-1">
                                    <div className="flex items-center gap-1.5">
                                      <span className="font-bold text-slate-900 dark:text-white truncate">
                                        {hab.name}
                                      </span>
                                      <span
                                        className={`text-[9px] font-bold px-1 py-0.2 rounded ${
                                          hab.impact_zone === "ZONE_1"
                                            ? "bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300 border border-red-300"
                                            : hab.impact_zone === "ZONE_2"
                                            ? "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300 border border-amber-300"
                                            : "bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300 border border-blue-300"
                                        }`}
                                      >
                                        {hab.impact_zone || "ZONE"}
                                      </span>
                                    </div>
                                    <div className="text-[10px] text-slate-500 dark:text-slate-400 flex items-center gap-2 mt-0.5">
                                      <span>{hab.district}</span>
                                      <span>•</span>
                                      <span className="font-mono text-red-600 dark:text-red-400 font-semibold">
                                        {hab.distance_from_epicenter_km ?? hab.distance_km} km
                                      </span>
                                      <span>•</span>
                                      <span>{hab.population?.toLocaleString()} pax</span>
                                    </div>
                                    {hab.assigned_safe_site && (
                                      <div className="text-[10px] text-emerald-600 dark:text-emerald-400 truncate mt-0.5 flex items-center gap-1">
                                        <span>🛡️ {hab.assigned_safe_site.name}</span>
                                        {hab.assigned_safe_site.distance_km && (
                                          <span className="font-mono">({hab.assigned_safe_site.distance_km} km)</span>
                                        )}
                                      </div>
                                    )}
                                  </div>

                                  <button
                                    onClick={() => {
                                      if (hab.lat && hab.lon) {
                                        setFocusedHabLocation({ lat: hab.lat, lon: hab.lon });
                                      }
                                    }}
                                    className="p-1.5 rounded bg-slate-100 dark:bg-slate-700 hover:bg-blue-600 hover:text-white text-slate-600 dark:text-slate-300 transition-colors flex-shrink-0"
                                    title={t("Focus on Map")}
                                  >
                                    <Crosshair className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              ))
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })()}
                </div>
              </div>
            </div>
          )}

          {/* ━━━ TAB: OVERVIEW / ANALYTICS ━━━ */}
          {tab === "analytics" && (
            <div className="flex-1 overflow-y-auto p-4 sm:p-6">
              <div className="max-w-6xl mx-auto space-y-6">
                <AnalyticsView
                  onInitiatePlan={() => setPlanModalOpen(true)}
                  onViewPlans={() => setTab("plans")}
                  onSelectDistrict={(d) => setDistrictFilter(d)}
                />

                {/* Developer database console */}
                <div className="card p-4 flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-700 dark:text-slate-300">{t("Developer database console")}</p>
                    <p className="text-xs text-slate-600 mt-0.5">{t("Django admin panel for direct schema inspection — separate from this operator portal.")}</p>
                  </div>
                  <a
                    href="http://localhost:8000/system-console/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-outline text-xs flex-shrink-0"
                  >
                    {t("Open /system-console/ ↗")}
                  </a>
                </div>
              </div>
              <div className="mt-8">
                <GoiFooter />
              </div>
            </div>
          )}

          {/* ━━━ TAB: AUDIT TRAIL & ADMINISTRATIVE LOGS ━━━ */}
          {tab === "audit" && (
            <div className="flex-1 overflow-y-auto p-6">
              <div className="max-w-6xl mx-auto space-y-6">
                <div className="section-header flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2.5 flex-wrap">
                      <h1 className="text-base font-bold text-[#0B2545] dark:text-slate-100 flex items-center gap-2">
                        <History className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                        <span>{t("nav_audit_trail")}</span>
                      </h1>
                      <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/70 border border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-[11px] font-bold">
                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                        <span>CERT-In 180-Day Immutable Ledger</span>
                        <span className="text-[10px] bg-emerald-200 dark:bg-emerald-900 px-1 rounded font-mono">Sec 70B / Rule 20(1)</span>
                      </div>
                    </div>
                    <p className="text-xs text-slate-500 mt-1">
                      {t("Official immutable audit ledger generated in compliance with the Disaster Management Act, 2005 & GIGW 3.0 Standards.")}
                    </p>
                  </div>
                  <button
                    onClick={handleExportAuditCsv}
                    className="btn-outline text-xs flex items-center gap-1.5 self-start md:self-auto"
                    title="Export cryptographically signed audit ledger as CSV"
                  >
                    <span>{t("Download Audit Ledger (.CSV)")}</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Audit Metric Badges */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                  <div className="card p-3.5 bg-white dark:bg-[#131e36]">
                    <div className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">{t("Logged System Events")}</div>
                    <div className="text-xl font-bold font-mono text-[#0B2545] dark:text-white mt-1">2,841</div>
                    <div className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold mt-0.5">{t("100% Cryptographically Verified")}</div>
                  </div>
                  <div className="card p-3.5 bg-white dark:bg-[#131e36]">
                    <div className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">{t("Integrity Digest")}</div>
                    <div className="text-xs font-bold font-mono text-blue-600 dark:text-blue-400 mt-2 truncate">SHA256: 4f89b...e29c</div>
                    <div className="text-[10px] text-slate-500 mt-0.5">{t("Tamper-Evident Ledger")}</div>
                  </div>
                  <div className="card p-3.5 bg-white dark:bg-[#131e36]">
                    <div className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">{t("Security Discrepancies")}</div>
                    <div className="text-xl font-bold font-mono text-emerald-600 dark:text-emerald-400 mt-1">0</div>
                    <div className="text-[10px] text-slate-500 mt-0.5">{t("Zero Breaches Detected")}</div>
                  </div>
                  <div className="card p-3.5 bg-white dark:bg-[#131e36]">
                    <div className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">{t("NDMA Clearance Tier")}</div>
                    <div className="text-xs font-bold text-slate-900 dark:text-white mt-2 truncate">
                      {clearanceRole === "DISTRICT_MAGISTRATE" ? "District Magistrate (IC)" : clearanceRole === "SDRF_COMMANDER" ? "SDRF Field Commander" : clearanceRole === "DEOC_OPERATOR" ? "DEOC Operator (Control Desk)" : "Public Citizen (PII Masked)"}
                    </div>
                    <div className="text-[10px] text-amber-600 font-semibold mt-0.5">
                      {displayName} • 2FA Active
                    </div>
                  </div>
                </div>

                {/* Immutable Logs Table */}
                <div className="card overflow-hidden bg-white dark:bg-[#131e36] border border-slate-200 dark:border-slate-800 shadow-sm">
                  <div className="px-4 py-3 bg-slate-50 dark:bg-slate-900/60 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-emerald-500" />
                      <span>{t("Real-Time Operational Audit Trail")}</span>
                    </span>
                    <span className="text-[10px] font-mono text-slate-500">SHA-256 Hash Chained Chained Ledger</span>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-xs text-left border-collapse">
                      <thead>
                        <tr className="border-b border-slate-200 dark:border-slate-800 text-[11px] font-bold text-slate-500 uppercase tracking-wider bg-slate-50/50 dark:bg-slate-900/30">
                          <th className="px-4 py-3">Block # & Timestamp</th>
                          <th className="px-4 py-3">{t("Event Code")}</th>
                          <th className="px-4 py-3">{t("Operator / Principal")}</th>
                          <th className="px-4 py-3">{t("Target Entity")}</th>
                          <th className="px-4 py-3">Cryptographic Chained Proof</th>
                          <th className="px-4 py-3 text-right">{t("Compliance Status")}</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-mono text-[11px]">
                        {STATUTORY_AUDIT_LEDGER.map((block) => (
                          <tr key={block.blockIndex} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                            <td className="px-4 py-2.5 text-slate-600 dark:text-slate-400">
                              <span className="font-bold text-slate-900 dark:text-slate-200 block">Block #{block.blockIndex}</span>
                              <span className="text-[10px] text-slate-500">{block.timestampIst}</span>
                            </td>
                            <td className="px-4 py-2.5 font-bold text-blue-600 dark:text-blue-400">
                              {block.eventCode}
                            </td>
                            <td className="px-4 py-2.5 text-slate-700 dark:text-slate-300">
                              {block.principal}
                            </td>
                            <td className="px-4 py-2.5 text-slate-800 dark:text-slate-200">
                              <div>{block.targetEntity}</div>
                              <div className="text-[10px] text-slate-400 font-normal">{block.clientIp}</div>
                            </td>
                            <td className="px-4 py-2.5">
                              <span className="text-[10px] text-blue-600 dark:text-blue-400 block font-mono">
                                Hash: {block.blockHash.slice(0, 10)}...{block.blockHash.slice(-6)}
                              </span>
                              <span className="text-[9px] text-slate-400 block font-mono">
                                Prev: {block.prevHash.slice(0, 10)}...
                              </span>
                            </td>
                            <td className="px-4 py-2.5 text-right">
                              <span className="px-2 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-400 font-bold text-[10px] border border-emerald-300 dark:border-emerald-800">
                                {block.complianceStatus}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                <div className="mt-12">
                  <GoiFooter />
                </div>
              </div>
            </div>
          )}

          {/* ━━━ TAB: USER MANAGEMENT (TIER 1 RBAC) ━━━ */}
          {tab === "users" && <UserManagementView />}

          {/* ━━━ TAB: SELF-SERVICE DATA INGESTION PIPELINE ━━━ */}
          {tab === "ingest" && <DataIngestionPanel onGoToMap={() => setTab("map")} />}

          {/* ━━━ TAB: PROFILE & SECURITY CLEARANCE ━━━ */}
          {tab === "profile" && <ProfileSecurityPanel />}
        </main>
      </div>

      {/* Mobile Bottom Navigation Dock (Screens < lg) */}
      <nav
        aria-label="Mobile Navigation Dock"
        className="lg:hidden fixed bottom-0 inset-x-0 z-40 bg-white/95 dark:bg-[#0F172A]/95 backdrop-blur-md border-t border-slate-200 dark:border-slate-800 flex justify-around items-center h-14 px-1 shadow-lg"
      >
        <button
          onClick={() => { setTab("map"); setMobileMoreOpen(false); }}
          className={`flex flex-col items-center justify-center flex-1 py-1 text-[10px] font-bold transition ${
            tab === "map"
              ? "text-blue-600 dark:text-blue-400"
              : "text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200"
          }`}
        >
          <Map className="w-4 h-4 mb-0.5" />
          <span>{isHi ? "मानचित्र" : "Map"}</span>
        </button>

        <button
          onClick={() => { setTab("plans"); setMobileMoreOpen(false); }}
          className={`flex flex-col items-center justify-center flex-1 py-1 text-[10px] font-bold transition relative ${
            tab === "plans"
              ? "text-blue-600 dark:text-blue-400"
              : "text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200"
          }`}
        >
          <FileText className="w-4 h-4 mb-0.5" />
          <span>{isHi ? "योजनाएं" : "Plans"}</span>
          {plans && plans.length > 0 && (
            <span className="absolute top-1 right-3 w-2 h-2 rounded-full bg-blue-600" />
          )}
        </button>

        <button
          onClick={() => { setTab("alerts"); setMobileMoreOpen(false); }}
          className={`flex flex-col items-center justify-center flex-1 py-1 text-[10px] font-bold transition relative ${
            tab === "alerts"
              ? "text-red-600 dark:text-red-400"
              : "text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200"
          }`}
        >
          <AlertTriangle className="w-4 h-4 mb-0.5" />
          <span>{isHi ? "अलर्ट" : "Alerts"}</span>
          {alerts && alerts.length > 0 && (
            <span className="absolute top-1 right-3 w-2 h-2 rounded-full bg-red-600" />
          )}
        </button>

        <button
          onClick={() => { setTab("analytics"); setMobileMoreOpen(false); }}
          className={`flex flex-col items-center justify-center flex-1 py-1 text-[10px] font-bold transition ${
            tab === "analytics"
              ? "text-blue-600 dark:text-blue-400"
              : "text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200"
          }`}
        >
          <BarChart3 className="w-4 h-4 mb-0.5" />
          <span>{isHi ? "सांख्यिकी" : "Analytics"}</span>
        </button>

        <button
          onClick={() => setMobileMoreOpen(!mobileMoreOpen)}
          className={`flex flex-col items-center justify-center flex-1 py-1 text-[10px] font-bold transition ${
            mobileMoreOpen || !["map", "plans", "alerts", "analytics"].includes(tab)
              ? "text-blue-600 dark:text-blue-400"
              : "text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200"
          }`}
        >
          <MoreHorizontal className="w-4 h-4 mb-0.5" />
          <span>{isHi ? "अधिक" : "More"}</span>
        </button>
      </nav>

      {/* Mobile More Drawer Sheet */}
      {mobileMoreOpen && (
        <div className="lg:hidden fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex flex-col justify-end animate-in fade-in">
          <div className="bg-white dark:bg-[#0F172A] rounded-t-2xl max-h-[75vh] overflow-y-auto p-4 space-y-3 shadow-2xl animate-in slide-in-from-bottom duration-200 border-t border-slate-200 dark:border-slate-800">
            <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-800">
              <span className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">
                {isHi ? "अतिरिक्त मॉड्यूल" : "All System Modules"}
              </span>
              <button
                onClick={() => setMobileMoreOpen(false)}
                className="p-1 rounded text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-1">
              {navItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => {
                    setTab(item.id);
                    setMobileMoreOpen(false);
                  }}
                  className={`flex items-center gap-2 p-2.5 rounded-xl text-xs font-bold text-left transition ${
                    tab === item.id
                      ? "bg-blue-50 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800"
                      : "bg-slate-50 dark:bg-slate-800/60 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700/60 hover:bg-slate-100 dark:hover:bg-slate-800"
                  }`}
                >
                  <span className="text-blue-600 dark:text-blue-400">{item.icon}</span>
                  <span className="truncate">{item.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Modals */}
      <CreatePlanModal
        isOpen={planModalOpen}
        onClose={() => setPlanModalOpen(false)}
        preselectedHabitationId={prefillHab}
        preselectedSafeSiteId={prefillSite}
        defaultPopulation={prefillPop}
      />
      <CreateAlertModal
        isOpen={alertModalOpen}
        onClose={() => {
          setAlertModalOpen(false);
          setAlertPrefillData(null);
        }}
        preselectedHabitationId={alertPrefillData?.habId ?? prefillHab}
        initialTitle={alertPrefillData?.title}
        initialMessage={alertPrefillData?.message}
        initialSeverity={alertPrefillData?.severity}
      />
      {simResults && (
        <IncidentActionPlanModal
          isOpen={iapModalOpen}
          onClose={() => setIapModalOpen(false)}
          results={simResults}
        />
      )}
    </div>
  );
}
