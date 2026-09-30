import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { getHabitations } from "../api/habitations";
import { getAlerts } from "../api/relocation";
import { getGeoStats } from "../api/stats";
import MapView from "../components/MapView";
import HabitationDetailPanel from "../components/HabitationDetailPanel";
import type { AlertItem, HabitationFeature } from "../types";
import { hazardBadgeClass, hazardLabel, hazardDotColor } from "../lib/utils";
import { useAuthStore } from "../store/authStore";

export default function PublicMap() {
  const [districtFilter, setDistrictFilter] = useState("");
  const [hazardFilter, setHazardFilter] = useState<string>("");
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const { accessToken } = useAuthStore();
  const navigate = useNavigate();

  const { data: habitationsData } = useQuery({
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
  const totalPop = features.reduce((s, f) => s + (f.properties.population || 0), 0);
  const redCount = features.filter((f) => f.properties.hazard_level === "RED").length;
  const highCount = features.filter((f) => f.properties.hazard_level === "HIGH").length;

  return (
    <div className="h-screen w-screen flex flex-col bg-[#060c1a] font-sans overflow-hidden">
      {/* Top bar */}
      <header className="flex-none flex items-center justify-between px-4 h-12 bg-[#0a1220] border-b border-slate-800 z-30">
        <div className="flex items-center gap-3">
          <div className="w-7 h-7 rounded bg-blue-600 flex items-center justify-center flex-shrink-0">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
            </svg>
          </div>
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-100 text-sm">RiskSetu</span>
            <span className="hidden sm:inline text-slate-700 text-sm">—</span>
            <span className="hidden sm:inline text-slate-500 text-xs">Public Hazard Map</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {criticalAlerts.length > 0 && (
            <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded bg-red-950/60 border border-red-800/60">
              <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
              <span className="text-xs text-red-400 font-medium">{criticalAlerts.length} critical alert{criticalAlerts.length > 1 ? "s" : ""}</span>
            </div>
          )}
          {accessToken ? (
            <button
              onClick={() => navigate("/dashboard")}
              className="btn-primary text-xs py-1.5 px-3"
            >
              Command Centre →
            </button>
          ) : (
            <Link to="/login" className="btn-primary text-xs py-1.5 px-3">
              Official login
            </Link>
          )}
        </div>
      </header>

      {/* Critical alert banner */}
      {criticalAlerts.length > 0 && (
        <div className="flex-none flex items-center gap-3 px-4 py-2 bg-red-950/40 border-b border-red-900/50 text-xs">
          <span className="flex items-center gap-1.5 text-red-400 font-semibold flex-shrink-0">
            <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
            </svg>
            Active advisory
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
          />
        </div>

        {/* Right panel: filters + stats + list */}
        <div className="w-72 flex-none flex flex-col bg-[#0a1220] border-l border-slate-800 z-10 hidden lg:flex">
          {/* Filter controls */}
          <div className="p-3 border-b border-slate-800 space-y-2">
            <select
              value={districtFilter}
              onChange={(e) => setDistrictFilter(e.target.value)}
              className="select text-xs py-1.5"
            >
              <option value="">All districts</option>
              {stats?.districts.map((d) => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
            <select
              value={hazardFilter}
              onChange={(e) => setHazardFilter(e.target.value)}
              className="select text-xs py-1.5"
            >
              <option value="">All risk levels</option>
              <option value="RED">Red zone (extreme)</option>
              <option value="HIGH">High risk</option>
              <option value="MODERATE">Moderate risk</option>
              <option value="SAFE">Safe</option>
            </select>
          </div>

          {/* Summary stats */}
          <div className="grid grid-cols-2 gap-px bg-slate-800 border-b border-slate-800">
            <div className="p-3 bg-[#0a1220]">
              <div className="text-lg font-bold text-white font-mono">{features.length}</div>
              <div className="text-[11px] text-slate-500 mt-0.5">Settlements</div>
            </div>
            <div className="p-3 bg-[#0a1220]">
              <div className="text-lg font-bold text-red-400 font-mono">{redCount}</div>
              <div className="text-[11px] text-slate-500 mt-0.5">Red zones</div>
            </div>
            <div className="p-3 bg-[#0a1220]">
              <div className="text-lg font-bold text-orange-400 font-mono">{highCount}</div>
              <div className="text-[11px] text-slate-500 mt-0.5">High risk</div>
            </div>
            <div className="p-3 bg-[#0a1220]">
              <div className="text-sm font-bold text-slate-300 font-mono truncate">
                {totalPop >= 1_000_000 ? (totalPop / 1_000_000).toFixed(1) + "M" : totalPop >= 1000 ? (totalPop / 1000).toFixed(0) + "K" : totalPop}
              </div>
              <div className="text-[11px] text-slate-500 mt-0.5">Population</div>
            </div>
          </div>

          {/* Settlement list */}
          <div className="flex-1 overflow-y-auto">
            {features.length === 0 && (
              <div className="p-6 text-center text-xs text-slate-600">No settlements match your filters.</div>
            )}
            {features.map((f) => (
              <button
                key={f.id}
                onClick={() => setSelectedId(f.id)}
                className={`w-full text-left px-3 py-2.5 border-b border-slate-800/60 hover:bg-slate-800/40 transition-colors flex items-start gap-2.5 ${
                  selectedId === f.id ? "bg-blue-900/20 border-blue-800/30" : ""
                }`}
              >
                <span className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${hazardDotColor(f.properties.hazard_level as any)}`} />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-1">
                    <span className="text-xs font-medium text-slate-200 truncate">{f.properties.name}</span>
                    <span className={`${hazardBadgeClass(f.properties.hazard_level as any)} flex-shrink-0 text-[10px] py-0 leading-5`}>
                      {hazardLabel(f.properties.hazard_level as any)}
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-600 mt-0.5 truncate">
                    {f.properties.district}, {f.properties.state}
                  </div>
                  <div className="text-[11px] text-slate-600 mt-0.5">
                    Pop: {(f.properties.population || 0).toLocaleString()} · Score: {(f.properties.hazard_score || 0).toFixed(1)}
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