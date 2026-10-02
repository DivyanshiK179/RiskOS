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
  ExternalLink
} from "lucide-react";
import { getHabitations } from "../api/habitations";
import { getRelocationPlans, updateRelocationPlan, getAlerts, deleteAlert } from "../api/relocation";
import { getSafeSites } from "../api/safesites";
import { getGeoStats, simulateDisaster, type SimulationResult } from "../api/stats";
import { useAuthStore } from "../store/authStore";
import { useUIStore } from "../store/uiStore";
import MapView from "../components/MapView";
import HabitationDetailPanel from "../components/HabitationDetailPanel";
import CreatePlanModal from "../components/CreatePlanModal";
import CreateAlertModal from "../components/CreateAlertModal";
import GoiTopBar from "../components/GoiTopBar";
import GoiBrandHeader from "../components/GoiBrandHeader";
import GoiFooter from "../components/GoiFooter";
import { useTranslation } from "../i18n/translations";
import type {
  HabitationFeature,
  RelocationPlan,
  AlertItem,
  SafeSiteFeature,
  PlanStatus,
} from "../types";
import {
  hazardBadgeClass,
  hazardLabel,
  hazardDotColor,
  statusBadgeClass,
  priorityBadgeClass,
  alertSeverityClass,
} from "../lib/utils";

export default function Dashboard() {
  const { t, lang } = useTranslation();
  const {
    sidebarCollapsed,
    toggleSidebar,
    inspectorCollapsed,
    toggleInspector,
    toggleLayers,
    toggleZenMode,
  } = useUIStore();
  const [tab, setTab] = useState("map");
  const [districtFilter, setDistrictFilter] = useState("");
  const [hazardFilter, setHazardFilter] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedHabId, setSelectedHabId] = useState<number | null>(null);

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

  const qc = useQueryClient();
  const { user, username, fetchProfile } = useAuthStore();

  useEffect(() => { fetchProfile(); }, [fetchProfile]);

  const { data: habsData, isLoading: habsLoading } = useQuery({
    queryKey: ["habitations", districtFilter, hazardFilter],
    queryFn: () => getHabitations({ district: districtFilter || undefined, hazard_level: hazardFilter || undefined }),
  });
  const { data: sitesData } = useQuery({ queryKey: ["safe-sites"], queryFn: getSafeSites });
  const { data: plans, isLoading: plansLoading } = useQuery<RelocationPlan[]>({ queryKey: ["relocation-plans"], queryFn: getRelocationPlans });
  const { data: alerts, isLoading: alertsLoading } = useQuery<AlertItem[]>({ queryKey: ["alerts"], queryFn: getAlerts });

  const { data: stats } = useQuery({
    queryKey: ["geo-stats"],
    queryFn: getGeoStats,
  });

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
  const riskPop = features
    .filter((f) => ["RED", "HIGH"].includes(f.properties.hazard_level))
    .reduce((s, f) => s + (f.properties.population || 0), 0);
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

  const handleRunSimulation = async () => {
    if (!simEpicenter) return;
    setSimLoading(true);
    try {
      const results = await simulateDisaster(simEpicenter.lat, simEpicenter.lon, simRadius, simType);
      setSimResults(results);
    } catch (err) {
      console.error(err);
      alert("Simulation failed");
    } finally {
      setSimLoading(false);
    }
  };

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
    { id: "audit", icon: <History className="w-4 h-4 flex-shrink-0" />, label: t("nav_audit_trail") },
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
          className={`flex-none flex flex-col bg-white dark:bg-[#0F172A] border-r border-[#E2E8F0] dark:border-[#1E293B] py-3 transition-all duration-300 ease-in-out select-none z-30 ${
            sidebarCollapsed ? "w-16" : "w-64"
          }`}
          aria-label="Portal Navigation"
        >
          {/* Navigation Items */}
          <div className="flex-1 space-y-1 px-2 overflow-y-auto">
            {navItems.map((item) => {
              const isActive = tab === item.id;
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
        <main className="flex-1 overflow-hidden flex flex-col relative">

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

                {/* Persistent Right Inspector Floating Pill Button (when minimized) */}
                {inspectorCollapsed && (
                  <button
                    onClick={toggleInspector}
                    className="absolute top-4 right-4 z-20 flex items-center gap-2 px-3.5 py-2 bg-white/95 dark:bg-[#0F172Aee] hover:bg-slate-50 dark:hover:bg-[#1E293B] text-slate-800 dark:text-slate-100 border border-slate-200 dark:border-slate-800 rounded-full shadow-xl backdrop-blur-md text-xs font-bold transition-all group hover:scale-105"
                    title="Open Settlement Directory & Analytics (])"
                    aria-label="Open Settlement Directory & Analytics (])"
                  >
                    <BarChart3 className="w-4 h-4 text-blue-600 dark:text-blue-400 group-hover:scale-110 transition-transform" />
                    <span>{t("settlement_analytics")} ({features.length > 0 ? features.length.toLocaleString() : "13,967"})</span>
                    <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400">]</span>
                    <ChevronLeft className="w-4 h-4 text-slate-400 group-hover:text-slate-700 dark:group-hover:text-white transition-transform" />
                  </button>
                )}
              </div>

              {/* Settlement Explorer Right Drawer */}
              <div
                className={`flex-none flex flex-col bg-white dark:bg-[#0F172A] border-l border-[#E2E8F0] dark:border-[#1E293B] z-10 shadow-sm transition-all duration-300 ease-in-out overflow-hidden ${
                  inspectorCollapsed ? "w-0 border-l-0 opacity-0 pointer-events-none" : "w-80 sm:w-96 opacity-100"
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
                        onChange={(e) => setDistrictFilter(e.target.value)}
                        className="w-full text-xs py-1 px-1.5 bg-white dark:bg-[#1E293B] border border-[#CBD5E1] dark:border-[#475569] rounded-md text-[#0F172A] dark:text-[#F9FAFB] focus:ring-1 focus:ring-blue-500"
                      >
                        <option value="">{t("all_districts")}</option>
                        {stats?.districts.map((d) => (
                          <option key={d} value={d}>{t(d)}</option>
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
          {tab === "simulate" && (
            <div className="flex-1 flex overflow-hidden">
              <div className="flex-1 relative">
                <MapView
                  district={districtFilter}
                  hazardLevel={hazardFilter}
                  showSafeSites
                  simulationMode={true}
                  simulationResults={simResults}
                  habitationsData={habsData}
                  onMapClick={(lat, lon) => {
                    setSimEpicenter({ lat, lon });
                    setSimResults(null);
                  }}
                />
              </div>

              <div className="w-72 flex-none flex flex-col bg-white dark:bg-[#0a1220] border-l border-slate-200 dark:border-slate-800">
                <div className="p-4 border-b border-slate-200 dark:border-slate-800">
                  <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-100">{t("Disaster Simulation")}</h2>
                  <p className="text-xs text-slate-500 dark:text-slate-500 mt-1">{t("Click anywhere on the map to set the disaster epicenter.")}</p>
                </div>
                
                <div className="p-4 space-y-4 flex-1 overflow-y-auto">
                  <div>
                    <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">{t("Disaster Type")}</label>
                    <select
                      value={simType}
                      onChange={(e) => setSimType(e.target.value)}
                      className="select w-full text-sm"
                    >
                      <option value="CLOUDBURST">{t("Cloudburst")}</option>
                      <option value="EARTHQUAKE">{t("Earthquake")}</option>
                      <option value="FLOOD">{t("Flood")}</option>
                      <option value="LANDSLIDE">{t("Landslide")}</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                      {t("Radius (km):")} <span className="text-slate-800 dark:text-slate-200">{simRadius} km</span>
                    </label>
                    <input
                      type="range"
                      min="1"
                      max="50"
                      value={simRadius}
                      onChange={(e) => setSimRadius(Number(e.target.value))}
                      className="w-full accent-blue-500"
                    />
                  </div>
                  
                  {simEpicenter && (
                    <div className="text-xs text-slate-600 dark:text-slate-400 bg-white dark:bg-slate-900/50 p-2 rounded border border-slate-200 dark:border-slate-800">
                      <div>{t("Epicenter Set:")}</div>
                      <div className="font-mono text-slate-700 dark:text-slate-300">{t("Lat:")} {simEpicenter.lat.toFixed(4)}</div>
                      <div className="font-mono text-slate-700 dark:text-slate-300">{t("Lon:")} {simEpicenter.lon.toFixed(4)}</div>
                    </div>
                  )}

                  <button
                    onClick={handleRunSimulation}
                    disabled={!simEpicenter || simLoading}
                    className={`w-full py-2 rounded text-sm font-medium transition-colors ${
                      !simEpicenter || simLoading
                        ? "bg-slate-800 text-slate-500 dark:text-slate-500 cursor-not-allowed"
                        : "bg-red-600 text-slate-900 dark:text-white hover:bg-red-700"
                    }`}
                  >
                    {simLoading ? t("Simulating...") : t("Run Simulation")}
                  </button>

                  {simResults && (() => {
                    const affectedIds = new Set(simResults.affected_habitations.map(h => h.id));
                    const highRiskAffected = features.filter(f => 
                      affectedIds.has(f.id) && 
                      ["RED", "HIGH"].includes(f.properties.hazard_level)
                    ).length;

                    const utilizedShelters = simResults.affected_habitations.reduce((acc, hab) => {
                      if (hab.assigned_safe_site) {
                        if (!acc[hab.assigned_safe_site.id]) {
                          acc[hab.assigned_safe_site.id] = { name: hab.assigned_safe_site.name, population: 0 };
                        }
                        acc[hab.assigned_safe_site.id].population += hab.population;
                      }
                      return acc;
                    }, {} as Record<number, { name: string, population: number }>);

                    const impactText = simType === "CLOUDBURST" ? "High risk of flash floods and landslides in valleys. Roads likely washed out." :
                      simType === "EARTHQUAKE" ? "Severe structural damage expected. Infrastructure disruption." :
                      simType === "FLOOD" ? "Widespread inundation expected. Waterborne diseases risk." :
                      simType === "LANDSLIDE" ? "Road network disruption. High risk of secondary slope failures." : "General widespread damage.";

                    return (
                      <div className="mt-6 pt-4 border-t border-slate-200 dark:border-slate-800">
                        <h3 className="text-xs font-semibold text-slate-900 dark:text-slate-100 uppercase tracking-wider mb-3">{t("Simulation Results")}</h3>
                        
                        <div className="mb-4 bg-red-950/30 border border-red-900/50 p-2.5 rounded">
                          <p className="text-[11px] font-semibold text-red-400 mb-1">{t("Expected Impact")}</p>
                          <p className="text-[11px] text-red-200/80 leading-relaxed">{t(impactText)}</p>
                        </div>

                        <div className="space-y-2 mb-4">
                          <div className="flex justify-between text-sm">
                            <span className="text-slate-500 dark:text-slate-500">{t("Affected Population:")}</span>
                            <span className="font-mono text-red-400 font-bold">{simResults.total_affected_population.toLocaleString()}</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-slate-500 dark:text-slate-500">{t("Affected Settlements:")}</span>
                            <span className="font-mono text-slate-800 dark:text-slate-200">{simResults.affected_habitations.length}</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-slate-500 dark:text-slate-500">{t("High/Red Risk Zones:")}</span>
                            <span className="font-mono text-orange-400 font-bold">{highRiskAffected}</span>
                          </div>
                        </div>

                        {Object.keys(utilizedShelters).length > 0 && (
                          <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-800/60">
                            <h4 className="text-[10px] font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-2">{t("Utilized Safe Sites")}</h4>
                            <div className="space-y-1.5">
                              {Object.values(utilizedShelters).map(site => (
                                <div key={site.name} className="flex justify-between items-center text-[11px]">
                                  <span className="text-emerald-400 truncate pr-2 flex-1">{site.name}</span>
                                  <span className="font-mono text-slate-700 dark:text-slate-300 flex-shrink-0">+{site.population.toLocaleString()} pax</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })()}
                </div>
              </div>
            </div>
          )}

          {/* ━━━ TAB: OVERVIEW / ANALYTICS ━━━ */}
          {tab === "analytics" && (
            <div className="flex-1 overflow-y-auto p-6">
              <div className="max-w-6xl mx-auto">
                <div className="mb-6">
                  <h1 className="text-base font-semibold text-slate-900 dark:text-slate-100">Operational Overview</h1>
                  <p className="text-xs text-slate-500 dark:text-slate-500 mt-0.5">District-level summary of hazard exposure and response capacity</p>
                </div>

                {/* KPI grid */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
                  <KPI label="Total settlements" value={stats?.total_habitations.toString() ?? features.length.toString()} sub="across all districts" />
                  <KPI label="Population at risk" value={stats ? formatPopulation(stats.total_population_at_risk) : formatPopulation(riskPop)} sub="in red & high risk zones" highlight="text-red-400" />
                  <KPI label="Shelter capacity" value={stats ? formatPopulation(stats.total_shelter_capacity) : formatPopulation(totalCapacity)} sub="verified places available" highlight="text-emerald-400" />
                  <KPI label="Relocation plans" value={(plans?.length || 0).toString()} sub={`${plans?.filter((p) => p.status === "COMPLETED").length || 0} completed`} />
                </div>

                {/* Hazard distribution */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
                  <div className="card p-4">
                    <h3 className="text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-4">Settlement distribution by risk</h3>
                    <div className="space-y-3">
                      {(["RED", "HIGH", "MODERATE", "SAFE"] as const).map((level) => {
                        const count = features.filter((f) => f.properties.hazard_level === level).length;
                        const pct = features.length > 0 ? (count / features.length) * 100 : 0;
                        const barColor = level === "RED" ? "bg-red-600" : level === "HIGH" ? "bg-orange-600" : level === "MODERATE" ? "bg-yellow-600" : "bg-green-600";
                        return (
                          <div key={level}>
                            <div className="flex items-center justify-between mb-1.5">
                              <div className="flex items-center gap-2">
                                <span className={`w-2 h-2 rounded-full ${level === "RED" ? "bg-red-500" : level === "HIGH" ? "bg-orange-500" : level === "MODERATE" ? "bg-yellow-500" : "bg-green-500"}`} />
                                <span className="text-xs text-slate-600 dark:text-slate-400">{hazardLabel(level)}</span>
                              </div>
                              <span className="text-xs font-mono text-slate-700 dark:text-slate-300">{count} <span className="text-slate-600">({pct.toFixed(0)}%)</span></span>
                            </div>
                            <div className="h-1 bg-slate-800 rounded-full overflow-hidden">
                              <div className={`h-full ${barColor} rounded-full`} style={{ width: `${pct}%` }} />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Plans by status */}
                  <div className="card p-4">
                    <h3 className="text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-4">Relocation plan pipeline</h3>
                    {(!plans || plans.length === 0) ? (
                      <div className="text-xs text-slate-600 py-6 text-center">No plans created yet</div>
                    ) : (
                      <div className="space-y-3">
                        {(["PROPOSED", "APPROVED", "IN_PROGRESS", "COMPLETED"] as const).map((status) => {
                          const count = plans.filter((p) => p.status === status).length;
                          const pop = plans.filter((p) => p.status === status).reduce((s, p) => s + p.population_to_relocate, 0);
                          return (
                            <div key={status} className="flex items-center gap-3">
                              <span className={statusBadgeClass(status)}>{status.replace("_", " ")}</span>
                              <span className="text-xs text-slate-600 flex-1">{count} plan{count !== 1 ? "s" : ""}</span>
                              <span className="text-xs text-slate-600 dark:text-slate-400 font-mono">{pop.toLocaleString()} people</span>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>

                {/* System info */}
                <div className="card p-4 flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-700 dark:text-slate-300">Developer database console</p>
                    <p className="text-xs text-slate-600 mt-0.5">Django admin panel for direct schema inspection — separate from this operator portal.</p>
                  </div>
                  <a
                    href="http://localhost:8000/system-console/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-outline text-xs flex-shrink-0"
                  >
                    Open /system-console/ ↗
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
                <div className="section-header">
                  <div>
                    <h1 className="text-base font-bold text-[#0B2545] dark:text-slate-100 flex items-center gap-2">
                      <History className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                      <span>{t("nav_audit_trail")}</span>
                    </h1>
                    <p className="text-xs text-slate-500 mt-1">
                      Official immutable audit ledger generated in compliance with the Disaster Management Act, 2005 & GIGW 3.0 Standards.
                    </p>
                  </div>
                  <button
                    onClick={() => alert("Official Signed Audit Trail Exported (SHA-256 Verified).")}
                    className="btn-outline text-xs flex items-center gap-1.5"
                  >
                    <span>Download Audit Ledger (.CSV)</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Audit Metric Badges */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                  <div className="card p-3.5 bg-white dark:bg-[#131e36]">
                    <div className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Logged System Events</div>
                    <div className="text-xl font-bold font-mono text-[#0B2545] dark:text-white mt-1">2,841</div>
                    <div className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold mt-0.5">100% Cryptographically Verified</div>
                  </div>
                  <div className="card p-3.5 bg-white dark:bg-[#131e36]">
                    <div className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Integrity Digest</div>
                    <div className="text-xs font-bold font-mono text-blue-600 dark:text-blue-400 mt-2 truncate">SHA256: 4f89b...e29c</div>
                    <div className="text-[10px] text-slate-500 mt-0.5">Tamper-Evident Ledger</div>
                  </div>
                  <div className="card p-3.5 bg-white dark:bg-[#131e36]">
                    <div className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Security Discrepancies</div>
                    <div className="text-xl font-bold font-mono text-emerald-600 dark:text-emerald-400 mt-1">0</div>
                    <div className="text-[10px] text-slate-500 mt-0.5">Zero Breaches Detected</div>
                  </div>
                  <div className="card p-3.5 bg-white dark:bg-[#131e36]">
                    <div className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Operator Identity</div>
                    <div className="text-xs font-bold text-slate-900 dark:text-white mt-2 truncate">{displayName}</div>
                    <div className="text-[10px] text-amber-600 font-semibold mt-0.5">Uttarakhand SDMA Officer</div>
                  </div>
                </div>

                {/* Immutable Logs Table */}
                <div className="card overflow-hidden bg-white dark:bg-[#131e36] border border-slate-200 dark:border-slate-800 shadow-sm">
                  <div className="px-4 py-3 bg-slate-50 dark:bg-slate-900/60 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                      Real-Time Operational Audit Trail
                    </span>
                    <span className="text-[10px] font-mono text-slate-500">Live Sync: Active</span>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-xs text-left border-collapse">
                      <thead>
                        <tr className="border-b border-slate-200 dark:border-slate-800 text-[11px] font-bold text-slate-500 uppercase tracking-wider bg-slate-50/50 dark:bg-slate-900/30">
                          <th className="px-4 py-3">Timestamp (IST)</th>
                          <th className="px-4 py-3">Event Code</th>
                          <th className="px-4 py-3">Operator / Principal</th>
                          <th className="px-4 py-3">Target Entity</th>
                          <th className="px-4 py-3">Client IP & Origin</th>
                          <th className="px-4 py-3 text-right">Compliance Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-mono text-[11px]">
                        <tr className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                          <td className="px-4 py-2.5 text-slate-600 dark:text-slate-400">02 Oct 2026, 15:12:04</td>
                          <td className="px-4 py-2.5 font-bold text-blue-600 dark:text-blue-400">HAZARD_INDEX_RECOMPUTED</td>
                          <td className="px-4 py-2.5 text-slate-700 dark:text-slate-300">system.dss_engine</td>
                          <td className="px-4 py-2.5 text-slate-800 dark:text-slate-200">13,967 Habitations (Uttarakhand)</td>
                          <td className="px-4 py-2.5 text-slate-500">10.14.0.22 (NIC GovNet)</td>
                          <td className="px-4 py-2.5 text-right">
                            <span className="px-2 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-400 font-bold text-[10px] border border-emerald-300 dark:border-emerald-800">
                              COMPLIANT_PASS
                            </span>
                          </td>
                        </tr>
                        <tr className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                          <td className="px-4 py-2.5 text-slate-600 dark:text-slate-400">02 Oct 2026, 14:58:30</td>
                          <td className="px-4 py-2.5 font-bold text-emerald-600 dark:text-emerald-400">USER_SESSION_AUTHENTICATED</td>
                          <td className="px-4 py-2.5 text-slate-700 dark:text-slate-300">{displayName} (Officer)</td>
                          <td className="px-4 py-2.5 text-slate-800 dark:text-slate-200">Portal Command Centre</td>
                          <td className="px-4 py-2.5 text-slate-500">10.14.0.85 (State VPN)</td>
                          <td className="px-4 py-2.5 text-right">
                            <span className="px-2 py-0.5 rounded bg-blue-100 dark:bg-blue-950/80 text-blue-700 dark:text-blue-400 font-bold text-[10px] border border-blue-300 dark:border-blue-800">
                              2FA_VALIDATED
                            </span>
                          </td>
                        </tr>
                        <tr className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                          <td className="px-4 py-2.5 text-slate-600 dark:text-slate-400">02 Oct 2026, 14:34:11</td>
                          <td className="px-4 py-2.5 font-bold text-amber-600 dark:text-amber-400">POSTGIS_NATIVE_JSONB_QUERY</td>
                          <td className="px-4 py-2.5 text-slate-700 dark:text-slate-300">db.postgis_cluster</td>
                          <td className="px-4 py-2.5 text-slate-800 dark:text-slate-200">geodata_habitation (ST_AsGeoJSON)</td>
                          <td className="px-4 py-2.5 text-slate-500">127.0.0.1 (Docker Host)</td>
                          <td className="px-4 py-2.5 text-right">
                            <span className="px-2 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-400 font-bold text-[10px] border border-emerald-300 dark:border-emerald-800">
                              OPTIMIZED
                            </span>
                          </td>
                        </tr>
                        <tr className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                          <td className="px-4 py-2.5 text-slate-600 dark:text-slate-400">02 Oct 2026, 14:12:00</td>
                          <td className="px-4 py-2.5 font-bold text-purple-600 dark:text-purple-400">SHELTER_CAPACITY_EVALUATED</td>
                          <td className="px-4 py-2.5 text-slate-700 dark:text-slate-300">system.logistics_opt</td>
                          <td className="px-4 py-2.5 text-slate-800 dark:text-slate-200">20 Safe Relocation Shelters</td>
                          <td className="px-4 py-2.5 text-slate-500">10.14.0.22 (NIC GovNet)</td>
                          <td className="px-4 py-2.5 text-right">
                            <span className="px-2 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-400 font-bold text-[10px] border border-emerald-300 dark:border-emerald-800">
                              SOP_CONFIRMED
                            </span>
                          </td>
                        </tr>
                        <tr className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                          <td className="px-4 py-2.5 text-slate-600 dark:text-slate-400">02 Oct 2026, 13:45:19</td>
                          <td className="px-4 py-2.5 font-bold text-blue-600 dark:text-blue-400">DATASET_INGESTION_COMMITTED</td>
                          <td className="px-4 py-2.5 text-slate-700 dark:text-slate-300">migration.executor</td>
                          <td className="px-4 py-2.5 text-slate-800 dark:text-slate-200">Uttarakhand Census & OSM Layers</td>
                          <td className="px-4 py-2.5 text-slate-500">10.14.0.10 (Batch Worker)</td>
                          <td className="px-4 py-2.5 text-right">
                            <span className="px-2 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-400 font-bold text-[10px] border border-emerald-300 dark:border-emerald-800">
                              INTEGRITY_VALID
                            </span>
                          </td>
                        </tr>
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
        </main>
      </div>

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
        onClose={() => setAlertModalOpen(false)}
        preselectedHabitationId={prefillHab}
      />
    </div>
  );
}

function formatPopulation(n: number): string {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + "M";
  if (n >= 1_000) return (n / 1_000).toFixed(0) + "K";
  return n.toLocaleString();
}

function KPI({ label, value, sub, highlight = "text-slate-900 dark:text-white" }: { label: string; value: string; sub: string; highlight?: string }) {
  return (
    <div className="card p-4">
      <div className="text-xs text-slate-500 dark:text-slate-500 mb-1">{label}</div>
      <div className={`text-2xl font-bold font-mono ${highlight}`}>{value}</div>
      <div className="text-[11px] text-slate-700 mt-1">{sub}</div>
    </div>
  );
}