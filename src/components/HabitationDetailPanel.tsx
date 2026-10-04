import { useQuery } from "@tanstack/react-query";
import { getHabitationDetail, getSafeSiteMatches } from "../api/habitations";
import type { SafeSiteMatch, HazardLevel } from "../types";
import { hazardBadgeClass, hazardLabel } from "../lib/utils";
import { useTranslation } from "../i18n/translations";

interface HabitationDetailPanelProps {
  habitationId: number;
  onClose: () => void;
  onInitiatePlan?: (habitationId: number, safeSiteId: number, population: number) => void;
  onOpenAlertModal?: (habitationId: number) => void;
  isOfficial?: boolean;
  isPublic?: boolean;
}

export default function HabitationDetailPanel({
  habitationId,
  onClose,
  onInitiatePlan,
  onOpenAlertModal,
  isOfficial = false,
  isPublic = false,
}: HabitationDetailPanelProps) {
  const { t, lang } = useTranslation();
  const { data, isLoading, error } = useQuery({
    queryKey: ["habitation-detail", habitationId],
    queryFn: () => getHabitationDetail(habitationId),
  });

  const { data: safeSites, isLoading: loadingSites } = useQuery<SafeSiteMatch[]>({
    queryKey: ["safe-sites-match", habitationId],
    queryFn: () => getSafeSiteMatches(habitationId),
    enabled: !!data,
  });

  return (
    <aside className="fixed sm:absolute inset-x-0 bottom-0 sm:inset-x-auto sm:right-0 sm:top-0 max-h-[85vh] sm:max-h-none sm:h-full w-full sm:w-[380px] rounded-t-2xl sm:rounded-none bg-white dark:bg-[#0a1220] border-t sm:border-t-0 sm:border-l border-slate-200 dark:border-slate-800 flex flex-col z-50 sm:z-20 animate-slide-in-right overflow-hidden shadow-2xl">
      {/* Mobile sheet drag pill */}
      <div className="w-10 h-1 bg-slate-300 dark:bg-slate-700 rounded-full mx-auto my-2 sm:hidden shrink-0" />
      {/* Header */}
      <div className="flex-none flex items-start justify-between px-4 py-3 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#080e1d]">
        <div className="min-w-0">
          <div className="flex items-center gap-2 mb-0.5">
            <span className="text-[10px] font-semibold text-slate-500 dark:text-slate-500 uppercase tracking-widest">{t("Settlement")}</span>
            {data && (
              <span className={hazardBadgeClass(data.hazard_level as HazardLevel)}>
                {hazardLabel(data.hazard_level as HazardLevel, lang)}
              </span>
            )}
          </div>
          <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-100 truncate">
            {isLoading ? t("Loading...") : data?.name ?? t("Unknown")}
          </h2>
          {data && (
            <p className="text-xs text-slate-500 dark:text-slate-500 mt-0.5">
              {t(data.district)}, {data.state} · {t("population")} {data.population.toLocaleString()}
            </p>
          )}
        </div>
        <button onClick={onClose} className="btn-ghost p-1.5 ml-2 flex-shrink-0 -mr-1">
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
        </button>
      </div>

      {/* Body */}
      <div className="flex-1 overflow-y-auto">
        {isLoading && (
          <div className="flex items-center justify-center h-40 text-xs text-slate-600">
            <svg className="animate-spin w-5 h-5 mr-2 text-blue-600" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
            </svg>
            {t("Loading risk profile...")}
          </div>
        )}

        {error && (
          <div className="m-4 p-3 bg-red-950/40 border border-red-900/50 rounded-md text-xs text-red-400">
            {t("Failed to load risk profile.")}
          </div>
        )}

        {data && (
          <div className="divide-y divide-slate-200 dark:divide-slate-800">
            {/* Official quick actions */}
            {isOfficial && (
              <div className="p-3 flex gap-2">
                {onOpenAlertModal && (
                  <button
                    onClick={() => onOpenAlertModal(data.id)}
                    className="btn-danger flex-1 justify-center text-xs py-1.5"
                  >
                    <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 01-3.46 0"/>
                    </svg>
                    {t("Issue alert")}
                  </button>
                )}
                {onInitiatePlan && safeSites && safeSites.length > 0 && (
                  <button
                    onClick={() => onInitiatePlan(data.id, safeSites[0].id, data.population)}
                    className="btn-primary flex-1 justify-center text-xs py-1.5"
                  >
                    <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
                    </svg>
                    {t("Plan relocation")}
                  </button>
                )}
              </div>
            )}

            {/* Public Citizen View */}
            {isPublic ? (
              <>
                {/* Citizen Safety Advisory Card */}
                <div className="p-4">
                  <h3 className="text-[11px] font-semibold text-slate-500 dark:text-slate-500 uppercase tracking-widest mb-3">
                    {lang === "hi" ? "नागरिक सुरक्षा परामर्श" : "Citizen Safety Advisory"}
                  </h3>
                  <div className={`p-3.5 rounded-xl border ${
                    data.hazard_level === "RED" || data.hazard_level === "HIGH"
                      ? "bg-red-50 dark:bg-red-950/40 border-red-200 dark:border-red-900/60 text-red-900 dark:text-red-200"
                      : data.hazard_level === "MODERATE"
                      ? "bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-900/60 text-amber-900 dark:text-amber-200"
                      : "bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-900/60 text-emerald-900 dark:text-emerald-200"
                  }`}>
                    <div className="flex items-center gap-2 mb-1.5">
                      <span className="text-base">
                        {data.hazard_level === "RED" || data.hazard_level === "HIGH" ? "⚠️" : data.hazard_level === "MODERATE" ? "👁️" : "🛡️"}
                      </span>
                      <span className="text-xs font-bold uppercase tracking-wider">
                        {data.hazard_level === "RED" || data.hazard_level === "HIGH"
                          ? (lang === "hi" ? "उच्च सतर्कता क्षेत्र (अलर्ट पर रहें)" : "High Alert Area")
                          : data.hazard_level === "MODERATE"
                          ? (lang === "hi" ? "निगरानी स्थिति (सामान्य सतर्कता)" : "Watch Status")
                          : (lang === "hi" ? "सामान्य क्षेत्र (सुरक्षित)" : "Normal / Safe Status")}
                      </span>
                    </div>
                    <p className="text-[11px] opacity-90 leading-relaxed">
                      {data.hazard_level === "RED" || data.hazard_level === "HIGH"
                        ? (lang === "hi"
                            ? "इस क्षेत्र में भूस्खलन एवं वर्षा संबंधी सतर्कता लागू है। स्थानीय प्रशासन एवं आपदा नियंत्रण कक्ष के निर्देशों का पालन करें।"
                            : "Vulnerability watch active for terrain and precipitation. Maintain emergency awareness and monitor official weather advisories.")
                        : data.hazard_level === "MODERATE"
                        ? (lang === "hi"
                            ? "क्षेत्र में सामान्य निगरानी जारी है। भारी वर्षा के समय नदी-नालों एवं ढलानों से सुरक्षित दूरी बनाए रखें।"
                            : "Standard surveillance active. Maintain normal awareness during adverse monsoon weather events.")
                        : (lang === "hi"
                            ? "वर्तमान में कोई गंभीर चेतावनी लागू नहीं है। क्षेत्र सामान्य स्थिति में है।"
                            : "No critical hazard alert currently issued. Normal conditions prevail.")}
                    </p>
                  </div>
                </div>

                {/* Statutory Helplines Card */}
                <div className="p-4">
                  <h3 className="text-[11px] font-semibold text-slate-500 dark:text-slate-500 uppercase tracking-widest mb-3">
                    {lang === "hi" ? "आपदा नियंत्रण हेल्पलाइन" : "Emergency Helplines"}
                  </h3>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="p-2.5 bg-slate-50 dark:bg-[#060c1a] border border-slate-200 dark:border-slate-800 rounded-lg">
                      <div className="text-[10px] text-slate-500">{lang === "hi" ? "राज्य आपदा नियंत्रण" : "State SDMA"}</div>
                      <div className="text-base font-bold font-mono text-blue-600 dark:text-blue-400 mt-0.5">1070</div>
                      <div className="text-[9px] text-slate-400">{lang === "hi" ? "टोल-फ्री 24x7" : "Toll-Free 24x7"}</div>
                    </div>
                    <div className="p-2.5 bg-slate-50 dark:bg-[#060c1a] border border-slate-200 dark:border-slate-800 rounded-lg">
                      <div className="text-[10px] text-slate-500">{lang === "hi" ? "जिला आपदा कक्ष (DEOC)" : "District DEOC"}</div>
                      <div className="text-base font-bold font-mono text-emerald-600 dark:text-emerald-400 mt-0.5">1077</div>
                      <div className="text-[9px] text-slate-400">{t(data.district)}</div>
                    </div>
                    <div className="p-2.5 bg-slate-50 dark:bg-[#060c1a] border border-slate-200 dark:border-slate-800 rounded-lg">
                      <div className="text-[10px] text-slate-500">{lang === "hi" ? "आपातकालीन सेवा (ERSS)" : "Emergency (ERSS)"}</div>
                      <div className="text-base font-bold font-mono text-purple-600 dark:text-purple-400 mt-0.5">112</div>
                      <div className="text-[9px] text-slate-400">{lang === "hi" ? "पुलिस / अग्नि" : "Police / Fire"}</div>
                    </div>
                    <div className="p-2.5 bg-slate-50 dark:bg-[#060c1a] border border-slate-200 dark:border-slate-800 rounded-lg">
                      <div className="text-[10px] text-slate-500">{lang === "hi" ? "एम्बुलेंस सेवा" : "Ambulance"}</div>
                      <div className="text-base font-bold font-mono text-rose-600 dark:text-rose-400 mt-0.5">108</div>
                      <div className="text-[9px] text-slate-400">{lang === "hi" ? "चिकित्सा सहायता" : "Medical Aid"}</div>
                    </div>
                  </div>
                </div>

                {/* Environmental Context */}
                <div className="p-4">
                  <h3 className="text-[11px] font-semibold text-slate-500 dark:text-slate-500 uppercase tracking-widest mb-3">
                    {lang === "hi" ? "भौगोलिक परिवेश" : "Terrain & Location Context"}
                  </h3>
                  <div className="space-y-1.5">
                    {([
                      [t("Seismic zone"), `Zone ${data.seismic_zone}`],
                      [t("Elevation"), `${Math.round(data.elevation_m).toLocaleString()} m`],
                      [t("Annual rainfall"), `${Math.round(data.avg_annual_rainfall_mm)} mm`],
                      [t("River distance"), `${data.distance_to_river_km} km`],
                    ] as [string, string][]).map(([label, value]) => (
                      <div key={label} className="flex items-center justify-between text-xs">
                        <span className="text-slate-600 dark:text-slate-400">{label}</span>
                        <span className="text-slate-800 dark:text-slate-200 font-medium font-mono">{value}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Safe Shelter Locations (Citizen-Centric) */}
                <div className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-[11px] font-semibold text-slate-500 dark:text-slate-500 uppercase tracking-widest">
                      {lang === "hi" ? "निकटतम सुरक्षित आश्रय स्थल" : "Designated Safe Relief Shelters"}
                    </h3>
                    {!loadingSites && (
                      <span className="text-[10px] text-slate-600 dark:text-slate-400">{safeSites?.length ?? 0} {t("found")}</span>
                    )}
                  </div>

                  {loadingSites && <div className="text-xs text-slate-600 py-2">{t("Calculating matches...")}</div>}

                  {safeSites?.length === 0 && (
                    <div className="text-xs text-slate-600 py-2">{t("No safe sites found within range.")}</div>
                  )}

                  {safeSites?.map((site) => (
                    <div key={site.id} className="mb-2.5 p-3 bg-slate-50 dark:bg-[#060c1a] border border-slate-200 dark:border-slate-800 rounded-lg shadow-xs">
                      <div className="flex items-start justify-between gap-2 mb-1.5">
                        <div>
                          <div className="text-xs font-bold text-slate-900 dark:text-slate-100">{site.name}</div>
                          <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">{t(site.district)} · {site.distance_km} km away</div>
                        </div>
                        <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-200 dark:border-emerald-800">
                          {lang === "hi" ? "सक्रिय / खुला" : "Active / Open"}
                        </span>
                      </div>
                      <a
                        href={`https://www.google.com/maps/dir/?api=1&destination=${site.latitude},${site.longitude}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-2.5 w-full flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-lg text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 shadow-xs transition"
                      >
                        <span>🚗</span>
                        <span>{lang === "hi" ? "गूगल मैप्स पर दिशा-निर्देश प्राप्त करें ↗" : "Get Directions (Google Maps) ↗"}</span>
                      </a>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <>
                {/* Officer Score summary */}
                <div className="p-4">
                  <h3 className="text-[11px] font-semibold text-slate-500 dark:text-slate-500 uppercase tracking-widest mb-3">{t("Risk Scores")}</h3>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="bg-slate-50 dark:bg-[#060c1a] border border-slate-200 dark:border-slate-800 rounded-md p-3">
                      <div className="text-[10px] text-slate-600 mb-1">{t("Hazard score")}</div>
                      <div className="text-xl font-bold font-mono text-red-400">{data.hazard_score.toFixed(1)}</div>
                      <div className="text-[10px] text-slate-700 mt-0.5">{t("out of 100")}</div>
                    </div>
                    <div className="bg-slate-50 dark:bg-[#060c1a] border border-slate-200 dark:border-slate-800 rounded-md p-3">
                      <div className="text-[10px] text-slate-600 mb-1">{t("Vulnerability score")}</div>
                      <div className="text-xl font-bold font-mono text-orange-400">{data.vulnerability_score.toFixed(1)}</div>
                      <div className="text-[10px] text-slate-700 mt-0.5">{t("out of 100")}</div>
                    </div>
                  </div>
                </div>

                {/* Hazard breakdown */}
                <div className="p-4">
                  <h3 className="text-[11px] font-semibold text-slate-500 dark:text-slate-500 uppercase tracking-widest mb-3">{t("Hazard breakdown")}</h3>
                  <div className="space-y-2">
                    {Object.entries(data.score_breakdown.hazard).map(([key, val]) => (
                      <ScoreBar key={key} label={t(key.replace(/_/g, " "))} value={val} max={30} color="bg-red-600" />
                    ))}
                  </div>
                </div>

                {/* Vulnerability breakdown */}
                <div className="p-4">
                  <h3 className="text-[11px] font-semibold text-slate-500 dark:text-slate-500 uppercase tracking-widest mb-3">{t("Vulnerability breakdown")}</h3>
                  <div className="space-y-2">
                    {Object.entries(data.score_breakdown.vulnerability).map(([key, val]) => (
                      <ScoreBar key={key} label={t(key.replace(/_/g, " "))} value={val} max={25} color="bg-orange-600" />
                    ))}
                  </div>
                </div>

                {/* Raw indicators */}
                <div className="p-4">
                  <h3 className="text-[11px] font-semibold text-slate-500 dark:text-slate-500 uppercase tracking-widest mb-3">{t("Environmental indicators")}</h3>
                  <div className="space-y-1.5">
                    {([
                      [t("Seismic zone"), `Zone ${data.seismic_zone}`],
                      [t("Elevation"), `${Math.round(data.elevation_m).toLocaleString()} m`],
                      [t("Annual rainfall"), `${Math.round(data.avg_annual_rainfall_mm)} mm`],
                      [t("Extreme rain days"), `${data.extreme_rainfall_days} days/yr`],
                      [t("River distance"), `${data.distance_to_river_km} km`],
                      [t("Dilapidated housing"), `${data.pct_dilapidated_housing}%`],
                      [t("Kutcha roof/wall"), `${data.pct_kutcha_roof_wall}%`],
                      [t("No toilet access"), `${data.pct_no_toilet}%`],
                      [t("No drainage"), `${data.pct_no_drainage}%`],
                    ] as [string, string][]).map(([label, value]) => (
                      <div key={label} className="flex items-center justify-between text-xs">
                        <span className="text-slate-600">{label}</span>
                        <span className="text-slate-700 dark:text-slate-300 font-medium font-mono">{value}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Safe site matches */}
                <div className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-[11px] font-semibold text-slate-500 dark:text-slate-500 uppercase tracking-widest">{t("Matched safe sites")}</h3>
                    {!loadingSites && (
                      <span className="text-[10px] text-slate-600">{safeSites?.length ?? 0} {t("found")}</span>
                    )}
                  </div>

                  {loadingSites && <div className="text-xs text-slate-600">{t("Calculating matches...")}</div>}

                  {safeSites?.length === 0 && (
                    <div className="text-xs text-slate-600 py-2">{t("No safe sites found within range.")}</div>
                  )}

                  {safeSites?.map((site) => (
                    <div key={site.id} className="mb-2 p-3 bg-slate-50 dark:bg-[#060c1a] border border-slate-200 dark:border-slate-800 rounded-md hover:border-slate-300 dark:border-slate-700 transition-colors">
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <div>
                          <div className="text-xs font-semibold text-slate-800 dark:text-slate-200">{site.name}</div>
                          <div className="text-[11px] text-slate-600 mt-0.5">{t(site.district)} · {site.distance_km} km away</div>
                        </div>
                        <div className="text-right flex-shrink-0">
                          <div className="text-xs font-bold font-mono text-blue-400">{Math.round(site.suitability_score)}%</div>
                          <div className="text-[10px] text-slate-600">{t("match")}</div>
                        </div>
                      </div>
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="text-slate-600">
                          {t("Capacity:")} <span className="text-emerald-400 font-mono font-medium">{site.remaining_capacity.toLocaleString()}</span>
                        </span>
                        {site.can_fully_accommodate ? (
                          <span className="text-emerald-500">✓ {t("Full accommodation")}</span>
                        ) : (
                          <span className="text-yellow-600">{t("Partial capacity only")}</span>
                        )}
                      </div>
                      {isOfficial && onInitiatePlan && (
                        <button
                          onClick={() => onInitiatePlan(data.id, site.id, data.population)}
                          className="mt-2 w-full text-[11px] font-semibold text-blue-700 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 bg-blue-50 dark:bg-transparent border border-blue-200 dark:border-blue-900/60 hover:border-blue-400 dark:hover:border-blue-700 rounded py-1.5 transition-colors"
                        >
                          {t("Use this site for relocation plan →")}
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </aside>
  );
}

function ScoreBar({ label, value, max, color }: { label: string; value: number; max: number; color: string }) {
  const pct = Math.min(100, (value / max) * 100);
  return (
    <div>
      <div className="flex justify-between items-center mb-1">
        <span className="text-[11px] text-slate-500 dark:text-slate-500 capitalize">{label}</span>
        <span className="text-[11px] font-mono text-slate-600 dark:text-slate-400">{value.toFixed(1)}</span>
      </div>
      <div className="h-1 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
        <div className={`h-full ${color} rounded-full`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}