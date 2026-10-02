import { useState, useMemo, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Search, X, ChevronRight, ChevronLeft, BarChart3 } from "lucide-react";
import { getHabitations } from "../api/habitations";
import { getAlerts } from "../api/relocation";
import { getGeoStats } from "../api/stats";
import MapView from "../components/MapView";
import HabitationDetailPanel from "../components/HabitationDetailPanel";
import GoiTopBar from "../components/GoiTopBar";
import GoiBrandHeader from "../components/GoiBrandHeader";
import type { AlertItem, HabitationFeature } from "../types";
import { hazardBadgeClass, hazardLabel, hazardDotColor } from "../lib/utils";
import { useTranslation } from "../i18n/translations";
import { useUIStore } from "../store/uiStore";

export default function PublicMap() {
  const [districtFilter, setDistrictFilter] = useState("");
  const [hazardFilter, setHazardFilter] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const { t, lang } = useTranslation();
  const { inspectorCollapsed, toggleInspector, toggleLayers, toggleZenMode } = useUIStore();

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

      if (e.key === "]" || (e.key === "i" && e.ctrlKey)) {
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
  }, [toggleInspector, toggleLayers, toggleZenMode]);

  const { data: habitationsData, isLoading: habsLoading } = useQuery({
    queryKey: ["habitations", districtFilter, hazardFilter],
    queryFn: () => getHabitations({
      district: districtFilter || undefined,
      hazard_level: hazardFilter || undefined,
    }),
  });

  const { data: alertsData } = useQuery<AlertItem[]>({
    queryKey: ["alerts-public"],
    queryFn: () => getAlerts(),
  });

  const { data: stats } = useQuery({
    queryKey: ["geo-stats"],
    queryFn: getGeoStats,
  });

  const features: HabitationFeature[] = habitationsData?.features ?? [];
  const criticalAlerts = alertsData?.filter((a) => a.severity === "CRITICAL") ?? [];

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

  const totalPop = features.reduce((s, f) => s + (f.properties.population || 0), 0);
  const redCount = features.filter((f) => f.properties.hazard_level === "RED").length;
  const highCount = features.filter((f) => f.properties.hazard_level === "HIGH").length;

  return (
    <div id="main-content" className="h-screen w-screen flex flex-col bg-[#F8FAFC] dark:bg-[#0B0F19] font-sans overflow-hidden transition-colors">
      {/* 1. GOI Accessibility Bar + 2. Primary Brand Header */}
      <GoiTopBar />
      <GoiBrandHeader isPublic={true} />

      {/* Critical alert banner */}
      {criticalAlerts.length > 0 && (
        <div className="flex-none flex items-center gap-3 px-4 py-2 bg-red-950/40 border-b border-red-900/50 text-xs">
          <span className="flex items-center gap-1.5 text-red-400 font-semibold flex-shrink-0">
            <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
            </svg>
            {t("active_advisory")}
          </span>
          <span className="text-red-300 font-medium truncate">{criticalAlerts[0].title}</span>
          <span className="text-slate-600 hidden md:inline truncate">{criticalAlerts[0].message}</span>
        </div>
      )}

      {/* Main content */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Map */}
        <div className="flex-1 relative">
          <MapView
            district={districtFilter}
            hazardLevel={hazardFilter}
            selectedHabitationId={selectedId}
            onSelectHabitation={setSelectedId}
            showSafeSites
            habitationsData={habitationsData}
          />

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

        {/* Right panel: filters + stats + list */}
        <div
          className={`flex-none flex flex-col bg-white dark:bg-[#0F172A] border-l border-[#E2E8F0] dark:border-[#1E293B] z-10 shadow-sm transition-all duration-300 ease-in-out overflow-hidden ${
            inspectorCollapsed ? "w-0 border-l-0 opacity-0 pointer-events-none" : "w-80 sm:w-96 opacity-100 hidden lg:flex"
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

          {/* Filter & Search controls */}
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

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider block mb-0.5">
                  {t("district")}
                </label>
                <select
                  value={districtFilter}
                  onChange={(e) => setDistrictFilter(e.target.value)}
                  className="w-full text-xs py-1 px-1.5 bg-white dark:bg-[#1E293B] border border-[#CBD5E1] dark:border-[#475569] rounded-md text-[#0F172A] dark:text-[#F9FAFB]"
                >
                  <option value="">{t("all_districts")}</option>
                  {stats?.districts.map((d) => (
                    <option key={d} value={d}>{t(d)}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider block mb-0.5">
                  {t("filter_risk_label")}
                </label>
                <select
                  value={hazardFilter}
                  onChange={(e) => setHazardFilter(e.target.value)}
                  className="w-full text-xs py-1 px-1.5 bg-white dark:bg-[#1E293B] border border-[#CBD5E1] dark:border-[#475569] rounded-md text-[#0F172A] dark:text-[#F9FAFB]"
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

          {/* Modernized 2x2 Summary stats */}
          <div className="grid grid-cols-2 gap-2 p-3 bg-slate-50 dark:bg-[#0B0F19] border-b border-[#E2E8F0] dark:border-[#1E293B]">
            <div className="p-2 bg-white dark:bg-[#131E36] rounded-lg border border-[#E2E8F0] dark:border-[#1E293B] shadow-sm">
              <div className="text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400 truncate">{t("kpi_total_settlements")}</div>
              <div className="text-base font-bold font-mono text-[#0F172A] dark:text-white mt-0.5">{features.length.toLocaleString()}</div>
              <div className="text-[9px] text-slate-500 dark:text-slate-400 truncate">{filteredFeatures.length} {t("visible_in_filter")}</div>
            </div>
            <div className="p-2 bg-white dark:bg-[#131E36] rounded-lg border border-[#E2E8F0] dark:border-[#1E293B] shadow-sm">
              <div className="text-[10px] uppercase font-bold text-red-600 dark:text-red-400 truncate">{t("kpi_red_zones")}</div>
              <div className="text-base font-bold font-mono text-red-600 dark:text-red-400 mt-0.5">{redCount.toLocaleString()}</div>
              <div className="text-[9px] text-red-500 truncate">{t("immediate_action")}</div>
            </div>
            <div className="p-2 bg-white dark:bg-[#131E36] rounded-lg border border-[#E2E8F0] dark:border-[#1E293B] shadow-sm">
              <div className="text-[10px] uppercase font-bold text-orange-600 dark:text-orange-400 truncate">{t("high_risk")}</div>
              <div className="text-base font-bold font-mono text-orange-600 dark:text-orange-400 mt-0.5">{highCount.toLocaleString()}</div>
              <div className="text-[9px] text-orange-500 truncate">{t("high_surveillance")}</div>
            </div>
            <div className="p-2 bg-white dark:bg-[#131E36] rounded-lg border border-[#E2E8F0] dark:border-[#1E293B] shadow-sm">
              <div className="text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400 truncate">{t("population")}</div>
              <div className="text-base font-bold font-mono text-[#0F172A] dark:text-white mt-0.5 truncate">
                {totalPop >= 1_000_000 ? (totalPop / 1_000_000).toFixed(1) + "M" : totalPop >= 1000 ? (totalPop / 1000).toFixed(0) + "K" : totalPop}
              </div>
              <div className="text-[9px] text-slate-500 dark:text-slate-400 truncate">{t("estimated_exposure")}</div>
            </div>
          </div>

          {/* Settlement list */}
          <div className="flex-1 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800 text-xs">
            {habsLoading && (
              <div className="p-6 text-center text-xs text-slate-500">{t("loading_habitations")}</div>
            )}
            {!habsLoading && filteredFeatures.length === 0 && (
              <div className="p-6 text-center text-xs text-slate-500">{t("no_settlements_match")}</div>
            )}
            {filteredFeatures.slice(0, 200).map((f) => (
              <button
                key={f.id}
                onClick={() => setSelectedId(f.id)}
                className={`w-full text-left px-3.5 py-2.5 transition-colors flex items-start gap-2.5 ${
                  selectedId === f.id ? "bg-blue-50 dark:bg-blue-950/60 border-l-4 border-l-blue-600" : "hover:bg-slate-50 dark:hover:bg-slate-800/40"
                }`}
              >
                <span className={`w-2.5 h-2.5 rounded-full mt-1 flex-shrink-0 ${hazardDotColor(f.properties.hazard_level as any)}`} />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-1">
                    <span className="text-xs font-bold text-slate-900 dark:text-slate-100 truncate">{f.properties.name}</span>
                    <span className={`${hazardBadgeClass(f.properties.hazard_level as any)} flex-shrink-0 text-[9px] py-0 px-1.5 leading-4 font-bold`}>
                      {hazardLabel(f.properties.hazard_level as any, lang)}
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 truncate">
                    {t(f.properties.district)}, {f.properties.state}
                  </div>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                    {t("population")}: {(f.properties.population || 0).toLocaleString()} • {t("hazard_score")}: {(f.properties.hazard_score || 0).toFixed(1)}
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Habitation detail drawer */}
        {selectedId && (
          <HabitationDetailPanel
            habitationId={selectedId}
            onClose={() => setSelectedId(null)}
            isOfficial={false}
          />
        )}
      </div>
    </div>
  );
}