import { Link, useNavigate } from "react-router-dom";
import { Mountain, Waves, Building2, Activity, ChevronRight, ArrowRight } from "lucide-react";
import GoiTopBar from "../components/GoiTopBar";
import GoiBrandHeader from "../components/GoiBrandHeader";
import GoiFooter from "../components/GoiFooter";
import { useTranslation } from "../i18n/translations";
import { useUIStore } from "../store/uiStore";

export default function PillarsPage() {
  const { lang } = useTranslation();
  const isHi = lang === "hi";
  const navigate = useNavigate();
  const { setDashboardPreconfig, setIsTargetToolActive } = useUIStore();

  const handlePillarClick = (pillar: "landslide" | "flood" | "shelters" | "simulation") => {
    if (pillar === "landslide") {
      setDashboardPreconfig({
        tab: "risk-map",
        hazardFilter: "HIGH",
        showLandslide: true,
      });
      navigate("/dashboard?tab=risk-map&hazard=HIGH&riskLevel=HIGH&layer=landslide&landslide=true");
    } else if (pillar === "flood") {
      setDashboardPreconfig({
        tab: "risk-map",
        showFlood: true,
        focusedLocation: { lat: 30.284, lon: 78.981 },
      });
      navigate("/dashboard?tab=risk-map&layer=flood&floodInundation=true&valley=true");
    } else if (pillar === "shelters") {
      setDashboardPreconfig({
        tab: "safe-sites",
        facility: "shelter",
      });
      navigate("/dashboard?tab=safe-sites&facility=shelter");
    } else if (pillar === "simulation") {
      setIsTargetToolActive(true);
      setDashboardPreconfig({
        tab: "simulation",
      });
      navigate("/dashboard?tab=simulation&target=true");
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#070D18] text-slate-100 font-sans transition-colors selection:bg-[#0B2545] selection:text-white">
      <GoiTopBar />
      <GoiBrandHeader showNav activeNav="pillars" />

      {/* Breadcrumb Navigation Strip */}
      <div className="w-full bg-slate-900/80 border-b border-slate-800 py-2.5 px-4 sm:px-6 lg:px-12 text-xs">
        <div className="max-w-7xl mx-auto flex items-center gap-2 text-slate-400">
          <Link to="/" className="hover:text-blue-400 font-medium">
            {isHi ? "मुखपृष्ठ" : "Home"}
          </Link>
          <ChevronRight className="w-3.5 h-3.5 text-slate-500" />
          <span className="text-white font-bold">
            {isHi ? "चार वैज्ञानिक स्तंभ" : "Four Core Scientific Pillars"}
          </span>
        </div>
      </div>

      {/* Hero Banner Section */}
      <section className="bg-gradient-to-br from-[#0B2545] via-[#103058] to-[#081930] text-white py-12 px-4 sm:px-6 lg:px-12 border-b border-slate-800">
        <div className="max-w-7xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 text-xs font-bold border border-blue-500/30">
            <Activity className="w-3.5 h-3.5" />
            <span>{isHi ? "वैज्ञानिक एवं भू-स्थानिक वास्तुकला" : "Scientific & Geospatial DSS Architecture"}</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-black font-serif tracking-tight text-white">
            {isHi ? "आपदा जोखिम न्यूनीकरण के चार वैज्ञानिक स्तंभ" : "Four Core Scientific Pillars for Disaster Governance"}
          </h1>
          <p className="text-slate-300 text-sm sm:text-base max-w-3xl leading-relaxed">
            {isHi
              ? "भारतीय भूवैज्ञानिक सर्वेक्षण (GSI), भारतीय मौसम विभाग (IMD), राष्ट्रीय सुदूर संवेदन केंद्र (NRSC) तथा जनगणना 2026 के आंकड़ों पर आधारित चार प्रमुख कार्यात्मक मॉड्यूल।"
              : "Engineered under NDMA guidelines to deliver actionable early warnings, multi-hazard exposure computations, and automated safe evacuation routing across Uttarakhand's 13,967 habitations."}
          </p>
        </div>
      </section>

      {/* Main Content Body */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-12 py-10 space-y-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Pillar 1: Landslide Vulnerability Mapping */}
          <div className="p-8 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-sm flex flex-col justify-between hover:border-red-500 transition-all">
            <div className="space-y-4">
              <div className="w-14 h-14 rounded-2xl bg-red-100 dark:bg-red-950/80 text-red-600 dark:text-red-400 flex items-center justify-center font-bold">
                <Mountain className="w-7 h-7" />
              </div>
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-red-600 dark:text-red-400 block mb-1">
                  Pillar 01 • Slope & Corridors
                </span>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                  {isHi ? "भूस्खलन संवेदनशीलता मानचित्रण" : "Landslide Vulnerability Mapping"}
                </h3>
              </div>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                {isHi
                  ? "जीएसआई डेटा आधारित ढलान स्थिरता, भ्रंश रेखाओं (Fault Lines) तथा वर्षा विसंगतियों का सब-मीटर स्तर पर एकीकरण। जोशीमठ, केदारनाथ एवं अलकनंदा घाटी के उच्च जोखिम क्षेत्रों का स्वतः सीमांकन।"
                  : "High-resolution GSI slope stability models, seismic fault buffers, and precipitation thresholds dynamically ranking habitations into Red (Critical), High, Moderate, and Safe vulnerability tiers."}
              </p>
              <div className="p-4 rounded-xl bg-slate-800/60 border border-slate-700/60 text-xs space-y-1 text-slate-300">
                <span className="font-bold text-slate-800 dark:text-slate-200 block">Key Metrics Evaluated:</span>
                <div>• Slope Angle & Geotechnical Lithology (GSI)</div>
                <div>• BIS Seismic Zone IV/V Regional Stress Corridors</div>
                <div>• Historical Inundation & Slope Failure Ledger</div>
              </div>
            </div>
            <button
              onClick={() => handlePillarClick("landslide")}
              className="mt-6 w-full py-2.5 px-4 bg-red-600 hover:bg-red-700 text-white font-bold text-xs rounded-xl transition flex items-center justify-center gap-2 shadow-md"
            >
              <span>{isHi ? "मानचित्र पर उच्च जोखिम देखें" : "Inspect Landslide Corridors in GIS"}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          {/* Pillar 2: Cloudburst Inundation Analytics */}
          <div className="p-8 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-sm flex flex-col justify-between hover:border-blue-500 transition-all">
            <div className="space-y-4">
              <div className="w-14 h-14 rounded-2xl bg-blue-100 dark:bg-blue-950/80 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold">
                <Waves className="w-7 h-7" />
              </div>
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400 block mb-1">
                  Pillar 02 • Hydro-Modeling
                </span>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                  {isHi ? "बादल फटना एवं जलप्लावन विश्लेषण" : "Cloudburst Inundation Analytics"}
                </h3>
              </div>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                {isHi
                  ? "नदी निकटता, अत्यधिक वर्षा आवृत्ति तथा घाटी तलहटी में अचानक आई बाढ़ (Flash Flood) के जलप्रवाह का बहु-आयामी हाइड्रो-मॉडलिंग। मंदाकिनी, पिंडर व भागीरथी बेसिन की बस्तियों का त्वरित विश्लेषण।"
                  : "Catchment runoff calculations, extreme precipitation anomalies, and river proximity buffers predicting flash flood velocity and valley floor inundation envelopes in sub-second queries."}
              </p>
              <div className="p-4 rounded-xl bg-slate-800/60 border border-slate-700/60 text-xs space-y-1 text-slate-300">
                <span className="font-bold text-slate-800 dark:text-slate-200 block">Key Metrics Evaluated:</span>
                <div>• 30-Year IMD Monsoon Anomalies & Cloudburst Triggers</div>
                <div>• Digital Elevation Model (DEM) Streamflow Slopes</div>
                <div>• Sub-Basin Soil Saturation Index & Hydrologic Runoff</div>
              </div>
            </div>
            <button
              onClick={() => handlePillarClick("flood")}
              className="mt-6 w-full py-2.5 px-4 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl transition flex items-center justify-center gap-2 shadow-md"
            >
              <span>{isHi ? "जलप्लावन स्तर देखें" : "View Flash Flood Risk Zones"}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          {/* Pillar 3: Safe Shelter Allocation */}
          <div className="p-8 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-sm flex flex-col justify-between hover:border-emerald-500 transition-all">
            <div className="space-y-4">
              <div className="w-14 h-14 rounded-2xl bg-emerald-100 dark:bg-emerald-950/80 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold">
                <Building2 className="w-7 h-7" />
              </div>
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 block mb-1">
                  Pillar 03 • Logistics Engine
                </span>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                  {isHi ? "स्वचालित सुरक्षित आश्रय स्थल आवंटन" : "Evacuation Shelter Allocation"}
                </h3>
              </div>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                {isHi
                  ? "20 रणनीतिक राहत शिविरों की वास्तविक समय क्षमता (42,000+ व्यक्ति), पेयजल, चिकित्सा आपूर्ति, सड़क पहुंच एवं नजदीकी विस्थापित बस्तियों का स्वचालित भू-स्थानिक मिलान।"
                  : "Algorithmic capacity optimization matching vulnerable habitations to verified transit camps, tracking medical resources, backup power, and road corridor passability."}
              </p>
              <div className="p-4 rounded-xl bg-slate-800/60 border border-slate-700/60 text-xs space-y-1 text-slate-300">
                <span className="font-bold text-slate-800 dark:text-slate-200 block">Key Metrics Evaluated:</span>
                <div>• Verified Maximum Headcount & Remaining Capacity</div>
                <div>• Geodesic Route Distance & Estimated Evacuation Time</div>
                <div>• Potable Water, Medical Post & Heavy Machinery Access</div>
              </div>
            </div>
            <button
              onClick={() => handlePillarClick("shelters")}
              className="mt-6 w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl transition flex items-center justify-center gap-2 shadow-md"
            >
              <span>{isHi ? "सत्यापित शिविर खोलें" : "Explore Verified Shelter Sites"}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          {/* Pillar 4: AI Scenario Blast Simulation */}
          <div className="p-8 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-sm flex flex-col justify-between hover:border-purple-500 transition-all">
            <div className="space-y-4">
              <div className="w-14 h-14 rounded-2xl bg-purple-100 dark:bg-purple-950/80 text-purple-600 dark:text-purple-400 flex items-center justify-center font-bold">
                <Activity className="w-7 h-7" />
              </div>
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-purple-600 dark:text-purple-400 block mb-1">
                  Pillar 04 • Decision Support
                </span>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                  {isHi ? "एआई परिदृश्य प्रभाव सिमुलेटर" : "AI Blast Simulation & ICS-201"}
                </h3>
              </div>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                {isHi
                  ? "मानचित्र पर कहीं भी क्लिक कर केंद्र बिंदु निर्धारित करें, 1-50 किमी शॉकवेव बफ़र, त्रि-स्तरीय ज़ोनिंग (प्रत्यक्ष, उच्च, परामर्श) तथा एनडीएमए प्रपत्र आईसीएस-201 कार्य योजना 60 सेकंड में तैयार करें।"
                  : "Interactive epicenter pinpointing with geodesic buffer shockwaves, estimating affected population, and auto-compiling statutory NDMA Form ICS-201 Incident Action Plans."}
              </p>
              <div className="p-4 rounded-xl bg-slate-800/60 border border-slate-700/60 text-xs space-y-1 text-slate-300">
                <span className="font-bold text-slate-800 dark:text-slate-200 block">Key Metrics Evaluated:</span>
                <div>• Zone 1 (0-5 km Direct Hit), Zone 2 (5-15 km Alert), Zone 3 (Advisory)</div>
                <div>• Census 2026 Household & Kutcha Structural Counts</div>
                <div>• Printable Statutory NDMA ICS-201 PDF with Digital Endorsement</div>
              </div>
            </div>
            <button
              onClick={() => handlePillarClick("simulation")}
              className="mt-6 w-full py-2.5 px-4 bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs rounded-xl transition flex items-center justify-center gap-2 shadow-md"
            >
              <span>{isHi ? "सिमुलेशन प्रारंभ करें" : "Launch Spatial Simulation Engine"}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </main>

      <GoiFooter />
    </div>
  );
}
