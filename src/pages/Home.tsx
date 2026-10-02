import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  ChevronRight,
  ChevronLeft,
  ArrowRight,
  Activity,
  Building2,
  Compass,
  Database,
  CheckCircle2,
  Waves,
  Mountain,
  Lock,
  ArrowUpRight
} from "lucide-react";
import GoiTopBar from "../components/GoiTopBar";
import GoiFooter from "../components/GoiFooter";
import { useTranslation } from "../i18n/translations";
import { useAuthStore } from "../store/authStore";
import { useUIStore } from "../store/uiStore";

export default function Home() {
  const navigate = useNavigate();
  const { lang } = useTranslation();
  const { accessToken } = useAuthStore();
  const { setDashboardPreconfig, setIsTargetToolActive } = useUIStore();
  const isAuthenticated = Boolean(accessToken);
  const [activeSlide, setActiveSlide] = useState(0);

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

  const slides = [
    {
      id: "slide-1",
      title: lang === "hi" ? "उच्च-रिज़ॉल्यूशन उपग्रह एवं कैडस्ट्रल मानचित्रण" : "Multi-Basemap Satellite Hybrid & Cadastral GIS",
      subtitle: lang === "hi" ? "इसरो भुवन, एसरी एवं ओपनस्ट्रीटमैप एकीकृत परतें" : "Integrated Esri World Imagery, OpenTopo & Cadastral Boundary Overlays",
      badge: lang === "hi" ? "जीआईएस मानक" : "GIS Engine v3.2",
      description: lang === "hi"
        ? "उत्तराखंड के 13 जिलों की 13,967 बस्तियों का सब-मीटर स्तर पर भू-स्थानिक विश्लेषण एवं विज़ुअलाइज़ेशन।"
        : "Sub-meter geospatial inspection and boundary analytics for all 13,967 habitations across 13 districts of Uttarakhand.",
      accent: "from-blue-600 to-indigo-700",
      stats: { primary: "13,967", label: lang === "hi" ? "चिह्नित बस्तियाँ" : "Settlements Scored" }
    },
    {
      id: "slide-2",
      title: lang === "hi" ? "आपदा परिदृश्य एवं प्रभाव त्रिज्या सिमुलेशन" : "AI Multi-Hazard Scenario Blast Simulation",
      subtitle: lang === "hi" ? "भूस्खलन, बादल फटना, जीएलओएफ एवं भूकंप प्रभाव विश्लेषण" : "Live PostGIS 3-Tier Zoning (Direct Hit, High Alert, Advisory)",
      badge: lang === "hi" ? "निर्णय समर्थन प्रणाली" : "DSS Spatial Query",
      description: lang === "hi"
        ? "मानचित्र पर कहीं भी क्लिक कर केंद्र बिंदु निर्धारित करें एवं वास्तविक समय में संभावित प्रभावित आबादी व सुरक्षित शिविर ज्ञात करें।"
        : "Interactive epicenter pinpointing with dynamic buffer shockwaves, casualty estimation, and NDMA Form ICS-201 Incident Action Plan generation.",
      accent: "from-red-600 to-amber-700",
      stats: { primary: "1-50 km", label: lang === "hi" ? "गतिशील प्रभाव त्रिज्या" : "Dynamic Buffer Radius" }
    },
    {
      id: "slide-3",
      title: lang === "hi" ? "स्वचालित सुरक्षित आश्रय स्थल आवंटन" : "Optimized Evacuation Corridors & Safe Shelters",
      subtitle: lang === "hi" ? "20 रणनीतिक राहत शिविर एवं वास्तविक समय मार्ग नियोजन" : "Logistics Allocation Engine Matching Capacities to Evacuees",
      badge: lang === "hi" ? "लॉजिस्टिक्स इंजन" : "Civil Protection",
      description: lang === "hi"
        ? "निकटतम सुरक्षित आश्रय स्थलों का स्वतः मिलान, क्षमता सत्यापन एवं तत्काल निकासी गलियारा रेखांकन।"
        : "Automated routing to verified disaster shelters, remaining capacity tracking, and emergency transit camp coordination.",
      accent: "from-emerald-600 to-teal-700",
      stats: { primary: "42,000+", label: lang === "hi" ? "सत्यापित शिविर क्षमता" : "Shelter Capacity" }
    },
    {
      id: "slide-4",
      title: lang === "hi" ? "जीएसआई / एनआरएससी भूस्खलन संवेदनशीलता मॉडल" : "GSI Slope Failure & Rainfall Vulnerability Matrix",
      subtitle: lang === "hi" ? "जोशीमठ, केदारनाथ एवं अलकनंदा घाटी उच्च जोखिम कॉरिडोर" : "Census 2026 Household Structural Vulnerability Aggregation",
      badge: lang === "hi" ? "वैज्ञानिक मॉडल" : "Predictive AI",
      description: lang === "hi"
        ? "भूकंपीय ज़ोन IV/V, अत्यधिक वर्षा, नदी निकटता एवं कच्ची आवास संरचनाओं का संयुक्त जोखिम सूचकांक।"
        : "Integrated multi-criteria risk scoring combining slope angles, precipitation anomalies, river distances, and housing conditions.",
      accent: "from-purple-600 to-blue-700",
      stats: { primary: "1.34M", label: lang === "hi" ? "सुरक्षित आबादी" : "Pop. Monitored" }
    }
  ];

  // Auto-advance slides every 7 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      setActiveSlide((prev) => (prev + 1) % slides.length);
    }, 7000);
    return () => clearInterval(timer);
  }, [slides.length]);

  return (
    <div id="main-content" className="min-h-screen flex flex-col bg-[#F8FAFC] dark:bg-[#070D18] text-slate-800 dark:text-slate-100 font-sans transition-colors selection:bg-blue-600 selection:text-white overflow-x-clip">
      {/* 1. Dedicated Sticky Header (GOI Accessibility Bar & Balanced 3-Zone Navbar) */}
      <header className="sticky top-0 z-50 w-full bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 shadow-sm transition-all flex-none">
        <GoiTopBar />

        {/* 2. Primary Portal Header (Full-Width 3-Zone Layout) */}
        <div className="w-full px-6 lg:px-12 h-18 min-h-[72px] flex items-center justify-between gap-4">
          {/* Zone 1 (Flush Left): Brand Identity */}
          <div className="flex items-center gap-3 sm:gap-4 select-none">
            <div className="relative group cursor-pointer" onClick={() => navigate("/")}>
              <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-blue-700/60 p-0.5 bg-white shadow-md group-hover:scale-105 transition-transform">
                <img
                  src="/riskos-logo.png"
                  alt="RiskOS Emblem"
                  className="w-full h-full object-cover rounded-full"
                />
              </div>
              <span className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 border-2 border-white dark:border-slate-900 rounded-full" title="Portal Operational" />
            </div>

            <div>
              <div className="flex items-center gap-2">
                <span className="text-xl sm:text-2xl font-black tracking-tight text-[#1E3A8A] dark:text-white">
                  RiskOS
                </span>
                <span className="text-xs font-bold text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/60 px-2 py-0.5 rounded border border-amber-200 dark:border-amber-800 font-devanagari">
                  जोखिम ओएस
                </span>
              </div>
              <p className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 truncate max-w-[280px] sm:max-w-md hidden sm:block">
                National Disaster Risk & Relocation Decision Support System (GIS-DSS)
              </p>
            </div>
          </div>

          {/* Zone 2 (Center Balanced): Navigation Menu Links */}
          <nav className="hidden lg:flex items-center gap-8 text-xs font-bold text-slate-600 dark:text-slate-300">
            <a href="#hero" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors uppercase tracking-wider">
              {lang === "hi" ? "होम" : "PORTAL"}
            </a>
            <a href="#about" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors uppercase tracking-wider">
              {lang === "hi" ? "हमारे बारे में" : "ABOUT US"}
            </a>
            <a href="#modules" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors uppercase tracking-wider">
              {lang === "hi" ? "मॉड्यूल" : "MODULES"}
            </a>
            <a href="#metrics" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors uppercase tracking-wider">
              {lang === "hi" ? "सांख्यिकी" : "STATISTICS"}
            </a>
            <a href="#contact" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors uppercase tracking-wider">
              {lang === "hi" ? "संपर्क" : "CONTACT"}
            </a>
          </nav>

          {/* Zone 3 (Flush Right): Ministry Endorsement Badges & Primary CTA */}
          <div className="flex items-center gap-3 sm:gap-5 flex-shrink-0">
            {/* Ashoka Stambh Seal Placeholder / Digital India / SDMA */}
            <div className="hidden md:flex items-center gap-3 pr-3 border-r border-slate-200 dark:border-slate-800">
              <div className="text-center" title="Government of India Statutory Authority">
                <div className="w-7 h-7 mx-auto text-amber-700 dark:text-amber-400 flex items-center justify-center font-serif text-sm font-black border border-amber-300 dark:border-amber-700 rounded-full bg-amber-50 dark:bg-amber-950/40">
                  GOI
                </div>
                <span className="text-[8px] font-bold text-slate-500 block uppercase leading-none mt-0.5">
                  सत्यमेव जयते
                </span>
              </div>
              <div className="text-center" title="Digital India Initiative">
                <div className="px-1.5 py-0.5 rounded bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800 text-[10px] font-bold text-blue-700 dark:text-blue-400">
                  Digital India
                </div>
                <span className="text-[8px] font-bold text-slate-500 block uppercase leading-none mt-0.5">
                  MeitY
                </span>
              </div>
            </div>

            {/* Officer Access or Dashboard Button */}
            {isAuthenticated ? (
              <button
                onClick={() => navigate("/dashboard")}
                className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-700 to-indigo-700 hover:from-blue-800 hover:to-indigo-800 text-white text-xs font-bold rounded-lg shadow-md hover:shadow-lg transition-all"
              >
                <span>{lang === "hi" ? "कमांड डैशबोर्ड" : "Enter Dashboard"}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            ) : (
              <button
                onClick={() => navigate("/login")}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-slate-900 hover:bg-slate-800 dark:bg-blue-700 dark:hover:bg-blue-600 text-white text-xs font-bold rounded-lg shadow transition-all"
              >
                <Lock className="w-3.5 h-3.5 text-amber-400" />
                <span>{lang === "hi" ? "अधिकारी लॉगिन" : "Officer Login"}</span>
              </button>
            )}
          </div>
        </div>
      </header>

      {/* 3. Hero Showcase Section (Gradient Arc Layout modeled after BharatMaps) */}
      <section id="hero" className="relative h-auto min-h-[500px] bg-gradient-to-br from-[#1E1B4B] via-[#1E293B] to-[#0A1220] text-white pt-12 pb-20 lg:pt-16 lg:pb-28 border-b border-indigo-900/50 scroll-mt-28">
        {/* Subtle Background Pattern & Glows */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute inset-0 opacity-15 bg-[radial-gradient(#38bdf8_1px,transparent_1px)] [background-size:24px_24px]" />
          <div className="absolute -top-40 -right-40 w-96 h-96 bg-blue-600/20 rounded-full blur-3xl" />
          <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-purple-600/20 rounded-full blur-3xl" />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
            {/* Left Content Column (7 cols) */}
            <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
              {/* Official Pill Badge */}
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-950/80 border border-indigo-500/40 text-amber-300 text-xs font-bold tracking-wide shadow-sm">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                <span>GOVERNMENT OF INDIA • STATUTORY SDMA GEOSPATIAL DSS</span>
              </div>

              {/* Main Headline */}
              <div className="space-y-2">
                <h2 className="text-xs sm:text-sm font-bold uppercase tracking-widest text-indigo-300">
                  {lang === "hi" ? "राष्ट्रीय आपदा जोखिम एवं पुनर्वास निर्णय समर्थन प्रणाली" : "National Disaster Risk & Relocation Decision Support System"}
                </h2>
                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight leading-tight text-white">
                  {lang === "hi" ? (
                    <>
                      उत्तराखंड आपदा प्रबंधन एवं <br />
                      <span className="bg-gradient-to-r from-blue-400 via-indigo-300 to-amber-300 bg-clip-text text-transparent">
                        भू-स्थानिक निर्णय समर्थन पोर्टल
                      </span>
                    </>
                  ) : (
                    <>
                      Welcome to <span className="text-amber-400">RiskOS</span> <br />
                      <span className="bg-gradient-to-r from-blue-300 via-indigo-200 to-sky-300 bg-clip-text text-transparent">
                        Geospatial Hazard & Relocation Analytics Division
                      </span>
                    </>
                  )}
                </h1>
              </div>

              {/* Sub-text paragraph */}
              <p className="text-sm sm:text-base text-slate-300 max-w-2xl mx-auto lg:mx-0 leading-relaxed font-normal">
                {lang === "hi"
                  ? "राज्य आपदा प्रबंधन प्राधिकरण (SDMA) उत्तराखंड एवं एनडीएमए हेतु विकसित एकीकृत उपग्रह जीआईएस प्रणाली। जोशीमठ, केदारनाथ एवं सीमांत जनपदों में भूस्खलन संवेदनशीलता, नदी जलप्लावन, सुरक्षित शिविर आवंटन एवं त्वरित निकासी का सटीक विश्लेषण।"
                  : "Authoritative Government of India GIS platform integrating Census 2026 demographic data, GSI landslide corridors, satellite basemaps, and AI blast simulation for proactive mountain risk governance and evacuation planning."}
              </p>

              {/* Primary Call to Action Button Row */}
              <div className="pt-2 flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
                <button
                  onClick={() => navigate("/dashboard")}
                  className="w-full sm:w-auto px-8 py-4 bg-white text-slate-950 hover:bg-slate-100 font-extrabold text-sm sm:text-base rounded-full shadow-2xl hover:shadow-blue-500/30 hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-3 group border border-slate-200"
                >
                  <Compass className="w-5 h-5 text-blue-700 group-hover:rotate-45 transition-transform" />
                  <span>{lang === "hi" ? "जीआईएस पोर्टल पर जाएं >" : "GO TO GIS PORTAL >"}</span>
                </button>

                <button
                  onClick={() => navigate("/login")}
                  className="w-full sm:w-auto px-6 py-4 bg-indigo-950/70 hover:bg-indigo-900/80 text-white font-bold text-sm rounded-full border border-indigo-400/40 hover:border-indigo-300 shadow-md transition-all flex items-center justify-center gap-2"
                >
                  <Lock className="w-4 h-4 text-amber-400" />
                  <span>{lang === "hi" ? "अधिकारी सुरक्षित प्रवेश" : "State Officer Access"}</span>
                </button>
              </div>

              {/* Feature Highlights Pills */}
              <div className="pt-4 flex flex-wrap items-center justify-center lg:justify-start gap-3 text-xs text-slate-300">
                <span className="flex items-center gap-1.5 bg-slate-900/60 px-3 py-1.5 rounded-full border border-slate-700">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  {lang === "hi" ? "13,967 बस्तियाँ मूल्यांकित" : "13,967 Settlements Analyzed"}
                </span>
                <span className="flex items-center gap-1.5 bg-slate-900/60 px-3 py-1.5 rounded-full border border-slate-700">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  {lang === "hi" ? "20 सुरक्षित राहत शिविर" : "20 Strategic Relief Shelters"}
                </span>
                <span className="flex items-center gap-1.5 bg-slate-900/60 px-3 py-1.5 rounded-full border border-slate-700">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  {lang === "hi" ? "एनडीएमए प्रपत्र आईसीएस-201 संगत" : "NDMA ICS-201 Compliant"}
                </span>
              </div>
            </div>

            {/* Right Showcase Column (5 cols) - Interactive Laptop Mockup & Orbit Bubbles */}
            <div className="lg:col-span-5 relative flex flex-col items-center">
              {/* Laptop Shell Mockup */}
              <div className="w-full max-w-lg bg-slate-950 rounded-2xl p-2.5 sm:p-3 shadow-2xl border-2 border-indigo-500/30 relative group">
                {/* Laptop Camera dot */}
                <div className="w-2 h-2 rounded-full bg-slate-700 mx-auto mb-2" />

                {/* Display Frame */}
                <div className="relative aspect-[16/10] rounded-lg overflow-hidden bg-slate-900 border border-slate-800">
                  {/* Active Slide Visual Card */}
                  <div className={`absolute inset-0 bg-gradient-to-br ${slides[activeSlide].accent} p-6 flex flex-col justify-between text-white transition-all duration-500`}>
                    <div className="flex items-center justify-between">
                      <span className="px-2.5 py-1 rounded-md bg-black/40 backdrop-blur-sm text-[10px] font-bold tracking-wider uppercase border border-white/20">
                        {slides[activeSlide].badge}
                      </span>
                      <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
                    </div>

                    <div className="space-y-2">
                      <h3 className="text-lg sm:text-xl font-bold leading-snug drop-shadow-md">
                        {slides[activeSlide].title}
                      </h3>
                      <p className="text-xs text-white/90 line-clamp-3 leading-relaxed">
                        {slides[activeSlide].description}
                      </p>
                    </div>

                    <div className="pt-2 border-t border-white/20 flex items-center justify-between">
                      <div>
                        <div className="text-lg font-mono font-bold">{slides[activeSlide].stats.primary}</div>
                        <div className="text-[10px] uppercase tracking-wider text-white/80">{slides[activeSlide].stats.label}</div>
                      </div>
                      <button
                        onClick={() => navigate("/dashboard")}
                        className="px-3 py-1.5 bg-white text-slate-950 hover:bg-slate-100 rounded-md text-xs font-bold flex items-center gap-1 shadow"
                      >
                        <span>{lang === "hi" ? "मानचित्र खोलें" : "Launch"}</span>
                        <ArrowUpRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Laptop Base Bottom Lip */}
                <div className="w-1/2 h-1 bg-slate-700 mx-auto mt-2 rounded-full" />
              </div>

              {/* Orbit Carousel Navigation Controls */}
              <div className="mt-4 flex items-center gap-3">
                <button
                  onClick={() => setActiveSlide((prev) => (prev - 1 + slides.length) % slides.length)}
                  className="p-1.5 rounded-full bg-indigo-950 hover:bg-indigo-900 border border-indigo-700/60 text-white transition shadow"
                  aria-label="Previous slide"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>

                {/* Slide indicator dots */}
                <div className="flex items-center gap-1.5">
                  {slides.map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setActiveSlide(i)}
                      className={`h-2 rounded-full transition-all ${
                        activeSlide === i ? "w-6 bg-amber-400" : "w-2 bg-slate-600 hover:bg-slate-400"
                      }`}
                      aria-label={`Go to slide ${i + 1}`}
                    />
                  ))}
                </div>

                <button
                  onClick={() => setActiveSlide((prev) => (prev + 1) % slides.length)}
                  className="p-1.5 rounded-full bg-indigo-950 hover:bg-indigo-900 border border-indigo-700/60 text-white transition shadow"
                  aria-label="Next slide"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Key Modules & Pillars (Below Hero) */}
      <section id="modules" className="py-16 sm:py-20 bg-white dark:bg-[#0A1220] border-b border-slate-200 dark:border-slate-800 scroll-mt-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-14 space-y-3">
            <span className="text-xs font-bold text-blue-700 dark:text-blue-400 uppercase tracking-widest bg-blue-50 dark:bg-blue-950/60 px-3 py-1 rounded-full border border-blue-200 dark:border-blue-800">
              {lang === "hi" ? "कोर जीआईएस मॉड्यूल" : "Core System Modules"}
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
              {lang === "hi"
                ? "आपदा न्यूनीकरण एवं पुनर्वास हेतु चार वैज्ञानिक स्तंभ"
                : "Four Scientific Pillars for Disaster Resilience"}
            </h2>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              {lang === "hi"
                ? "राष्ट्रीय भू-स्थानिक दिशा-निर्देशों एवं एनडीएमए एसओपी के अनुरूप निर्मित निर्णय समर्थन प्रणाली"
                : "Engineered under NDMA guidelines to deliver actionable early warnings and operational relocation logistics."}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Card 1: Landslide Vulnerability Mapping */}
            <div className="p-6 rounded-2xl bg-[#F8FAFC] dark:bg-[#0F172A] border border-slate-200 dark:border-slate-800 hover:border-red-400 hover:shadow-xl transition-all group flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 rounded-xl bg-red-100 dark:bg-red-950/80 text-red-600 dark:text-red-400 flex items-center justify-center font-bold mb-4 group-hover:scale-110 transition-transform">
                  <Mountain className="w-6 h-6" />
                </div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white mb-2">
                  {lang === "hi" ? "भूस्खलन संवेदनशीलता मानचित्रण" : "Landslide Vulnerability Mapping"}
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed mb-4">
                  {lang === "hi"
                    ? "जीएसआई डेटा आधारित ढलान स्थिरता एवं फॉल्ट लाइनों का विश्लेषण। अलकनंदा व भागीरथी घाटियों की बस्तियों का स्वचालित वर्गीकरण।"
                    : "GSI/NRSC slope stability modeling, seismic fault buffers, and habitation risk classification for high-risk mountain sectors."}
                </p>
              </div>
              <div
                role="button"
                tabIndex={0}
                onClick={() => handlePillarClick("landslide")}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    handlePillarClick("landslide");
                  }
                }}
                className="pt-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-[11px] font-bold text-red-600 dark:text-red-400 cursor-pointer select-none focus:outline-none focus:ring-1 focus:ring-red-400 rounded-b-xl"
              >
                <span>{lang === "hi" ? "लाल/उच्च जोखिम फ़िल्टर" : "Red & High Risk Index"}</span>
                <ChevronRight className="w-4 h-4 group-hover:translate-x-1.5 transition-transform duration-200" />
              </div>
            </div>

            {/* Card 2: Cloudburst Inundation Analytics */}
            <div className="p-6 rounded-2xl bg-[#F8FAFC] dark:bg-[#0F172A] border border-slate-200 dark:border-slate-800 hover:border-blue-400 hover:shadow-xl transition-all group flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 rounded-xl bg-blue-100 dark:bg-blue-950/80 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold mb-4 group-hover:scale-110 transition-transform">
                  <Waves className="w-6 h-6" />
                </div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white mb-2">
                  {lang === "hi" ? "बादल फटना एवं जलप्लावन विश्लेषण" : "Cloudburst Inundation Analytics"}
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed mb-4">
                  {lang === "hi"
                     ? "नदी निकटता, अत्यधिक वर्षा आवृत्ति तथा घाटी तलहटी में अचानक आई बाढ़ के जलप्रवाह का बहु-आयामी हाइड्रो-मॉडलिंग।"
                    : "Catchment runoff calculations, extreme rainfall anomalies, and river proximity buffers assessing flash flood impact."}
                </p>
              </div>
              <div
                role="button"
                tabIndex={0}
                onClick={() => handlePillarClick("flood")}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    handlePillarClick("flood");
                  }
                }}
                className="pt-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-[11px] font-bold text-blue-600 dark:text-blue-400 cursor-pointer select-none focus:outline-none focus:ring-1 focus:ring-blue-400 rounded-b-xl"
              >
                <span>{lang === "hi" ? "जलप्लावन स्तर" : "Flash Flood Corridors"}</span>
                <ChevronRight className="w-4 h-4 group-hover:translate-x-1.5 transition-transform duration-200" />
              </div>
            </div>

            {/* Card 3: Evacuation Shelter Allocation */}
            <div className="p-6 rounded-2xl bg-[#F8FAFC] dark:bg-[#0F172A] border border-slate-200 dark:border-slate-800 hover:border-emerald-400 hover:shadow-xl transition-all group flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 rounded-xl bg-emerald-100 dark:bg-emerald-950/80 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold mb-4 group-hover:scale-110 transition-transform">
                  <Building2 className="w-6 h-6" />
                </div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white mb-2">
                  {lang === "hi" ? "सुरक्षित आश्रय स्थल आवंटन" : "Evacuation Shelter Allocation"}
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed mb-4">
                  {lang === "hi"
                    ? "20 प्रमुख राहत शिविरों की वास्तविक समय क्षमता, पेयजल, सड़क पहुंच एवं नजदीकी विस्थापित बस्तियों का त्वरित मिलान।"
                    : "Algorithmic capacity optimization assigning affected villagers to verified transit shelters with geodesic routing."}
                </p>
              </div>
              <div
                role="button"
                tabIndex={0}
                onClick={() => handlePillarClick("shelters")}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    handlePillarClick("shelters");
                  }
                }}
                className="pt-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-[11px] font-bold text-emerald-600 dark:text-emerald-400 cursor-pointer select-none focus:outline-none focus:ring-1 focus:ring-emerald-400 rounded-b-xl"
              >
                <span>{lang === "hi" ? "सत्यापित शिविर" : "42K Capacity Transit Camps"}</span>
                <ChevronRight className="w-4 h-4 group-hover:translate-x-1.5 transition-transform duration-200" />
              </div>
            </div>

            {/* Card 4: AI Scenario Blast Simulation */}
            <div className="p-6 rounded-2xl bg-[#F8FAFC] dark:bg-[#0F172A] border border-slate-200 dark:border-slate-800 hover:border-purple-400 hover:shadow-xl transition-all group flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 rounded-xl bg-purple-100 dark:bg-purple-950/80 text-purple-600 dark:text-purple-400 flex items-center justify-center font-bold mb-4 group-hover:scale-110 transition-transform">
                  <Activity className="w-6 h-6" />
                </div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white mb-2">
                  {lang === "hi" ? "एआई परिदृश्य प्रभाव सिमुलेटर" : "AI Scenario Blast Simulation"}
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed mb-4">
                  {lang === "hi"
                    ? "मानचित्र पर सक्रिय केंद्र बिंदु, 1-50 किमी शॉकवेव बफ़र, त्रि-स्तरीय ज़ोनिंग एवं एनडीएमए फॉर्म आईसीएस-201 पीडीएफ रिपोर्ट।"
                    : "PostGIS distance queries returning Zone 1/2/3 impact tiers, casualty projections, and printable statutory ICS-201 plans."}
                </p>
              </div>
              <div
                role="button"
                tabIndex={0}
                onClick={() => handlePillarClick("simulation")}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    handlePillarClick("simulation");
                  }
                }}
                className="pt-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-[11px] font-bold text-purple-600 dark:text-purple-400 cursor-pointer select-none focus:outline-none focus:ring-1 focus:ring-purple-400 rounded-b-xl"
              >
                <span>{lang === "hi" ? "आईसीएस-201 कार्य योजना" : "NDMA ICS-201 Action Plan"}</span>
                <ChevronRight className="w-4 h-4 group-hover:translate-x-1.5 transition-transform duration-200" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5. Live Operational Metrics (KPI Counter Grid) */}
      <section id="metrics" className="py-14 bg-slate-900 text-white border-b border-slate-800 relative scroll-mt-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            <div className="p-4 rounded-xl bg-slate-800/60 border border-slate-700/80">
              <div className="text-3xl sm:text-4xl font-black font-mono text-amber-400 mb-1">13,967</div>
              <div className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                {lang === "hi" ? "कुल मूल्यांकित बस्तियाँ" : "Habitations Scored"}
              </div>
              <div className="text-[10px] text-slate-400 mt-1">
                {lang === "hi" ? "उत्तराखंड के 13 जनपदों में" : "All 13 Uttarakhand Districts"}
              </div>
            </div>

            <div className="p-4 rounded-xl bg-slate-800/60 border border-slate-700/80">
              <div className="text-3xl sm:text-4xl font-black font-mono text-red-400 mb-1">1,340,000+</div>
              <div className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                {lang === "hi" ? "निगरानी में संवेदनशील आबादी" : "Vulnerable Population"}
              </div>
              <div className="text-[10px] text-slate-400 mt-1">
                {lang === "hi" ? "लाल एवं उच्च जोखिम क्षेत्रों में" : "Red & High Risk Corridors"}
              </div>
            </div>

            <div className="p-4 rounded-xl bg-slate-800/60 border border-slate-700/80">
              <div className="text-3xl sm:text-4xl font-black font-mono text-emerald-400 mb-1">20</div>
              <div className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                {lang === "hi" ? "रणनीतिक सुरक्षित आश्रय शिविर" : "Safe Transit Shelters"}
              </div>
              <div className="text-[10px] text-slate-400 mt-1">
                {lang === "hi" ? "42,000 कुल क्षमता" : "42,000 Verified Placements"}
              </div>
            </div>

            <div className="p-4 rounded-xl bg-slate-800/60 border border-slate-700/80">
              <div className="text-3xl sm:text-4xl font-black font-mono text-sky-400 mb-1">100%</div>
              <div className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                {lang === "hi" ? "गीग्व / डब्ल्यूसीएजी अनुपालन" : "GIGW & WCAG 2.1 AA"}
              </div>
              <div className="text-[10px] text-slate-400 mt-1">
                {lang === "hi" ? "द्विभाषी एवं सुलभता प्रमाणित" : "Bilingual & Screen Reader Ready"}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 6. Architecture & Workflow Section (BharatMaps Style) */}
      <section id="about" className="py-16 bg-[#F8FAFC] dark:bg-[#070D18] border-b border-slate-200 dark:border-slate-800 scroll-mt-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-5">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-400 text-xs font-bold border border-indigo-200 dark:border-indigo-800">
                <Database className="w-3.5 h-3.5" />
                <span>{lang === "hi" ? "प्रणाली वास्तुकला एवं डेटा पाइपलाइन" : "System Architecture & Data Pipeline"}</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white leading-tight">
                {lang === "hi"
                  ? "उपग्रह डेटा से फील्ड निकासी तक एकीकृत निर्णय प्रवाह"
                  : "From Satellite Observations to Ground Evacuation Command"}
              </h2>
              <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                {lang === "hi"
                  ? "रिस्कओएस प्रणाली राष्ट्रीय सुदूर संवेदन केंद्र (NRSC), भारतीय भूवैज्ञानिक सर्वेक्षण (GSI) तथा भारतीय जनगणना 2026 के आंकड़ों को पोस्टजीआईएस (PostGIS) स्थानिक डेटाबेस में संयोजित करती है। अधिकारी किसी भी संभावित आपदा की स्थिति में 60 सेकंड के भीतर औपचारिक आईसीएस-201 कार्य योजना और सीएपी अलर्ट जारी कर सकते हैं।"
                  : "RiskOS fuses remote sensing layers, digital elevation models, and socio-economic vulnerability indicators into an authoritative PostGIS spatial cluster. Emergency response officials evaluate dynamic shockwave buffers and dispatch Common Alerting Protocol (CAP) notifications in under 60 seconds."}
              </p>

              <div className="space-y-3 pt-2">
                <div className="flex items-start gap-3 p-3 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                  <div className="w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-900/60 text-blue-700 dark:text-blue-300 font-bold text-xs flex items-center justify-center flex-shrink-0 mt-0.5">
                    1
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                      {lang === "hi" ? "बहु-स्रोत उपग्रह एवं कैडस्ट्रल अंतर्ग्रहण" : "Multi-Source Satellite & Census Ingestion"}
                    </h4>
                    <p className="text-[11px] text-slate-500">
                      High-resolution Esri World Imagery, OpenStreetMap cadastre, and 13,967 habitation point vectors.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                  <div className="w-6 h-6 rounded-full bg-purple-100 dark:bg-purple-900/60 text-purple-700 dark:text-purple-300 font-bold text-xs flex items-center justify-center flex-shrink-0 mt-0.5">
                    2
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                      {lang === "hi" ? "पोस्टजीआईएस स्थानिक क्वेरी व त्रि-स्तरीय ज़ोनिंग" : "PostGIS Spatial Queries & 3-Tier Zoning"}
                    </h4>
                    <p className="text-[11px] text-slate-500">
                      Direct Hit (Zone 1), High Alert (Zone 2), and Advisory (Zone 3) distance intersections computed in milliseconds.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                  <div className="w-6 h-6 rounded-full bg-emerald-100 dark:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300 font-bold text-xs flex items-center justify-center flex-shrink-0 mt-0.5">
                    3
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                      {lang === "hi" ? "स्वचालित राहत शिविर मिलान एवं सीएपी प्रसारण" : "Shelter Capacity Matching & CAP Broadcast"}
                    </h4>
                    <p className="text-[11px] text-slate-500">
                      Geodesic evacuation corridor lines linked to 20 strategic camps outside active hazard impact radiuses.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Visual Callout Box */}
            <div className="p-8 rounded-3xl bg-gradient-to-br from-indigo-900 to-slate-900 text-white shadow-2xl border border-indigo-700/50 space-y-6">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold px-3 py-1 rounded-full bg-amber-400 text-slate-950">
                  NIC & SDMA Standard
                </span>
                <span className="text-xs text-indigo-300 font-mono">GOI-DSS-2026</span>
              </div>

              <div className="space-y-3">
                <h3 className="text-2xl font-bold">
                  {lang === "hi" ? "आधिकारिक परिचालन पोर्टल" : "Statutory Emergency Operations"}
                </h3>
                <p className="text-xs text-slate-300 leading-relaxed">
                  {lang === "hi"
                    ? "यह पोर्टल राज्य आपदा प्रबंधन प्राधिकरण, उत्तराखंड एवं गृह मंत्रालय (MHA) के तत्वावधान में संचालित है। अधिकृत अधिकारी एवं जिला मजिस्ट्रेट 2FA प्रमाणीकरण के साथ कमांड डैशबोर्ड में प्रवेश कर सकते हैं।"
                    : "Authorized disaster management officers, District Magistrates, and field teams utilize the secure workspace for emergency action execution."}
                </p>
              </div>

              <div className="pt-4 border-t border-indigo-800 flex flex-col sm:flex-row gap-3">
                <button
                  onClick={() => navigate("/dashboard")}
                  className="w-full py-3 bg-white text-slate-950 hover:bg-slate-100 font-extrabold text-xs rounded-xl shadow transition flex items-center justify-center gap-2"
                >
                  <Compass className="w-4 h-4 text-blue-700" />
                  <span>{lang === "hi" ? "जीआईएस डैशबोर्ड लॉन्च करें" : "Launch GIS Dashboard"}</span>
                </button>

                <button
                  onClick={() => navigate("/login")}
                  className="w-full py-3 bg-indigo-950/90 hover:bg-indigo-900 text-white font-bold text-xs rounded-xl border border-indigo-500/50 transition flex items-center justify-center gap-2"
                >
                  <Lock className="w-3.5 h-3.5 text-amber-400" />
                  <span>{lang === "hi" ? "अधिकारी 2FA लॉगिन" : "Official 2FA Login"}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 7. Contact / Helpdesk Strip */}
      <section id="contact" className="py-10 bg-white dark:bg-[#0A1220] border-b border-slate-200 dark:border-slate-800 scroll-mt-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6 text-center md:text-left">
            <div>
              <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                {lang === "hi" ? "राज्य आपातकालीन संचालन केंद्र (SEOC) हेल्पलाइन" : "State Emergency Operations Centre (SEOC) Helpline"}
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Uttarakhand State Disaster Management Authority, Secretariat, Dehradun
              </p>
            </div>
            <div className="flex flex-wrap items-center justify-center gap-3">
              <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-red-100 dark:bg-red-950/80 text-red-700 dark:text-red-300 font-bold font-mono text-xs border border-red-300 dark:border-red-800">
                <span>Toll Free:</span>
                <a
                  href="tel:1070"
                  className="hover:underline focus:outline-none focus:ring-1 focus:ring-red-500 rounded px-0.5 cursor-pointer"
                  title="Dial State Emergency Helpline 1070"
                  aria-label="Dial State Emergency Helpline 1070"
                >
                  1070
                </a>
                <span>/</span>
                <a
                  href="tel:1077"
                  className="hover:underline focus:outline-none focus:ring-1 focus:ring-red-500 rounded px-0.5 cursor-pointer"
                  title="Dial District Emergency Helpline 1077"
                  aria-label="Dial District Emergency Helpline 1077"
                >
                  1077
                </a>
              </div>
              <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-blue-100 dark:bg-blue-950/80 text-blue-700 dark:text-blue-300 font-bold font-mono text-xs border border-blue-300 dark:border-blue-800">
                <span>Helpline:</span>
                <a
                  href="tel:+911352710334"
                  className="hover:underline focus:outline-none focus:ring-1 focus:ring-blue-500 rounded px-0.5 cursor-pointer"
                  title="Dial Uttarakhand SEOC Secretariat: 0135-2710334"
                  aria-label="Dial Uttarakhand SEOC Secretariat: 0135-2710334"
                >
                  0135-2710334
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 8. Official GIGW Compliance Footer */}
      <GoiFooter />
    </div>
  );
}
