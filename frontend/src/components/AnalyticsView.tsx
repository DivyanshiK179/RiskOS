import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  BarChart3,
  RefreshCw,
  Download,
  AlertTriangle,
  ShieldCheck,
  Building2,
  TrendingUp,
  MapPin,
  ArrowRight,
  PlusCircle,
  Clock,
  Layers,
  Filter,
} from "lucide-react";
import { getAnalyticsOverview, type AnalyticsOverviewData } from "../api/stats";
import { useTranslation } from "../i18n/translations";

interface AnalyticsViewProps {
  onInitiatePlan?: () => void;
  onViewPlans?: () => void;
  onSelectDistrict?: (district: string) => void;
}

export default function AnalyticsView({
  onInitiatePlan,
  onViewPlans,
  onSelectDistrict,
}: AnalyticsViewProps) {
  const { lang } = useTranslation();
  const isHi = lang === "hi";
  const queryClient = useQueryClient();

  const [selectedDistrict, setSelectedDistrict] = useState<string>("All Uttarakhand");
  const [hoveredTier, setHoveredTier] = useState<string | null>(null);

  const {
    data: analytics,
    isLoading,
    isFetching,
    error,
    refetch,
  } = useQuery<AnalyticsOverviewData>({
    queryKey: ["analytics-overview", selectedDistrict],
    queryFn: () => getAnalyticsOverview(selectedDistrict),
    staleTime: 30000,
    refetchOnWindowFocus: false,
  });

  const handleDistrictChange = (d: string) => {
    setSelectedDistrict(d);
    if (onSelectDistrict && d !== "All Uttarakhand") {
      onSelectDistrict(d);
    }
  };

  const handleRefresh = async () => {
    await queryClient.invalidateQueries({ queryKey: ["analytics-overview"] });
    refetch();
  };

  const handleExportCSV = () => {
    if (!analytics) return;

    const rows: string[][] = [
      ["UTTARAKHAND STATE DISASTER MANAGEMENT AUTHORITY (USDMA)"],
      ["STATUTORY MULTI-HAZARD VULNERABILITY & RELOCATION AUDIT MATRIX"],
      [`Generated At: ${new Date().toISOString()}`],
      [`Scope: ${selectedDistrict}`],
      [""],
      ["--- OPERATIONAL KEY PERFORMANCE METRICS ---"],
      ["Total Settlements", String(analytics.metrics.total_settlements)],
      ["Population at Risk (Red + High)", String(analytics.metrics.population_at_risk)],
      ["Total State Population Surveyed", String(analytics.metrics.total_population)],
      ["Total Shelter Capacity", String(analytics.metrics.total_shelter_capacity)],
      ["Shelter Occupancy Rate", `${analytics.metrics.occupancy_rate}%`],
      ["Verified Safe Transit Sites", String(analytics.metrics.total_safe_sites)],
      ["Total Relocation Plans", String(analytics.metrics.total_plans)],
      ["Approved Relocation Plans", String(analytics.metrics.approved_plans)],
      ["Pending Relocation Plans", String(analytics.metrics.pending_plans)],
      [""],
      ["--- HAZARD RISK TIER BREAKDOWN ---"],
      ["Risk Tier", "Settlement Count", "Percentage", "Population Impacted"],
      ["Red Zone (Critical)", String(analytics.risk_distribution.red_count), `${analytics.risk_distribution.red_pct}%`, String(analytics.risk_distribution.red_population)],
      ["High Risk", String(analytics.risk_distribution.high_count), `${analytics.risk_distribution.high_pct}%`, String(analytics.risk_distribution.high_population)],
      ["Moderate Risk", String(analytics.risk_distribution.mod_count), `${analytics.risk_distribution.mod_pct}%`, String(analytics.risk_distribution.mod_population)],
      ["Safe / Low Risk", String(analytics.risk_distribution.safe_count), `${analytics.risk_distribution.safe_pct}%`, String(analytics.risk_distribution.safe_population)],
      [""],
      ["--- DISTRICT-WISE MULTI-HAZARD EXPOSURE MATRIX ---"],
      ["District", "Total Habitations", "High Risk Count", "Population at Risk", "Total Population", "Shelter Capacity", "Shelter Coverage Ratio", "Vulnerability Index (0-100)"],
    ];

    analytics.district_comparisons.forEach((dc) => {
      rows.push([
        dc.district,
        String(dc.total_habitations),
        String(dc.high_risk_count),
        String(dc.population_at_risk),
        String(dc.total_population),
        String(dc.shelter_capacity),
        `${dc.capacity_coverage_pct}%`,
        String(dc.vulnerability_index),
      ]);
    });

    const csvContent = "data:text/csv;charset=utf-8,\uFEFF" + rows.map((e) => e.join(",")).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `RiskOS_District_Vulnerability_Matrix_${selectedDistrict.replace(/\s+/g, "_")}_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const formatPop = (n?: number) => {
    if (!n && n !== 0) return "--";
    if (n >= 10000000) return `${(n / 10000000).toFixed(2)} Cr`;
    if (n >= 100000) return `${(n / 100000).toFixed(1)} L`;
    if (n >= 1000) return `${(n / 1000).toFixed(1)}k`;
    return n.toLocaleString();
  };

  return (
    <div className="space-y-6">
      {/* ━━━ HEADER & TELEMETRY TOOLBAR ━━━ */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white/70 dark:bg-slate-900/80 backdrop-blur-md p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="p-1.5 rounded-lg bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-400">
              <BarChart3 className="w-5 h-5" />
            </span>
            <h1 className="text-base sm:text-lg font-bold text-slate-900 dark:text-slate-100">
              {isHi ? "आपदा परिचालन विश्लेषण एवं सांख्यिकी" : "Disaster Operational Analytics & Telemetry"}
            </h1>
            <span className="px-2 py-0.5 rounded text-[10px] font-bold tracking-wider uppercase bg-emerald-100 dark:bg-emerald-950/70 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800/80">
              {isHi ? "लाइव पोस्टग्रेएसक्यूएल" : "Live PostgreSQL DSS"}
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {isHi
              ? "उत्तराखंड के 13 जनपदों के बहु-आपदा जोखिम, सुरक्षित आश्रय क्षमता एवं पुनर्वास पाइपलाइन का आधिकारिक विवरण"
              : "State-wide multi-hazard exposure metrics, safe shelter capacity matching, and evacuation pipeline under DMA 2005"}
          </p>
        </div>

        {/* Toolbar Controls */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* District Selector */}
          <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800/90 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={selectedDistrict}
              onChange={(e) => handleDistrictChange(e.target.value)}
              className="bg-transparent text-xs font-semibold text-slate-800 dark:text-slate-200 focus:outline-none cursor-pointer pr-1"
            >
              {(analytics?.districts || ["All Uttarakhand"]).map((d) => (
                <option key={d} value={d} className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100">
                  {d === "All Uttarakhand" ? (isHi ? "समस्त उत्तराखंड (13 जनपद)" : "All Uttarakhand (13 Districts)") : d}
                </option>
              ))}
            </select>
          </div>

          {/* Refresh Telemetry */}
          <button
            onClick={handleRefresh}
            disabled={isFetching}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 transition"
            title="Refresh database aggregations"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isFetching ? "animate-spin text-blue-500" : ""}`} />
            <span>{isHi ? "ताज़ा करें" : "Sync Telemetry"}</span>
          </button>

          {/* Export Report CSV */}
          <button
            onClick={handleExportCSV}
            disabled={!analytics}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-[#0B2545] hover:bg-blue-900 dark:bg-blue-600 dark:hover:bg-blue-700 text-white shadow-sm transition disabled:opacity-50"
          >
            <Download className="w-3.5 h-3.5" />
            <span>{isHi ? "रिपोर्ट डाउनलोड (CSV)" : "Export Report (CSV)"}</span>
          </button>
        </div>
      </div>

      {/* Loading or Error State */}
      {isLoading && (
        <div className="p-12 text-center card">
          <div className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-xs font-semibold text-slate-600 dark:text-slate-400">
            {isHi ? "डेटाबेस से वास्तविक सांख्यिकी संकलित की जा रही है..." : "Executing PostgreSQL aggregations across 13,967 habitations..."}
          </p>
        </div>
      )}

      {error && (
        <div className="p-4 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 rounded-xl text-xs text-red-700 dark:text-red-400 flex items-center justify-between">
          <span>{isHi ? "एनालिटिक्स डेटा लोड करने में त्रुटि आई।" : "Unable to load telemetry metrics. Please ensure backend server is reachable."}</span>
          <button onClick={handleRefresh} className="font-bold underline ml-2">Retry</button>
        </div>
      )}

      {analytics && (
        <>
          {/* ━━━ TOP KPI METRIC STAT CARDS ━━━ */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* 1. Total Settlements */}
            <div className="card p-4 relative overflow-hidden group">
              <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
                <span className="text-xs font-semibold uppercase tracking-wider">
                  {isHi ? "कुल बस्तियां / आबादियां" : "Total Settlements"}
                </span>
                <Building2 className="w-4 h-4 text-blue-500" />
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl lg:text-3xl font-extrabold text-slate-900 dark:text-slate-100 font-mono">
                  {analytics.metrics.total_settlements.toLocaleString()}
                </span>
              </div>
              <div className="mt-2 text-[11px] text-slate-500 dark:text-slate-400 flex items-center justify-between">
                <span>{selectedDistrict === "All Uttarakhand" ? (isHi ? "13 जनपदों में" : "All 13 districts") : selectedDistrict}</span>
                <span className="font-mono text-blue-600 dark:text-blue-400 font-semibold">100% Surveyed</span>
              </div>
              <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/5 rounded-full blur-2xl pointer-events-none group-hover:bg-blue-500/10 transition" />
            </div>

            {/* 2. Population at Risk */}
            <div className="card p-4 relative overflow-hidden group border-red-200/50 dark:border-red-900/30">
              <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
                <span className="text-xs font-semibold uppercase tracking-wider text-red-700 dark:text-red-400">
                  {isHi ? "जोखिम में जनसंख्या" : "Population at Risk"}
                </span>
                <AlertTriangle className="w-4 h-4 text-red-500" />
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl lg:text-3xl font-extrabold text-red-600 dark:text-red-400 font-mono">
                  {formatPop(analytics.metrics.population_at_risk)}
                </span>
                <span className="text-xs text-slate-500 font-mono">
                  ({analytics.metrics.population_at_risk.toLocaleString()})
                </span>
              </div>
              <div className="mt-2 text-[11px] text-slate-500 dark:text-slate-400 flex items-center justify-between">
                <span className="px-1.5 py-0.5 rounded bg-red-100 dark:bg-red-950/60 text-red-700 dark:text-red-300 font-semibold text-[10px]">
                  {isHi ? "रेड एवं हाई रिस्क जोन" : "Red & High Risk Zones"}
                </span>
                <span className="font-mono text-slate-400 text-[10px]">
                  {analytics.metrics.total_population > 0
                    ? `${((analytics.metrics.population_at_risk / analytics.metrics.total_population) * 100).toFixed(1)}% of total`
                    : "--"}
                </span>
              </div>
              <div className="absolute top-0 right-0 w-24 h-24 bg-red-500/5 rounded-full blur-2xl pointer-events-none group-hover:bg-red-500/10 transition" />
            </div>

            {/* 3. Shelter Capacity */}
            <div className="card p-4 relative overflow-hidden group border-emerald-200/50 dark:border-emerald-900/30">
              <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
                <span className="text-xs font-semibold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
                  {isHi ? "सुरक्षित आश्रय क्षमता" : "Shelter Capacity"}
                </span>
                <ShieldCheck className="w-4 h-4 text-emerald-500" />
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl lg:text-3xl font-extrabold text-emerald-600 dark:text-emerald-400 font-mono">
                  {formatPop(analytics.metrics.total_shelter_capacity)}
                </span>
                <span className="text-xs text-slate-500 font-mono">
                  ({analytics.metrics.total_safe_sites} {isHi ? "स्थल" : "sites"})
                </span>
              </div>
              <div className="mt-2 text-[11px] text-slate-500 dark:text-slate-400 flex items-center justify-between">
                <span className="px-1.5 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 font-semibold text-[10px]">
                  {analytics.metrics.occupancy_rate}% {isHi ? "अधिकृत" : "occupied"}
                </span>
                <span className="font-mono text-slate-500 text-[10px]">
                  {formatPop(analytics.metrics.remaining_shelter_capacity)} {isHi ? "उपलब्ध" : "available"}
                </span>
              </div>
              <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 rounded-full blur-2xl pointer-events-none group-hover:bg-emerald-500/10 transition" />
            </div>

            {/* 4. Relocation Plans */}
            <div className="card p-4 relative overflow-hidden group">
              <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
                <span className="text-xs font-semibold uppercase tracking-wider">
                  {isHi ? "पुनर्वास कार्ययोजनाएं" : "Relocation Pipeline"}
                </span>
                <TrendingUp className="w-4 h-4 text-amber-500" />
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl lg:text-3xl font-extrabold text-slate-900 dark:text-slate-100 font-mono">
                  {analytics.metrics.total_plans}
                </span>
                <span className="text-xs text-slate-500">
                  {isHi ? "योजनाएं पंजीकृत" : "active orders"}
                </span>
              </div>
              <div className="mt-2 text-[11px] text-slate-500 dark:text-slate-400 flex items-center justify-between">
                <span className="text-emerald-600 dark:text-emerald-400 font-bold">
                  {analytics.metrics.approved_plans} {isHi ? "स्वीकृत" : "approved"}
                </span>
                <span className="text-amber-600 dark:text-amber-400 font-bold">
                  {analytics.metrics.pending_plans} {isHi ? "लंबित" : "pending"}
                </span>
              </div>
              <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/5 rounded-full blur-2xl pointer-events-none group-hover:bg-amber-500/10 transition" />
            </div>
          </div>

          {/* ━━━ ROW 2: SETTLEMENT DISTRIBUTION BY RISK & RELOCATION PIPELINE ━━━ */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* SECTION A: Real Horizontal Distribution Bars */}
            <div className="card p-5 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200">
                    {isHi ? "जोखिम स्तर के अनुसार बस्ती वितरण" : "Settlement Distribution by Risk"}
                  </h3>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                    {isHi ? "जीएसआई / वाडिया संस्थान के वैज्ञानिक मानकों पर आधारित" : "Classified under NDMA Multi-Hazard Susceptibility Index"}
                  </p>
                </div>
                <span className="text-xs font-mono font-bold text-slate-500">
                  N = {analytics.metrics.total_settlements.toLocaleString()}
                </span>
              </div>

              {/* Interactive Bars */}
              <div className="space-y-3.5 pt-1">
                {[
                  {
                    key: "RED",
                    label: isHi ? "रेड जोन (अत्यंत संकटग्रस्त)" : "Red Zone (Critical)",
                    count: analytics.risk_distribution.red_count,
                    pct: analytics.risk_distribution.red_pct,
                    pop: analytics.risk_distribution.red_population,
                    barColor: "bg-red-600",
                    dotColor: "bg-red-600",
                    badgeColor: "text-red-700 dark:text-red-400 bg-red-100 dark:bg-red-950/60",
                  },
                  {
                    key: "HIGH",
                    label: isHi ? "उच्च जोखिम (हाई अलर्ट)" : "High Risk",
                    count: analytics.risk_distribution.high_count,
                    pct: analytics.risk_distribution.high_pct,
                    pop: analytics.risk_distribution.high_population,
                    barColor: "bg-orange-600",
                    dotColor: "bg-orange-500",
                    badgeColor: "text-orange-700 dark:text-orange-400 bg-orange-100 dark:bg-orange-950/60",
                  },
                  {
                    key: "MODERATE",
                    label: isHi ? "मध्यम जोखिम (सतर्कता)" : "Moderate Risk",
                    count: analytics.risk_distribution.mod_count,
                    pct: analytics.risk_distribution.mod_pct,
                    pop: analytics.risk_distribution.mod_population,
                    barColor: "bg-amber-500",
                    dotColor: "bg-amber-400",
                    badgeColor: "text-amber-700 dark:text-amber-400 bg-amber-100 dark:bg-amber-950/60",
                  },
                  {
                    key: "SAFE",
                    label: isHi ? "सुरक्षित / निम्न जोखिम" : "Safe / Low Risk",
                    count: analytics.risk_distribution.safe_count,
                    pct: analytics.risk_distribution.safe_pct,
                    pop: analytics.risk_distribution.safe_population,
                    barColor: "bg-emerald-600",
                    dotColor: "bg-emerald-500",
                    badgeColor: "text-emerald-700 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-950/60",
                  },
                ].map((tier) => (
                  <div
                    key={tier.key}
                    onMouseEnter={() => setHoveredTier(tier.key)}
                    onMouseLeave={() => setHoveredTier(null)}
                    className="p-2 rounded-xl transition hover:bg-slate-50 dark:hover:bg-slate-800/40"
                  >
                    <div className="flex items-center justify-between mb-1.5 text-xs">
                      <div className="flex items-center gap-2">
                        <span className={`w-2.5 h-2.5 rounded-full ${tier.dotColor}`} />
                        <span className="font-semibold text-slate-800 dark:text-slate-200">
                          {tier.label}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 font-mono">
                        <span className="font-bold text-slate-900 dark:text-slate-100">
                          {tier.count.toLocaleString()}
                        </span>
                        <span className="text-slate-500 text-[11px]">
                          ({tier.pct}%)
                        </span>
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="h-2.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden p-0.5">
                      <div
                        className={`h-full ${tier.barColor} rounded-full transition-all duration-500`}
                        style={{ width: `${Math.max(tier.pct, 0.8)}%` }}
                      />
                    </div>

                    {/* Impact Population Tooltip Strip */}
                    <div className="mt-1 flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
                      <span>
                        {isHi ? "प्रभावित जनसंख्या:" : "Exposed Population:"}{" "}
                        <strong className="text-slate-700 dark:text-slate-300 font-mono">
                          {tier.pop.toLocaleString()}
                        </strong>
                      </span>
                      {hoveredTier === tier.key && (
                        <span className="text-[10px] font-semibold text-blue-600 dark:text-blue-400 animate-fade-in">
                          {isHi ? "सक्रिय निगरानी" : "Active Telemetry Priority"}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Summary note */}
              <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-800 text-[11px] text-slate-600 dark:text-slate-400 flex items-center justify-between">
                <span>
                  {isHi ? "तत्काल पुनर्वास हेतु चिन्हित बस्तियां:" : "Combined High Exposure Priority:"}{" "}
                  <strong className="text-red-600 dark:text-red-400 font-mono">
                    {(analytics.risk_distribution.red_count + analytics.risk_distribution.high_count).toLocaleString()}
                  </strong>
                </span>
                <span className="font-mono text-slate-500">
                  {((analytics.risk_distribution.red_pct + analytics.risk_distribution.high_pct)).toFixed(1)}% of state
                </span>
              </div>
            </div>

            {/* SECTION B: Relocation Plan Pipeline */}
            <div className="card p-5 space-y-4 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200">
                      {isHi ? "पुनर्वास योजना पाइपलाइन एवं प्रगति" : "Relocation Action Plan Pipeline"}
                    </h3>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                      {isHi ? "जिला मजिस्ट्रेट एवं एसडीआरएफ कमान के अंतर्गत चरणबद्ध क्रियान्वयन" : "Statutory chain-of-custody tracking under District Magistrate"}
                    </p>
                  </div>
                  {onInitiatePlan && (
                    <button
                      onClick={onInitiatePlan}
                      className="flex items-center gap-1 text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline"
                    >
                      <PlusCircle className="w-3.5 h-3.5" />
                      <span>{isHi ? "+ नई योजना" : "+ New Plan"}</span>
                    </button>
                  )}
                </div>

                {/* Status Pipeline Funnel */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-4">
                  {[
                    {
                      status: "PROPOSED",
                      label: isHi ? "प्रस्तावित (ड्राफ्ट)" : "Draft / Proposed",
                      count: analytics.relocation_pipeline.by_status.PROPOSED.count,
                      pop: analytics.relocation_pipeline.by_status.PROPOSED.population,
                      color: "border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300",
                    },
                    {
                      status: "APPROVED",
                      label: isHi ? "डीएम अनुमोदित" : "DM Approved",
                      count: analytics.relocation_pipeline.by_status.APPROVED.count,
                      pop: analytics.relocation_pipeline.by_status.APPROVED.population,
                      color: "border-emerald-300 dark:border-emerald-800/80 text-emerald-700 dark:text-emerald-400 bg-emerald-50/50 dark:bg-emerald-950/20",
                    },
                    {
                      status: "IN_PROGRESS",
                      label: isHi ? "प्रक्रियाधीन" : "Transit Active",
                      count: analytics.relocation_pipeline.by_status.IN_PROGRESS.count,
                      pop: analytics.relocation_pipeline.by_status.IN_PROGRESS.population,
                      color: "border-amber-300 dark:border-amber-800/80 text-amber-700 dark:text-amber-400 bg-amber-50/50 dark:bg-amber-950/20",
                    },
                    {
                      status: "COMPLETED",
                      label: isHi ? "सम्पन्न" : "Completed",
                      count: analytics.relocation_pipeline.by_status.COMPLETED.count,
                      pop: analytics.relocation_pipeline.by_status.COMPLETED.population,
                      color: "border-blue-300 dark:border-blue-800/80 text-blue-700 dark:text-blue-400 bg-blue-50/50 dark:bg-blue-950/20",
                    },
                  ].map((stage) => (
                    <div key={stage.status} className={`p-2.5 rounded-xl border ${stage.color} text-center`}>
                      <span className="text-[10px] uppercase font-bold block truncate">
                        {stage.label}
                      </span>
                      <span className="text-lg font-bold font-mono block mt-0.5">
                        {stage.count}
                      </span>
                      <span className="text-[10px] text-slate-500 font-mono">
                        {formatPop(stage.pop)} {isHi ? "नागरिक" : "people"}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Recent Plan Orders List or Empty State */}
                {analytics.relocation_pipeline.recent_plans.length === 0 ? (
                  <div className="py-8 text-center space-y-3 bg-slate-50 dark:bg-slate-900/40 rounded-xl border border-dashed border-slate-300 dark:border-slate-800 p-6">
                    <Building2 className="w-8 h-8 text-slate-400 mx-auto" />
                    <div className="space-y-1">
                      <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300">
                        {isHi ? "वर्तमान में कोई सक्रिय पुनर्वास योजना नहीं है" : "No Active Relocation Plans Created Yet"}
                      </h4>
                      <p className="text-[11px] text-slate-500 max-w-sm mx-auto">
                        {isHi
                          ? "रेड जोन अथवा हाई रिस्क बस्तियों के लिए तत्काल सुरक्षित स्थल आवंटन एवं आदेश जारी करें।"
                          : "Initiate verified safe transit allocations for high risk habitations under DM Executive Clearance."}
                      </p>
                    </div>
                    {onInitiatePlan && (
                      <button
                        onClick={onInitiatePlan}
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-700 hover:bg-blue-800 text-white font-bold text-xs shadow-md transition"
                      >
                        <PlusCircle className="w-4 h-4" />
                        <span>{isHi ? "+ नई पुनर्वास योजना बनाएं" : "+ Initiate New Relocation Plan"}</span>
                      </button>
                    )}
                  </div>
                ) : (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-[11px] font-bold text-slate-500 uppercase tracking-wider px-1">
                      <span>{isHi ? "हालिया पुनर्वास आदेश" : "Recent Evacuation Orders"}</span>
                      {onViewPlans && (
                        <button onClick={onViewPlans} className="text-blue-600 dark:text-blue-400 hover:underline">
                          {isHi ? "सभी देखें →" : "View All Plans →"}
                        </button>
                      )}
                    </div>
                    {analytics.relocation_pipeline.recent_plans.slice(0, 3).map((plan) => (
                      <div
                        key={plan.id}
                        className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 flex items-center justify-between gap-3 text-xs"
                      >
                        <div className="space-y-0.5 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-slate-900 dark:text-slate-100 truncate">
                              {plan.habitation_name}
                            </span>
                            <span className="text-[10px] text-slate-400 font-mono">
                              ({plan.district})
                            </span>
                            <span
                              className={`px-1.5 py-0.2 rounded text-[9px] font-bold tracking-wider ${
                                plan.status === "APPROVED"
                                  ? "bg-emerald-100 dark:bg-emerald-950/70 text-emerald-800 dark:text-emerald-300"
                                  : plan.status === "IN_PROGRESS"
                                  ? "bg-amber-100 dark:bg-amber-950/70 text-amber-800 dark:text-amber-300"
                                  : "bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300"
                              }`}
                            >
                              {plan.status}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 text-[11px] text-slate-500 dark:text-slate-400 truncate">
                            <span>➔ {plan.safe_site_name}</span>
                            <span>•</span>
                            <span className="font-mono font-semibold text-slate-700 dark:text-slate-300">
                              {plan.population_to_relocate.toLocaleString()} {isHi ? "व्यक्ति" : "citizens"}
                            </span>
                          </div>
                        </div>

                        {onViewPlans && (
                          <button
                            onClick={onViewPlans}
                            className="px-2.5 py-1.5 rounded-lg bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-blue-700 dark:text-blue-400 border border-slate-200 dark:border-slate-700 font-bold text-[11px] flex items-center gap-1 shrink-0 transition"
                          >
                            <span>{isHi ? "आदेश देखें" : "View Plan"}</span>
                            <ArrowRight className="w-3 h-3" />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Developer system console link */}
              <div className="pt-2 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-500">
                <span className="flex items-center gap-1.5">
                  <Clock className="w-3 h-3" />
                  <span>{isHi ? "अंतिम सिंक:" : "Sync Timestamp:"} {new Date(analytics.timestamp).toLocaleTimeString()}</span>
                </span>
                <span className="font-mono text-[10px] text-slate-400">DMA-2005-SEC-30</span>
              </div>
            </div>
          </div>

          {/* ━━━ ROW 3: DISTRICT VULNERABILITY INDEX MATRIX & MULTI-HAZARD CORRELATION ━━━ */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* DISTRICT VULNERABILITY MATRIX (2 COLUMNS SPAN) */}
            <div className="lg:col-span-2 card p-5 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200">
                    {isHi ? "जनपदवार बहु-आपदा संवेदनशीलता तुलना" : "District Vulnerability Index & Capacity Ratio"}
                  </h3>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                    {isHi ? "जनसंख्या जोखिम एवं सुरक्षित आश्रय कवरेज अनुपात (जनपद पर क्लिक करके विवरण देखें)" : "Comparison sorted by population at risk • Click row to filter telemetry"}
                  </p>
                </div>
                <span className="text-[10px] font-mono font-bold text-slate-400">
                  {analytics.district_comparisons.length} Districts Surveyed
                </span>
              </div>

              {/* Table / Matrix */}
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs min-w-[620px]">
                  <thead>
                    <tr className="border-b border-slate-200 dark:border-slate-800 text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                      <th className="py-2.5 px-3">District</th>
                      <th className="py-2.5 px-2 text-right">Settlements</th>
                      <th className="py-2.5 px-2 text-right">High Risk</th>
                      <th className="py-2.5 px-3 text-right">Pop. at Risk</th>
                      <th className="py-2.5 px-3 text-right">Shelter Cap.</th>
                      <th className="py-2.5 px-3 text-right">Coverage %</th>
                      <th className="py-2.5 px-3 text-center">Index (0-100)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-sans">
                    {analytics.district_comparisons.map((item) => {
                      const isRowSelected = selectedDistrict === item.district;
                      return (
                        <tr
                          key={item.district}
                          onClick={() => handleDistrictChange(item.district)}
                          className={`cursor-pointer transition hover:bg-blue-50/60 dark:hover:bg-slate-800/80 ${
                            isRowSelected
                              ? "bg-blue-50 dark:bg-blue-950/40 font-semibold"
                              : ""
                          }`}
                        >
                          <td className="py-2.5 px-3 font-medium text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                            <MapPin className={`w-3.5 h-3.5 ${isRowSelected ? "text-blue-600 dark:text-blue-400" : "text-slate-400"}`} />
                            <span>{item.district}</span>
                            {isRowSelected && (
                              <span className="px-1.5 py-0.2 rounded text-[9px] bg-blue-600 text-white font-bold ml-1">
                                ACTIVE
                              </span>
                            )}
                          </td>
                          <td className="py-2.5 px-2 text-right font-mono text-slate-600 dark:text-slate-400">
                            {item.total_habitations.toLocaleString()}
                          </td>
                          <td className="py-2.5 px-2 text-right font-mono font-bold text-red-600 dark:text-red-400">
                            {item.high_risk_count.toLocaleString()}
                          </td>
                          <td className="py-2.5 px-3 text-right font-mono font-semibold text-slate-900 dark:text-slate-100">
                            {item.population_at_risk.toLocaleString()}
                          </td>
                          <td className="py-2.5 px-3 text-right font-mono text-emerald-600 dark:text-emerald-400 font-semibold">
                            {item.shelter_capacity.toLocaleString()}
                          </td>
                          <td className="py-2.5 px-3 text-right font-mono">
                            <span
                              className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                                item.capacity_coverage_pct >= 50
                                  ? "bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300"
                                  : item.capacity_coverage_pct >= 20
                                  ? "bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300"
                                  : "bg-red-100 dark:bg-red-950/60 text-red-700 dark:text-red-300"
                              }`}
                            >
                              {item.capacity_coverage_pct}%
                            </span>
                          </td>
                          <td className="py-2.5 px-3 text-center">
                            <div className="flex items-center justify-center gap-1.5">
                              <div className="w-12 h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                                <div
                                  className={`h-full rounded-full ${
                                    item.vulnerability_index >= 70
                                      ? "bg-red-600"
                                      : item.vulnerability_index >= 40
                                      ? "bg-amber-500"
                                      : "bg-emerald-500"
                                  }`}
                                  style={{ width: `${item.vulnerability_index}%` }}
                                />
                              </div>
                              <span className="font-mono text-[10px] text-slate-500 w-6">
                                {item.vulnerability_index}
                              </span>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* MULTI-HAZARD TRIGGER CORRELATION (1 COLUMN SPAN) */}
            <div className="card p-5 space-y-4 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200">
                    {isHi ? "प्राथमिक आपदा प्रेरक कारक" : "Multi-Hazard Trigger Correlation"}
                  </h3>
                  <Layers className="w-4 h-4 text-purple-500" />
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mb-4">
                  {isHi
                    ? "जीएसआई ढलान, भूकंपीय फॉल्ट एवं जलमग्न गलियारों का आनुपातिक सहसंबंध"
                    : "Primary trigger distribution across vulnerable habitation clusters"}
                </p>

                {/* Stacked Distribution Visualization */}
                <div className="h-4 rounded-xl overflow-hidden flex p-0.5 bg-slate-100 dark:bg-slate-800 mb-4">
                  {analytics.hazard_triggers.map((trigger) => (
                    <div
                      key={trigger.id}
                      style={{
                        width: `${Math.max(trigger.pct, 4)}%`,
                        backgroundColor: trigger.color,
                      }}
                      title={`${trigger.label}: ${trigger.pct}%`}
                      className="h-full first:rounded-l-lg last:rounded-r-lg transition-all"
                    />
                  ))}
                </div>

                {/* Trigger Cards */}
                <div className="space-y-3">
                  {analytics.hazard_triggers.map((trigger) => (
                    <div
                      key={trigger.id}
                      className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 space-y-1.5"
                    >
                      <div className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2">
                          <span
                            className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                            style={{ backgroundColor: trigger.color }}
                          />
                          <span className="font-bold text-slate-800 dark:text-slate-200">
                            {isHi ? trigger.label_hi : trigger.label}
                          </span>
                        </div>
                        <span className="font-mono font-bold text-slate-900 dark:text-slate-100">
                          {trigger.pct}%
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 font-mono">
                        <span>{trigger.count.toLocaleString()} habitations affected</span>
                        <span className="text-[10px] text-slate-400">GSI / WIHG Data</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Statutory Note */}
              <div className="p-3 bg-purple-50/50 dark:bg-purple-950/20 border border-purple-200 dark:border-purple-900/40 rounded-xl text-[10px] text-purple-900 dark:text-purple-300">
                <span>
                  {isHi
                    ? "सिफारिश: फॉल्ट लाइन एवं नदी तट से 2.5 किमी के भीतर स्थित बस्तियों को मानसून पूर्व निकासी प्राथमिकता दें।"
                    : "Statutory Guidance: Prioritize habitations within 2.5km of active riverbeds in Seismic Zone V for pre-monsoon staging."}
                </span>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
