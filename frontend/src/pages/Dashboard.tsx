import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getHabitations } from "../api/habitations";
import { getRelocationPlans, updateRelocationPlan, getAlerts, deleteAlert } from "../api/relocation";
import { getSafeSites } from "../api/safesites";
import { getGeoStats, simulateDisaster, type SimulationResult } from "../api/stats";
import { useAuthStore } from "../store/authStore";
import MapView from "../components/MapView";
import HabitationDetailPanel from "../components/HabitationDetailPanel";
import CreatePlanModal from "../components/CreatePlanModal";
import CreateAlertModal from "../components/CreateAlertModal";
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

// ── Sidebar navigation items
const NAV = [
  {
    id: "map",
    icon: (
      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polygon points="3 6 9 3 15 6 21 3 21 18 15 21 9 18 3 21"/>
        <line x1="9" y1="3" x2="9" y2="18"/><line x1="15" y1="6" x2="15" y2="21"/>
      </svg>
    ),
    label: "Risk Map",
  },
  {
    id: "plans",
    icon: (
      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/>
        <line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/>
      </svg>
    ),
    label: "Relocation Plans",
  },
  {
    id: "safesites",
    icon: (
      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
      </svg>
    ),
    label: "Safe Sites",
  },
  {
    id: "alerts",
    icon: (
      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 01-3.46 0"/>
      </svg>
    ),
    label: "Alerts",
  },
  {
    id: "analytics",
    icon: (
      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/>
      </svg>
    ),
    label: "Overview",
  },
  {
    id: "simulate",
    icon: (
      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/>
      </svg>
    ),
    label: "Simulate",
  },
];

export default function Dashboard() {
  const [tab, setTab] = useState("map");
  const [districtFilter, setDistrictFilter] = useState("");
  const [hazardFilter, setHazardFilter] = useState("");
  const [selectedHabId, setSelectedHabId] = useState<number | null>(null);

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
  const { user, username, logout, fetchProfile } = useAuthStore();
  const navigate = useNavigate();

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
  const role = user?.role ?? "OFFICIAL";

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

  return (
    <div className="h-screen w-screen flex flex-col bg-[#060c1a] font-sans overflow-hidden">
      {/* Top header */}
      <header className="flex-none flex items-center px-4 h-12 bg-[#0a1220] border-b border-slate-800 z-30 gap-4">
        <div className="flex items-center gap-2.5 flex-shrink-0">
          <div className="w-7 h-7 rounded bg-blue-600 flex items-center justify-center">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
            </svg>
          </div>
          <span className="font-semibold text-slate-100 text-sm">RiskSetu</span>
          <span className="text-slate-800 text-xs hidden sm:inline">/</span>
          <span className="text-slate-500 text-xs hidden sm:inline">Command Centre</span>
        </div>

        <div className="flex-1" />

        {/* Alert count badge */}
        {alerts && alerts.filter((a) => a.severity === "CRITICAL").length > 0 && (
          <div className="flex items-center gap-1.5 px-2 py-1 rounded bg-red-950/60 border border-red-800/60">
            <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
            <span className="text-xs text-red-400">
              {alerts.filter((a) => a.severity === "CRITICAL").length} critical
            </span>
          </div>
        )}

        {/* User info + logout */}
        <div className="flex items-center gap-3 flex-shrink-0">
          <div className="hidden sm:flex flex-col text-right">
            <span className="text-xs font-medium text-slate-300">{displayName}</span>
            <span className="text-[10px] text-slate-600">{user?.department || role}</span>
          </div>
          <div className="w-7 h-7 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-xs font-bold text-slate-300">
            {displayName.charAt(0).toUpperCase()}
          </div>
          <button
            onClick={() => { logout(); navigate("/login"); }}
            className="btn-ghost text-xs py-1 px-2"
            title="Sign out"
          >
            <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/>
            </svg>
            <span className="hidden sm:inline">Sign out</span>
          </button>
        </div>
      </header>

      {/* Body: sidebar + content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar */}
        <nav className="flex-none w-14 lg:w-48 flex flex-col bg-[#0a1220] border-r border-slate-800 py-3">
          <div className="flex-1 space-y-0.5 px-2">
            {NAV.map((item) => (
              <button
                key={item.id}
                onClick={() => setTab(item.id)}
                className={`w-full flex items-center gap-3 px-2 py-2 rounded-md text-sm transition-colors ${
                  tab === item.id
                    ? "bg-blue-600 text-white"
                    : "text-slate-500 hover:text-slate-300 hover:bg-slate-800/60"
                }`}
              >
                <span className="flex-shrink-0">{item.icon}</span>
                <span className="hidden lg:inline font-medium">{item.label}</span>
                {item.id === "alerts" && alerts && alerts.length > 0 && (
                  <span className="hidden lg:inline ml-auto text-[10px] font-bold bg-red-900/60 text-red-400 px-1.5 py-0.5 rounded">
                    {alerts.length}
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* Dev console link at bottom */}
          <div className="px-2 mt-auto pt-3 border-t border-slate-800">
            <a
              href="http://localhost:8000/system-console/"
              target="_blank"
              rel="noopener noreferrer"
              className="w-full flex items-center gap-3 px-2 py-2 rounded-md text-slate-700 hover:text-slate-500 text-xs transition-colors"
              title="Django developer admin console"
            >
              <svg className="w-4 h-4 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/>
              </svg>
              <span className="hidden lg:inline">Dev console</span>
            </a>
          </div>
        </nav>

        {/* Main content */}
        <main className="flex-1 overflow-hidden flex flex-col">

          {/* ━━━ TAB: RISK MAP ━━━ */}
          {tab === "map" && (
            <div className="flex-1 flex overflow-hidden">
              {/* Settlement explorer sidebar */}
              <div className="w-64 flex-none flex flex-col bg-[#0a1220] border-r border-slate-800">
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
                  <select value={hazardFilter} onChange={(e) => setHazardFilter(e.target.value)} className="select text-xs py-1.5">
                    <option value="">All risk levels</option>
                    <option value="RED">Red zone</option>
                    <option value="HIGH">High risk</option>
                    <option value="MODERATE">Moderate</option>
                    <option value="SAFE">Safe</option>
                  </select>
                </div>

                {/* Mini stats */}
                <div className="grid grid-cols-2 gap-px bg-slate-800/40 border-b border-slate-800">
                  <div className="bg-[#0a1220] px-3 py-2.5">
                    <div className="text-base font-bold font-mono text-white">{features.length}</div>
                    <div className="text-[10px] text-slate-600">settlements</div>
                  </div>
                  <div className="bg-[#0a1220] px-3 py-2.5">
                    <div className="text-base font-bold font-mono text-red-400">{redCount}</div>
                    <div className="text-[10px] text-slate-600">red zones</div>
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto text-xs">
                  {habsLoading && <div className="p-4 text-slate-600 text-center">Loading...</div>}
                  {features.map((f) => (
                    <button
                      key={f.id}
                      onClick={() => setSelectedHabId(f.id)}
                      className={`w-full text-left px-3 py-2 border-b border-slate-800/60 hover:bg-slate-800/40 transition-colors flex items-start gap-2 ${
                        selectedHabId === f.id ? "bg-blue-950/40 border-blue-800/30" : ""
                      }`}
                    >
                      <span className={`w-2 h-2 rounded-full mt-1 flex-shrink-0 ${hazardDotColor(f.properties.hazard_level as any)}`} />
                      <div className="min-w-0">
                        <div className="flex items-center justify-between gap-1">
                          <span className="font-medium text-slate-200 truncate text-[12px]">{f.properties.name}</span>
                        </div>
                        <div className="text-[11px] text-slate-600 truncate mt-0.5">{f.properties.district}</div>
                        <div className="text-[11px] text-slate-700 mt-0.5">
                          {(f.properties.population || 0).toLocaleString()} pop
                        </div>
                      </div>
                      <span className={`${hazardBadgeClass(f.properties.hazard_level as any)} ml-auto flex-shrink-0 text-[9px] py-0 leading-5`}>
                        {hazardLabel(f.properties.hazard_level as any)}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Map */}
              <div className="flex-1 relative">
                <MapView
                  district={districtFilter}
                  hazardLevel={hazardFilter}
                  selectedHabitationId={selectedHabId}
                  onSelectHabitation={setSelectedHabId}
                  showSafeSites
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
            </div>
          )}

          {/* ━━━ TAB: RELOCATION PLANS ━━━ */}
          {tab === "plans" && (
            <div className="flex-1 overflow-y-auto p-6">
              <div className="max-w-6xl mx-auto">
                <div className="section-header">
                  <div>
                    <h1 className="text-base font-semibold text-slate-100">Relocation Plans</h1>
                    <p className="text-xs text-slate-500 mt-0.5">Manage evacuation and rehabilitation operations</p>
                  </div>
                  <button onClick={() => openPlan(null, null, 0)} className="btn-primary text-xs">
                    <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
                    </svg>
                    New plan
                  </button>
                </div>

                {plansLoading && <div className="py-12 text-center text-xs text-slate-600">Loading plans...</div>}

                {plans && plans.length === 0 && (
                  <div className="py-16 text-center">
                    <div className="w-12 h-12 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center mx-auto mb-3">
                      <svg className="w-5 h-5 text-slate-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/>
                      </svg>
                    </div>
                    <p className="text-sm text-slate-500 mb-1">No relocation plans yet</p>
                    <p className="text-xs text-slate-700">Create the first plan to start tracking evacuations</p>
                    <button onClick={() => openPlan(null, null, 0)} className="btn-outline text-xs mt-4">Create first plan</button>
                  </div>
                )}

                {plans && plans.length > 0 && (
                  <div className="card overflow-hidden">
                    <table className="w-full text-xs border-collapse">
                      <thead>
                        <tr className="bg-slate-950/60 border-b border-slate-800">
                          <th className="px-4 py-3 text-left text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Settlement</th>
                          <th className="px-4 py-3 text-left text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Safe site</th>
                          <th className="px-4 py-3 text-left text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Priority</th>
                          <th className="px-4 py-3 text-right text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Population</th>
                          <th className="px-4 py-3 text-left text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Status</th>
                          <th className="px-4 py-3 text-left text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Created by</th>
                          <th className="px-4 py-3 text-right text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800/60">
                        {plans.map((plan) => (
                          <tr key={plan.id} className="hover:bg-slate-800/30 transition-colors">
                            <td className="px-4 py-3 text-slate-200 font-medium">{plan.habitation_name || `#${plan.habitation}`}</td>
                            <td className="px-4 py-3 text-emerald-400 font-medium">{plan.safe_site_name || `#${plan.safe_site}`}</td>
                            <td className="px-4 py-3">
                              <span className={priorityBadgeClass(plan.priority)}>{plan.priority.replace("_", " ")}</span>
                            </td>
                            <td className="px-4 py-3 text-right text-slate-300 font-mono">{plan.population_to_relocate.toLocaleString()}</td>
                            <td className="px-4 py-3">
                              <span className={statusBadgeClass(plan.status)}>{plan.status.replace("_", " ")}</span>
                            </td>
                            <td className="px-4 py-3 text-slate-500">{plan.created_by_name || "—"}</td>
                            <td className="px-4 py-3 text-right">
                              <div className="flex items-center justify-end gap-1.5">
                                {plan.status === "PROPOSED" && user?.role === "SUPERADMIN" && (
                                  <button
                                    onClick={() => updateStatus.mutate({ id: plan.id, status: "APPROVED" })}
                                    className="px-2 py-1 text-[11px] font-medium rounded border border-blue-800/60 bg-blue-950/40 text-blue-400 hover:bg-blue-900/40 transition-colors"
                                  >Approve</button>
                                )}
                                {plan.status === "APPROVED" && (
                                  <button
                                    onClick={() => updateStatus.mutate({ id: plan.id, status: "IN_PROGRESS" })}
                                    className="px-2 py-1 text-[11px] font-medium rounded border border-yellow-800/60 bg-yellow-950/40 text-yellow-400 hover:bg-yellow-900/40 transition-colors"
                                  >Activate</button>
                                )}
                                {plan.status === "IN_PROGRESS" && (
                                  <button
                                    onClick={() => updateStatus.mutate({ id: plan.id, status: "COMPLETED" })}
                                    className="px-2 py-1 text-[11px] font-medium rounded border border-green-800/60 bg-green-950/40 text-green-400 hover:bg-green-900/40 transition-colors"
                                  >Mark complete</button>
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
                    <h1 className="text-base font-semibold text-slate-100">Safe Relocation Sites</h1>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Verified shelter capacity — <span className="text-slate-400 font-medium">{totalCapacity.toLocaleString()}</span> places available
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
                      <div key={site.id} className="card p-4 hover:border-slate-700 transition-colors">
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <h3 className="text-sm font-semibold text-slate-100">{props.name}</h3>
                            <p className="text-xs text-slate-500 mt-0.5">{props.district}</p>
                          </div>
                          <span className="badge-safe">Active</span>
                        </div>

                        {/* Capacity bar */}
                        <div className="mb-3">
                          <div className="flex justify-between text-[11px] text-slate-600 mb-1.5">
                            <span>Capacity used</span>
                            <span className="font-mono">{used.toLocaleString()} / {props.estimated_capacity.toLocaleString()}</span>
                          </div>
                          <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full ${pct > 80 ? "bg-red-600" : pct > 50 ? "bg-yellow-600" : "bg-emerald-600"}`}
                              style={{ width: `${Math.min(100, pct)}%` }}
                            />
                          </div>
                          <div className="text-[11px] text-emerald-500 mt-1 font-medium">{rem.toLocaleString()} places available</div>
                        </div>

                        {/* Details grid */}
                        <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-[11px] pt-3 border-t border-slate-800">
                          <div className="text-slate-600">Area</div>
                          <div className="text-slate-300 font-mono text-right">{props.available_area_hectares} ha</div>
                          <div className="text-slate-600">Hazard score</div>
                          <div className="text-slate-300 font-mono text-right">{props.hazard_score}</div>
                          <div className="text-slate-600">Road access</div>
                          <div className={`font-medium text-right ${props.road_access ? "text-emerald-500" : "text-red-500"}`}>
                            {props.road_access ? "Yes" : "No"}
                          </div>
                          <div className="text-slate-600">Water supply</div>
                          <div className={`font-medium text-right ${props.water_availability ? "text-emerald-500" : "text-red-500"}`}>
                            {props.water_availability ? "Yes" : "No"}
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
                    <h1 className="text-base font-semibold text-slate-100">Early Warning Alerts</h1>
                    <p className="text-xs text-slate-500 mt-0.5">Broadcast emergency advisories to field teams and the public map</p>
                  </div>
                  <button onClick={() => openAlertModal(null)} className="btn-danger text-xs">
                    <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
                    </svg>
                    New alert
                  </button>
                </div>

                {alertsLoading && <div className="py-12 text-center text-xs text-slate-600">Loading...</div>}

                {alerts && alerts.length === 0 && (
                  <div className="py-16 text-center">
                    <div className="w-12 h-12 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center mx-auto mb-3">
                      <svg className="w-5 h-5 text-slate-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 01-3.46 0"/>
                      </svg>
                    </div>
                    <p className="text-sm text-slate-500">No active alerts</p>
                  </div>
                )}

                <div className="space-y-2">
                  {alerts?.map((item) => (
                    <div key={item.id} className="card flex items-start gap-4 p-4 hover:border-slate-700 transition-colors">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1.5">
                          <span className={alertSeverityClass(item.severity)}>{item.severity}</span>
                          <h3 className="text-sm font-semibold text-slate-100">{item.title}</h3>
                          {item.habitation_name && (
                            <span className="text-xs text-slate-600">· {item.habitation_name}</span>
                          )}
                        </div>
                        <p className="text-xs text-slate-400 leading-relaxed">{item.message}</p>
                        <div className="flex items-center gap-3 mt-2 text-[11px] text-slate-600">
                          <span>By {item.created_by_name || "Official"}</span>
                          <span>·</span>
                          <span>{new Date(item.created_at).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" })}</span>
                        </div>
                      </div>
                      <button
                        onClick={() => removeAlert.mutate(item.id)}
                        className="flex-none text-slate-700 hover:text-red-400 p-1.5 rounded hover:bg-slate-800 transition-colors"
                        title="Delete alert"
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
              <div className="w-72 flex-none flex flex-col bg-[#0a1220] border-r border-slate-800">
                <div className="p-4 border-b border-slate-800">
                  <h2 className="text-sm font-semibold text-slate-100">Disaster Simulation</h2>
                  <p className="text-xs text-slate-500 mt-1">Click anywhere on the map to set the disaster epicenter.</p>
                </div>
                
                <div className="p-4 space-y-4 flex-1 overflow-y-auto">
                  <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1">Disaster Type</label>
                    <select
                      value={simType}
                      onChange={(e) => setSimType(e.target.value)}
                      className="select w-full text-sm"
                    >
                      <option value="CLOUDBURST">Cloudburst</option>
                      <option value="EARTHQUAKE">Earthquake</option>
                      <option value="FLOOD">Flood</option>
                      <option value="LANDSLIDE">Landslide</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1">
                      Radius (km): <span className="text-slate-200">{simRadius} km</span>
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
                    <div className="text-xs text-slate-400 bg-slate-900/50 p-2 rounded border border-slate-800">
                      <div>Epicenter Set:</div>
                      <div className="font-mono text-slate-300">Lat: {simEpicenter.lat.toFixed(4)}</div>
                      <div className="font-mono text-slate-300">Lon: {simEpicenter.lon.toFixed(4)}</div>
                    </div>
                  )}

                  <button
                    onClick={handleRunSimulation}
                    disabled={!simEpicenter || simLoading}
                    className={`w-full py-2 rounded text-sm font-medium transition-colors ${
                      !simEpicenter || simLoading
                        ? "bg-slate-800 text-slate-500 cursor-not-allowed"
                        : "bg-red-600 text-white hover:bg-red-700"
                    }`}
                  >
                    {simLoading ? "Simulating..." : "Run Simulation"}
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
                      <div className="mt-6 pt-4 border-t border-slate-800">
                        <h3 className="text-xs font-semibold text-slate-100 uppercase tracking-wider mb-3">Simulation Results</h3>
                        
                        <div className="mb-4 bg-red-950/30 border border-red-900/50 p-2.5 rounded">
                          <p className="text-[11px] font-semibold text-red-400 mb-1">Expected Impact</p>
                          <p className="text-[11px] text-red-200/80 leading-relaxed">{impactText}</p>
                        </div>

                        <div className="space-y-2 mb-4">
                          <div className="flex justify-between text-sm">
                            <span className="text-slate-500">Affected Population:</span>
                            <span className="font-mono text-red-400 font-bold">{simResults.total_affected_population.toLocaleString()}</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-slate-500">Affected Settlements:</span>
                            <span className="font-mono text-slate-200">{simResults.affected_habitations.length}</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-slate-500">High/Red Risk Zones:</span>
                            <span className="font-mono text-orange-400 font-bold">{highRiskAffected}</span>
                          </div>
                        </div>

                        {Object.keys(utilizedShelters).length > 0 && (
                          <div className="mt-4 pt-4 border-t border-slate-800/60">
                            <h4 className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-2">Utilized Safe Sites</h4>
                            <div className="space-y-1.5">
                              {Object.values(utilizedShelters).map(site => (
                                <div key={site.name} className="flex justify-between items-center text-[11px]">
                                  <span className="text-emerald-400 truncate pr-2 flex-1">{site.name}</span>
                                  <span className="font-mono text-slate-300 flex-shrink-0">+{site.population.toLocaleString()} pax</span>
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

              <div className="flex-1 relative">
                <MapView
                  district={districtFilter}
                  hazardLevel={hazardFilter}
                  showSafeSites
                  simulationMode={true}
                  simulationResults={simResults}
                  onMapClick={(lat, lon) => {
                    setSimEpicenter({ lat, lon });
                    setSimResults(null);
                  }}
                />
              </div>
            </div>
          )}

          {/* ━━━ TAB: OVERVIEW / ANALYTICS ━━━ */}
          {tab === "analytics" && (
            <div className="flex-1 overflow-y-auto p-6">
              <div className="max-w-6xl mx-auto">
                <div className="mb-6">
                  <h1 className="text-base font-semibold text-slate-100">Operational Overview</h1>
                  <p className="text-xs text-slate-500 mt-0.5">District-level summary of hazard exposure and response capacity</p>
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
                    <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-4">Settlement distribution by risk</h3>
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
                                <span className="text-xs text-slate-400">{hazardLabel(level)}</span>
                              </div>
                              <span className="text-xs font-mono text-slate-300">{count} <span className="text-slate-600">({pct.toFixed(0)}%)</span></span>
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
                    <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-4">Relocation plan pipeline</h3>
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
                              <span className="text-xs text-slate-400 font-mono">{pop.toLocaleString()} people</span>
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
                    <p className="text-sm font-medium text-slate-300">Developer database console</p>
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

function KPI({ label, value, sub, highlight = "text-white" }: { label: string; value: string; sub: string; highlight?: string }) {
  return (
    <div className="card p-4">
      <div className="text-xs text-slate-500 mb-1">{label}</div>
      <div className={`text-2xl font-bold font-mono ${highlight}`}>{value}</div>
      <div className="text-[11px] text-slate-700 mt-1">{sub}</div>
    </div>
  );
}