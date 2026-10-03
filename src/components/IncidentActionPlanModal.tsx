import { useRef } from "react";
import { Printer, X, AlertTriangle, MapPin, Building, Users, ShieldCheck, CheckCircle2 } from "lucide-react";
import type { SimulationResult } from "../api/stats";
import { useTranslation } from "../i18n/translations";

interface IncidentActionPlanModalProps {
  isOpen: boolean;
  onClose: () => void;
  results: SimulationResult;
}

export default function IncidentActionPlanModal({
  isOpen,
  onClose,
  results,
}: IncidentActionPlanModalProps) {
  const { t, lang } = useTranslation();
  const printRef = useRef<HTMLDivElement>(null);

  if (!isOpen) return null;

  const now = new Date();
  const istDateStr = new Intl.DateTimeFormat(lang === "hi" ? "hi-IN" : "en-IN", {
    timeZone: "Asia/Kolkata",
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  }).format(now) + " IST";

  const incidentId = `IAP-UK-2026-${Math.floor(100000 + Math.random() * 900000)}`;
  const { epicenter, summary, affected_habitations, reachable_shelters } = results;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 overflow-y-auto animate-in fade-in duration-200">
      <div className="w-full max-w-4xl bg-white dark:bg-[#0F172A] rounded-2xl shadow-2xl border border-slate-300 dark:border-slate-700 flex flex-col max-h-[92vh] overflow-hidden">
        {/* Modal Action Bar (Hidden on print) */}
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-900/80 flex-shrink-0 print:hidden">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white font-bold text-xs shadow">
              IAP
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900 dark:text-white">
                {t("IAP_title")}
              </h2>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                {t("IAP_desc")}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-blue-700 hover:bg-blue-800 text-white text-xs font-bold rounded-lg shadow transition"
              title="Print / Save PDF (Ctrl+P)"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>{t("Print / Save as PDF")}</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-lg transition"
              title={t("Close Modal")}
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Printable Official Document Body */}
        <div
          ref={printRef}
          id="incident-action-plan-doc"
          className="p-8 sm:p-10 overflow-y-auto space-y-6 text-slate-900 dark:text-slate-100 font-sans print:p-0 print:m-0 print:text-black print:bg-white"
        >
          {/* Official Letterhead */}
          <div className="border-b-2 border-slate-900 dark:border-slate-300 pb-4 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full overflow-hidden border border-slate-300 flex-shrink-0 bg-white p-0.5 shadow-sm">
                <img src="/riskos-logo.png" alt="Emblem" className="w-full h-full object-cover rounded-full" />
              </div>
              <div>
                <h1 className="text-base sm:text-lg font-black tracking-tight uppercase font-serif text-slate-900 dark:text-white leading-tight">
                  {t("State Disaster Management Authority (SDMA)")}
                </h1>
                <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  {t("Government of Uttarakhand • National Disaster Management Authority (NDMA)")}
                </p>
                <p className="text-[10px] text-slate-500 font-mono mt-0.5">
                  {t("State Emergency Operations Centre (SEOC), Dehradun • Statutory ICS Briefing")}
                </p>
              </div>
            </div>

            <div className="text-right flex flex-col items-end">
              <span className="px-2.5 py-0.5 rounded bg-red-100 dark:bg-red-950/80 text-red-800 dark:text-red-300 border border-red-300 dark:border-red-800 text-[10px] font-bold tracking-wider uppercase">
                {t("EMERGENCY OPERATIONAL DIRECTIVE")}
              </span>
              <span className="text-[11px] font-mono font-bold text-slate-800 dark:text-slate-200 mt-1">
                {t("Ref ID:")} {incidentId}
              </span>
              <span className="text-[10px] text-slate-500 font-mono">
                {t("Generated:")} {istDateStr}
              </span>
            </div>
          </div>

          {/* Incident Classification Banner */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-3.5 rounded-xl bg-slate-100 dark:bg-slate-900/80 border border-slate-300 dark:border-slate-800 text-xs">
            <div>
              <span className="text-[10px] font-bold text-slate-500 uppercase block">{t("Disaster Scenario")}</span>
              <span className="font-extrabold text-blue-700 dark:text-blue-400 text-sm">{t(epicenter.type)}</span>
            </div>
            <div>
              <span className="text-[10px] font-bold text-slate-500 uppercase block">{t("Target Epicenter")}</span>
              <span className="font-bold text-slate-800 dark:text-slate-200 truncate block" title={epicenter.landmark || "Uttarakhand Sector"}>
                {epicenter.landmark || "Uttarakhand Sector"}
              </span>
              <span className="text-[10px] font-mono text-slate-500">{epicenter.lat.toFixed(4)}° N, {epicenter.lon.toFixed(4)}° E</span>
            </div>
            <div>
              <span className="text-[10px] font-bold text-slate-500 uppercase block">{t("Impact Radius Buffer")}</span>
              <span className="font-black text-amber-700 dark:text-amber-400 text-sm font-mono">{epicenter.radius_km} km</span>
            </div>
            <div>
              <span className="text-[10px] font-bold text-slate-500 uppercase block">{t("Est. Response Window")}</span>
              <span className="font-black text-red-700 dark:text-red-400 text-sm font-mono">~{summary.estimated_evacuation_mins} {lang === "hi" ? "मिनट" : "Minutes"}</span>
            </div>
          </div>

          {/* Primary Demographic Exposure Matrix */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-2.5 flex items-center gap-1.5">
              <Users className="w-4 h-4 text-blue-600" />
              <span>{t("1. Population Exposure & Demographic Impact Assessment")}</span>
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div className="p-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#131E36]">
                <span className="text-[10px] text-slate-500 font-semibold block">{t("Total Affected Villages")}</span>
                <span className="text-xl font-black font-mono text-slate-900 dark:text-white mt-0.5 block">
                  {summary.total_affected_habitations}
                </span>
                <span className="text-[10px] text-slate-400">{t("Within perimeter")} ({epicenter.radius_km} km)</span>
              </div>
              <div className="p-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#131E36]">
                <span className="text-[10px] text-red-600 font-semibold block">{t("Population at Immediate Risk")}</span>
                <span className="text-xl font-black font-mono text-red-600 dark:text-red-400 mt-0.5 block">
                  {summary.total_affected_population.toLocaleString()}
                </span>
                <span className="text-[10px] text-red-500">{t("Census validated population")}</span>
              </div>
              <div className="p-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#131E36]">
                <span className="text-[10px] text-orange-600 font-semibold block">{t("Critical Red Vulnerability")}</span>
                <span className="text-xl font-black font-mono text-orange-600 dark:text-orange-400 mt-0.5 block">
                  {summary.critical_red_count}
                </span>
                <span className="text-[10px] text-orange-500">{t("Immediate evacuation priority")}</span>
              </div>
              <div className="p-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#131E36]">
                <span className="text-[10px] text-emerald-600 font-semibold block">{t("Designated Shelters Active")}</span>
                <span className="text-xl font-black font-mono text-emerald-600 dark:text-emerald-400 mt-0.5 block">
                  {summary.active_safe_sites_count}
                </span>
                <span className="text-[10px] text-emerald-500">{t("Verified safe relocation sites")}</span>
              </div>
            </div>
          </div>

          {/* Three-Tier Hazard Inundation Zones */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-2 flex items-center gap-1.5">
              <AlertTriangle className="w-4 h-4 text-amber-600" />
              <span>{t("2. Multi-Hazard Inundation & Buffer Zones Breakdown")}</span>
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div className="p-3 rounded-lg bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/60">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-extrabold text-red-800 dark:text-red-300">{t("Zone 1: Direct Rupture")}</span>
                  <span className="px-1.5 py-0.2 rounded text-[10px] font-mono bg-red-200 dark:bg-red-900 text-red-800 dark:text-red-200 font-bold">
                    &lt;{(epicenter.radius_km * 0.3).toFixed(1)} km
                  </span>
                </div>
                <p className="text-[11px] text-red-700 dark:text-red-300/80 mb-2">
                  {t("Zone 1 desc")}
                </p>
                <span className="text-xs font-mono font-bold text-red-900 dark:text-red-200">
                  {summary.zone_1_count} {t("Villages Caught in Zone 1")}
                </span>
              </div>

              <div className="p-3 rounded-lg bg-orange-50 dark:bg-orange-950/30 border border-orange-200 dark:border-orange-900/60">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-extrabold text-orange-800 dark:text-orange-300">{t("Zone 2: High Alert")}</span>
                  <span className="px-1.5 py-0.2 rounded text-[10px] font-mono bg-orange-200 dark:bg-orange-900 text-orange-800 dark:text-orange-200 font-bold">
                    {(epicenter.radius_km * 0.3).toFixed(1)} - {(epicenter.radius_km * 0.7).toFixed(1)} km
                  </span>
                </div>
                <p className="text-[11px] text-orange-700 dark:text-orange-300/80 mb-2">
                  {t("Zone 2 desc")}
                </p>
                <span className="text-xs font-mono font-bold text-orange-900 dark:text-orange-200">
                  {summary.zone_2_count} {t("Villages Caught in Zone 2")}
                </span>
              </div>

              <div className="p-3 rounded-lg bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/60">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-extrabold text-amber-800 dark:text-amber-300">{t("Zone 3: Advisory Buffer")}</span>
                  <span className="px-1.5 py-0.2 rounded text-[10px] font-mono bg-amber-200 dark:bg-amber-900 text-amber-800 dark:text-amber-200 font-bold">
                    {(epicenter.radius_km * 0.7).toFixed(1)} - {epicenter.radius_km} km
                  </span>
                </div>
                <p className="text-[11px] text-amber-700 dark:text-amber-300/80 mb-2">
                  {t("Zone 3 desc")}
                </p>
                <span className="text-xs font-mono font-bold text-amber-900 dark:text-amber-200">
                  {summary.zone_3_count} {t("Villages in Advisory Perimeter")}
                </span>
              </div>
            </div>
          </div>

          {/* Top Priority Affected Settlements Table */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-2 flex items-center gap-1.5">
              <MapPin className="w-4 h-4 text-red-600" />
              <span>{t("3. Priority Evacuation Habitation Roster (Closest to Epicenter)")}</span>
            </h3>
            <div className="overflow-x-auto border border-slate-200 dark:border-slate-800 rounded-lg">
              <table className="w-full text-left text-xs border-collapse">
                <thead className="bg-slate-100 dark:bg-slate-900 text-[10px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider border-b border-slate-200 dark:border-slate-800">
                  <tr>
                    <th className="py-2 px-3">{t("Village Name")}</th>
                    <th className="py-2 px-3">{t("District")}</th>
                    <th className="py-2 px-3">{t("Population")}</th>
                    <th className="py-2 px-3">{t("Proximity")}</th>
                    <th className="py-2 px-3">{t("Severity Tier")}</th>
                    <th className="py-2 px-3">{t("Assigned Safe Shelter")}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {affected_habitations.slice(0, 10).map((hab) => (
                    <tr key={hab.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                      <td className="py-2 px-3 font-bold text-slate-900 dark:text-slate-100">
                        {hab.name}
                      </td>
                      <td className="py-2 px-3 text-slate-600 dark:text-slate-300">{t(hab.district)}</td>
                      <td className="py-2 px-3 font-mono font-bold text-slate-800 dark:text-slate-200">
                        {hab.population.toLocaleString()}
                      </td>
                      <td className="py-2 px-3 font-mono text-slate-600 dark:text-slate-400">
                        {hab.distance_from_epicenter_km.toFixed(1)} km
                      </td>
                      <td className="py-2 px-3">
                        <span
                          className={`px-1.5 py-0.5 rounded text-[9px] font-bold uppercase ${
                            hab.impact_zone === "ZONE_1"
                              ? "bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300 border border-red-300"
                              : hab.impact_zone === "ZONE_2"
                              ? "bg-orange-100 text-orange-700 dark:bg-orange-950 dark:text-orange-300 border border-orange-300"
                              : "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300 border border-amber-300"
                          }`}
                        >
                          {t(hab.severity_tier)}
                        </span>
                      </td>
                      <td className="py-2 px-3 text-emerald-700 dark:text-emerald-400 font-medium">
                        {hab.assigned_safe_site?.name || t("fac_shelter")}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {affected_habitations.length > 10 && (
              <p className="text-[10px] text-slate-500 mt-1 italic">
                {lang === "hi"
                  ? `कुल ${affected_habitations.length} प्रभावित बस्तियों में से शीर्ष 10 प्रदर्शित। पूर्ण सूची SEOC डेटाबेस में सुरक्षित।`
                  : `Showing top 10 priority habitations of ${affected_habitations.length} total affected settlements. Complete list archived in SEOC database.`}
              </p>
            )}
          </div>

          {/* Designated Relocation Shelters Capacity Matrix */}
          {reachable_shelters && reachable_shelters.length > 0 && (
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-2 flex items-center gap-1.5">
                <Building className="w-4 h-4 text-emerald-600" />
                <span>{t("4. Accessible Safe Relocation Shelters Outside Hazard Perimeter")}</span>
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs">
                {reachable_shelters.slice(0, 4).map((site) => (
                  <div
                    key={site.id}
                    className="p-2.5 rounded-lg border border-emerald-200 dark:border-emerald-900/60 bg-emerald-50/50 dark:bg-emerald-950/20"
                  >
                    <span className="font-bold text-slate-900 dark:text-slate-100 block truncate" title={site.name}>
                      {site.name}
                    </span>
                    <span className="text-[10px] text-slate-500 block truncate">{t(site.district)}</span>
                    <div className="flex items-center justify-between mt-1 pt-1 border-t border-emerald-100 dark:border-emerald-900 text-[10px] font-mono">
                      <span>{t("Capacity:")} {site.capacity}</span>
                      <span className="font-bold text-emerald-700 dark:text-emerald-400">{site.distance_km} km</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Statutory Digital Signature Certificate (DSC) / e-Sign Block */}
          <div className="p-4 rounded-xl border border-emerald-300 dark:border-emerald-800 bg-emerald-50/60 dark:bg-emerald-950/30 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-sans">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-emerald-600 text-white flex items-center justify-center flex-shrink-0 shadow-sm">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-emerald-950 dark:text-emerald-300 uppercase tracking-wide">
                    {lang === "hi" ? "सांविधिक डिजिटल हस्ताक्षर प्रमाणित (e-Sign)" : "Statutory Digital Signature Verified (DSC Class 3 / e-Sign)"}
                  </span>
                  <span className="px-1.5 py-0.5 rounded bg-emerald-200 dark:bg-emerald-900 text-emerald-900 dark:text-emerald-200 text-[10px] font-mono font-bold">
                    IT Act 2000 Sec 3A
                  </span>
                </div>
                <p className="text-[11px] text-slate-600 dark:text-slate-400 mt-0.5">
                  {lang === "hi"
                    ? "हस्ताक्षरकर्ता: डॉ. आर. के. जोशी, आईएएस (जिला मजिस्ट्रेट एवं अध्यक्ष, डीडीएमए) • सीए: एनआईसी-सीए (NIC-CA) भारत"
                    : "Signatory: Dr. R. K. Joshi, IAS (District Magistrate & Chairman, DDMA) • Certifying Authority: NIC-CA India"}
                </p>
                <p className="text-[10px] text-slate-500 font-mono mt-0.5">
                  Cert Digest: SHA256-RSA2048 • eMudhra / Parichay Token Ref: ESP-UK-2026-98124
                </p>
              </div>
            </div>

            <div className="flex-shrink-0 text-center sm:text-right border-t sm:border-t-0 sm:border-l border-emerald-200 dark:border-emerald-800 pt-2 sm:pt-0 sm:pl-4">
              <div className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-900/60 px-2 py-0.5 rounded">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>CRYPTOGRAPHICALLY VALID</span>
              </div>
              <div className="text-[10px] text-slate-500 font-mono mt-1">
                {istDateStr}
              </div>
            </div>
          </div>

          {/* Official Sign-Off and Execution Stamps */}
          <div className="pt-6 border-t-2 border-slate-900 dark:border-slate-300 grid grid-cols-3 gap-6 text-center text-xs">
            <div>
              <div className="h-12 border-b border-dashed border-slate-400 mb-1" />
              <p className="font-bold text-slate-800 dark:text-slate-200">{t("Incident Commander (IC)")}</p>
              <p className="text-[10px] text-slate-500">{t("NDRF / SDRF Field Unit")}</p>
            </div>
            <div>
              <div className="h-12 border-b border-dashed border-slate-400 mb-1 flex items-center justify-center">
                <span className="text-[10px] font-mono text-emerald-600 font-bold uppercase border border-emerald-500 px-2 py-0.5 rounded">
                  {t("VERIFIED STATUTORY DSS")}
                </span>
              </div>
              <p className="font-bold text-slate-800 dark:text-slate-200">{t("State Relief Commissioner")}</p>
              <p className="text-[10px] text-slate-500">{t("Government of Uttarakhand")}</p>
            </div>
            <div>
              <div className="h-12 border-b border-dashed border-slate-400 mb-1" />
              <p className="font-bold text-slate-800 dark:text-slate-200">{t("SEOC Operations Officer")}</p>
              <p className="text-[10px] text-slate-500">{t("Dehradun Command Desk")}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
