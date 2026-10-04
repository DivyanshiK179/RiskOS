import { useState, useEffect, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  ChevronRight,
  ChevronLeft,
  ChevronDown,
  ArrowRight,
  Activity,
  Building2,
  Compass,
  Database,
  Waves,
  Mountain,
  Lock,
  ArrowUpRight,
  Shield,
  Users,
  PhoneCall,
  HelpCircle,
  Radio,
  UserCheck,
  Menu,
  X,
  Scale
} from "lucide-react";
import GoiTopBar from "../components/GoiTopBar";
import GoiFooter from "../components/GoiFooter";
import { useTranslation } from "../i18n/translations";
import { useAuthStore } from "../store/authStore";
import { useUIStore } from "../store/uiStore";

export default function Home() {
  const navigate = useNavigate();
  const { t, lang } = useTranslation();
  const isHi = lang === "hi";
  const { accessToken, is2FAVerified } = useAuthStore();
  const { setDashboardPreconfig, setIsTargetToolActive } = useUIStore();
  const isAuthenticated = Boolean(accessToken);
  const [activeSlide, setActiveSlide] = useState(0);
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleEnterDashboard = (customPath = "/dashboard") => {
    if (isAuthenticated && is2FAVerified) {
      navigate(customPath);
    } else {
      navigate(`/login?redirect=${encodeURIComponent(customPath)}&reason=2fa_required`);
    }
  };

  const scrollToSection = (id: string) => {
    setMobileMenuOpen(false);
    if (id === "top" || id === "hero") {
      window.scrollTo({ top: 0, behavior: "smooth" });
      if (window.location.hash) {
        window.history.replaceState(null, "", window.location.pathname);
      }
      return;
    }
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
      // Keep URL clean so subsequent page refreshes never lock to the section
      window.history.replaceState(null, "", window.location.pathname);
    }
  };

  const handleGoHome = (e?: React.MouseEvent) => {
    if (e) e.preventDefault();
    setMobileMenuOpen(false);
    if (window.location.hash) {
      window.history.replaceState(null, "", window.location.pathname);
    }
    window.scrollTo({ top: 0, left: 0, behavior: "smooth" });
  };

  useEffect(() => {
    // Disable browser's auto scroll restoration so refresh always starts at top
    if ("scrollRestoration" in window.history) {
      window.history.scrollRestoration = "manual";
    }

    const navEntries = performance.getEntriesByType("navigation") as PerformanceNavigationTiming[];
    const isReload = navEntries.length > 0 && navEntries[0].type === "reload";
    const hash = window.location.hash.replace("#", "");

    if (isReload) {
      // On page refresh / reload, immediately clear any hash and reset to top
      if (hash) {
        window.history.replaceState(null, "", window.location.pathname);
      }
      window.scrollTo({ top: 0, left: 0, behavior: "instant" });
      return;
    }

    if (hash) {
      const timer = setTimeout(() => {
        const el = document.getElementById(hash);
        if (el) {
          el.scrollIntoView({ behavior: "smooth", block: "start" });
          // Strip hash after scrolling so refresh won't jump down
          window.history.replaceState(null, "", window.location.pathname);
        }
      }, 150);
      return () => clearTimeout(timer);
    } else {
      window.scrollTo({ top: 0, left: 0, behavior: "instant" });
    }
  }, []);

  const toggleFaq = (index: number) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  const handlePillarClick = (pillar: "landslide" | "flood" | "shelters" | "simulation") => {
    let target = "/dashboard";
    if (pillar === "landslide") {
      setDashboardPreconfig({
        tab: "risk-map",
        hazardFilter: "HIGH",
        showLandslide: true,
      });
      target = "/dashboard?tab=risk-map&hazard=HIGH&riskLevel=HIGH&layer=landslide&landslide=true";
    } else if (pillar === "flood") {
      setDashboardPreconfig({
        tab: "risk-map",
        showFlood: true,
        focusedLocation: { lat: 30.284, lon: 78.981 },
      });
      target = "/dashboard?tab=risk-map&layer=flood&floodInundation=true&valley=true";
    } else if (pillar === "shelters") {
      setDashboardPreconfig({
        tab: "safe-sites",
        facility: "shelter",
      });
      target = "/dashboard?tab=safe-sites&facility=shelter";
    } else if (pillar === "simulation") {
      setIsTargetToolActive(true);
      setDashboardPreconfig({
        tab: "simulation",
      });
      target = "/dashboard?tab=simulation&target=true";
    }

    if (isAuthenticated && is2FAVerified) {
      navigate(target);
    } else {
      navigate(`/login?redirect=${encodeURIComponent(target)}`);
    }
  };

  const slides = [
    {
      id: "slide-1",
      title: isHi ? "उच्च-रिज़ॉल्यूशन उपग्रह एवं कैडस्ट्रल मानचित्रण" : "Multi-Basemap Satellite Hybrid & Cadastral GIS",
      subtitle: isHi ? "इसरो भुवन, एसरी एवं ओपनस्ट्रीटमैप एकीकृत परतें" : "Integrated Esri World Imagery, OpenTopo & Cadastral Overlays",
      badge: isHi ? "जीआईएस मानक" : "GIS Engine v3.2",
      description: isHi
        ? "उत्तराखंड के सभी 13 जिलों की 13,967 बस्तियों का सब-मीटर स्तर पर भू-स्थानिक विश्लेषण एवं सर्वेक्षण।"
        : "Sub-meter geospatial inspection and statutory boundary analytics for all 13,967 habitations across 13 districts of Uttarakhand.",
      accent: "from-[#0B2545] to-[#133E68]",
      stats: { primary: "13,967", label: isHi ? "चिह्नित बस्तियाँ" : "Settlements Scored" }
    },
    {
      id: "slide-2",
      title: isHi ? "आपदा परिदृश्य एवं प्रभाव त्रिज्या सिमुलेशन" : "AI Multi-Hazard Scenario Blast Simulation",
      subtitle: isHi ? "भूस्खलन, बादल फटना, जीएलओएफ एवं भूकंप प्रभाव विश्लेषण" : "Live PostGIS 3-Tier Zoning (Direct Hit, High Alert, Advisory)",
      badge: isHi ? "निर्णय समर्थन प्रणाली" : "DSS Spatial Query",
      description: isHi
        ? "मानचित्र पर कहीं भी क्लिक कर केंद्र बिंदु निर्धारित करें एवं वास्तविक समय में संभावित प्रभावित आबादी व सुरक्षित शिविर ज्ञात करें।"
        : "Interactive epicenter pinpointing with dynamic buffer shockwaves, casualty estimation, and NDMA Form ICS-201 Incident Action Plan generation.",
      accent: "from-[#7F1D1D] to-[#991B1B]",
      stats: { primary: "1-50 km", label: isHi ? "गतिशील प्रभाव त्रिज्या" : "Dynamic Buffer Radius" }
    },
    {
      id: "slide-3",
      title: isHi ? "स्वचालित सुरक्षित आश्रय स्थल आवंटन" : "Optimized Evacuation Corridors & Safe Shelters",
      subtitle: isHi ? "20 रणनीतिक राहत शिविर एवं वास्तविक समय मार्ग नियोजन" : "Logistics Allocation Engine Matching Capacities to Evacuees",
      badge: isHi ? "लॉजिस्टिक्स इंजन" : "Civil Protection",
      description: isHi
        ? "निकटतम सुरक्षित आश्रय स्थलों का स्वतः मिलान, क्षमता सत्यापन एवं तत्काल निकासी गलियारा रेखांकन।"
        : "Automated routing to verified disaster shelters, remaining capacity tracking, and emergency transit camp coordination.",
      accent: "from-[#064E3B] to-[#047857]",
      stats: { primary: "42,000+", label: isHi ? "सत्यापित शिविर क्षमता" : "Shelter Capacity" }
    },
    {
      id: "slide-4",
      title: isHi ? "जीएसआई / एनआरएससी भूस्खलन संवेदनशीलता मॉडल" : "GSI Slope Failure & Rainfall Vulnerability Matrix",
      subtitle: isHi ? "जोशीमठ, केदारनाथ एवं अलकनंदा घाटी उच्च जोखिम कॉरिडोर" : "Census 2026 Household Structural Vulnerability Aggregation",
      badge: isHi ? "वैज्ञानिक मॉडल" : "Predictive AI",
      description: isHi
        ? "भूकंपीय ज़ोन IV/V, अत्यधिक वर्षा, नदी निकटता एवं कच्ची आवास संरचनाओं का संयुक्त जोखिम सूचकांक।"
        : "Integrated multi-criteria risk scoring combining slope angles, precipitation anomalies, river distances, and housing conditions.",
      accent: "from-[#312E81] to-[#4338CA]",
      stats: { primary: "1.34M", label: isHi ? "सुरक्षित आबादी" : "Pop. Monitored" }
    }
  ];

  // Auto-advance slides every 7 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      setActiveSlide((prev) => (prev + 1) % slides.length);
    }, 7000);
    return () => clearInterval(timer);
  }, [slides.length]);

  const faqs = [
    {
      q: isHi
        ? "रिस्कओएस (RiskOS) ग्रामीण बस्तियों के लिए आपदा जोखिम स्कोर की गणना कैसे करता है?"
        : "How does RiskOS compute hazard and vulnerability scores for habitations?",
      a: isHi
        ? "रिस्कओएस भारतीय भूवैज्ञानिक सर्वेक्षण (GSI) के ढलान संवेदनशीलता मानचित्र, भारतीय मौसम विभाग (IMD) की 30-वर्षीय वर्षा विसंगतियों, बीआईएस भूकंपीय ज़ोन IV व V डेटा, तथा भारतीय जनगणना 2026 के सामाजिक-आर्थिक व कच्ची आवास संरचना आंकड़ों का संयोजन करता है। यह समग्र जोखिम सूचकांक (0 से 100) उत्पन्न करता है जो प्रत्येक बस्ती को लाल (अति गंभीर), उच्च, मध्यम, या सुरक्षित श्रेणी में वर्गीकृत करता है।"
        : "RiskOS integrates Geological Survey of India (GSI) slope stability vectors, IMD extreme precipitation indices, BIS Seismic Zone IV/V maps, and Census 2026 socio-economic housing indicators (kutcha walls, lack of drainage). The composite score (0-100) classifies each village into Red (Critical), High, Moderate, or Safe categories."
    },
    {
      q: isHi
        ? "बादल फटने या भूस्खलन की घटना में त्रि-स्तरीय ज़ोनिंग (3-Tier Zoning) कैसे कार्य करती है?"
        : "How does the PostGIS 3-Tier Zoning operate during cloudbursts or flash floods?",
      a: isHi
        ? "जब ऑपरेटर सिमुलेशन टूल में घटना केंद्र का चयन करता है, तो पोस्टजीआईएस इंजन तात्कालिक भू-स्थानिक बफ़र बनाता है: ज़ोन 1 (प्रत्यक्ष प्रभाव: 0-5 किमी - तत्काल निकासी), ज़ोन 2 (उच्च चेतावनी: 5-15 किमी - आश्रय तत्परता), और ज़ोन 3 (परामर्श: 15-50 किमी - लॉजिस्टिक्स निगरानी)। प्रभावित आबादी और बुनियादी ढांचे का विश्लेषण 100 मिलीसेकंड में प्रस्तुत किया जाता है।"
        : "When an epicenter is triggered, PostGIS instantly projects concentric geodesic shockwaves: Zone 1 (Direct Hit: 0-5 km, immediate life-safety evacuation), Zone 2 (High Alert: 5-15 km, shelter readiness), and Zone 3 (Advisory: 15-50 km, logistics surveillance). Demographics and exposed infrastructure are tabulated in under 100 milliseconds."
    },
    {
      q: isHi
        ? "क्या जिला कलेक्टर पोर्टल से एनडीएमए प्रपत्र आईसीएस-201 (Incident Action Plan) निर्यात कर सकते हैं?"
        : "Can District Magistrates export official NDMA Form ICS-201 Incident Action Plans?",
      a: isHi
        ? "हाँ। रिस्कओएस एनडीएमए दिशानिर्देशों के अनुरूप स्वतः प्रारूपित आईसीएस-201 पीडीएफ उत्पन्न करता है। इसमें प्रभावित ग्रामों की सूची, राहत दल तैनाती, सीईआरटी-इन संगत 180-दिवसीय ऑडिट ब्लॉकचेन हैश और अधिकृत डिजिटल हस्ताक्षर ब्लॉक शामिल होते हैं जिन्हें सीधे राज्य नियंत्रण कक्ष को प्रेषित किया जा सकता है।"
        : "Yes. RiskOS automatically compiles statutory ICS-201 Incident Action Plans compliant with National Disaster Management Authority formats. The dossier includes impacted habitation rosters, assigned SDRF rescue units, shelter quotas, CERT-In SHA-256 tamper-evident ledger proofs, and digital endorsement seals."
    },
    {
      q: isHi
        ? "क्या फील्ड अधिकारी और सर्वेक्षणकर्ता पोर्टल पर नया स्थानिक डेटा अपलोड कर सकते हैं?"
        : "Can departmental field officers ingest ground GIS data without server restarts?",
      a: isHi
        ? "हाँ। नोडल प्रमुख और अधिकृत फील्ड अधिकारी 'डेटा अंतर्ग्रहण' (Data Ingestion) पाइपलाइन के माध्यम से जियोजेएसओएन (GeoJSON), ईएसआरआई शेपफाइल (Shapefile zip), अथवा सीएसवी प्रारूप में नए आश्रय स्थल, अवरुद्ध सड़कें या सर्वेक्षण डेटा अपलोड कर सकते हैं। यह डेटा स्वचालित सत्यापन के बाद सीधे मानचित्र पर उपलब्ध हो जाता है।"
        : "Yes. Authorized Disaster Managers and Field Staff can upload GeoJSON files, ESRI Shapefiles (zipped), or CSV coordinates directly via the self-service Ingestion Engine. Boundary limits within Uttarakhand and attribute schemas are automatically validated and merged into the live database."
    },
    {
      q: isHi
        ? "क्या रिस्कओएस भारतीय सर्वेक्षण विभाग (SOI) और जीआईजीडब्ल्यू 3.0 मानकों के अनुकूल है?"
        : "Is RiskOS compliant with Survey of India boundaries and GIGW 3.0 standards?",
      a: isHi
        ? "पूर्णतः। राष्ट्रीय भू-स्थानिक नीति 2021 के अनुसार भारत की अंतरराष्ट्रीय व राज्य सीमाएं भारतीय सर्वेक्षण विभाग के आधिकारिक नक्शों के अनुरूप हैं। इसके अतिरिक्त, संपूर्ण पोर्टल 100% द्विभाषी (हिन्दी/अंग्रेज़ी), स्क्रीन रीडर संगत, और डब्ल्यूसीएजी 2.1 एए (WCAG 2.1 AA) मानकों पर प्रमाणित है।"
        : "Fully compliant. Pursuant to the National Geospatial Policy (2021), all national and state frontiers strictly mirror official Survey of India boundary vectors. The portal also complies with GIGW 3.0 / WCAG 2.1 AA accessibility guidelines, including screen reader support and complete English/Hindi bilingualism."
    }
  ];

  return (
    <div id="main-content" className="min-h-screen flex flex-col bg-[#F8FAFC] dark:bg-[#070D18] text-slate-800 dark:text-slate-100 font-sans transition-colors selection:bg-[#0B2545] selection:text-white overflow-x-clip">
      {/* 1. Dedicated Sticky Header (GOI Accessibility Bar & Balanced 3-Zone Navbar) */}
      <header className="sticky top-0 z-50 w-full bg-white/95 dark:bg-[#0B2545]/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 shadow-sm transition-all flex-none">
        <GoiTopBar />

        {/* 2. Primary Portal Header (Full-Width 3-Zone Layout) */}
        <div className="w-full max-w-[100vw] px-2 sm:px-3 lg:px-4 xl:px-6 2xl:px-8 mx-auto h-18 min-h-[72px] flex flex-nowrap items-center justify-between gap-1.5 sm:gap-2 xl:gap-3 2xl:gap-4">
          {/* Zone 1 (Flush Left): Brand Identity */}
          <div className="flex items-center gap-2.5 sm:gap-3 select-none shrink-0">
            <Link to="/" onClick={handleGoHome} className="relative group cursor-pointer shrink-0" title="RiskOS Home">
              <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-full overflow-hidden border-2 border-[#0B2545] dark:border-blue-500 p-0.5 bg-white shadow-md group-hover:scale-105 transition-transform shrink-0">
                <img
                  src="/riskos-logo.png"
                  alt="RiskOS Emblem"
                  className="w-full h-full object-cover rounded-full"
                  onError={(e) => {
                    // Fallback to stylized emblem
                    (e.target as HTMLElement).style.display = "none";
                  }}
                />
              </div>
              <span className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-emerald-500 border-2 border-white dark:border-slate-900 rounded-full" title="Portal Active" />
            </Link>

            <div onClick={handleGoHome} className="cursor-pointer shrink-0">
              <div className="flex items-center gap-1.5 sm:gap-2">
                <span className="text-xl sm:text-2xl font-black tracking-tight text-[#0B2545] dark:text-white shrink-0">
                  RiskOS
                </span>
                <span className="text-[10px] sm:text-[11px] font-bold text-[#F46036] dark:text-amber-400 bg-amber-50 dark:bg-amber-950/60 px-1.5 sm:px-2 py-0.5 rounded border border-amber-200 dark:border-amber-800 font-devanagari shrink-0">
                  जोखिम ओएस
                </span>
              </div>
              <p className="text-[10px] xl:text-[11px] font-semibold text-slate-500 dark:text-slate-400 truncate max-w-[170px] xl:max-w-[240px] 2xl:max-w-md hidden sm:block">
                {isHi
                  ? "आपदा निर्णय समर्थन प्रणाली (GIS-DSS)"
                  : "Disaster Decision Support System (GIS-DSS)"}
              </p>
            </div>
          </div>

          {/* Zone 2 (Center Balanced): Navigation Menu Links - Strict Single Line */}
          <nav className="hidden lg:flex items-center gap-2 lg:gap-2.5 xl:gap-3.5 2xl:gap-5 text-[10.5px] xl:text-[11px] 2xl:text-xs font-semibold tracking-normal 2xl:tracking-wider text-slate-600 dark:text-slate-200 uppercase whitespace-nowrap shrink-0">
            <button
              onClick={() => scrollToSection("mandate")}
              className="hover:text-[#0B2545] dark:hover:text-blue-400 transition-colors uppercase whitespace-nowrap shrink-0 cursor-pointer focus:outline-none"
            >
              {isHi ? "वैधानिक जनादेश" : "STATUTORY MANDATE"}
            </button>
            <button
              onClick={() => scrollToSection("pillars")}
              className="hover:text-[#0B2545] dark:hover:text-blue-400 transition-colors uppercase whitespace-nowrap shrink-0 cursor-pointer focus:outline-none"
            >
              {isHi ? "वैज्ञानिक स्तंभ" : "PILLARS"}
            </button>
            <button
              onClick={() => scrollToSection("statistics")}
              className="hover:text-[#0B2545] dark:hover:text-blue-400 transition-colors uppercase whitespace-nowrap shrink-0 cursor-pointer focus:outline-none"
            >
              {isHi ? "राज्य सांख्यिकी" : "STATE TELEMETRY"}
            </button>
            <button
              onClick={() => scrollToSection("architecture")}
              className="hover:text-[#0B2545] dark:hover:text-blue-400 transition-colors uppercase whitespace-nowrap shrink-0 cursor-pointer focus:outline-none"
            >
              {isHi ? "डेटा पाइपलाइन" : "ARCHITECTURE"}
            </button>
            <button
              onClick={() => scrollToSection("faqs")}
              className="hover:text-[#0B2545] dark:hover:text-blue-400 transition-colors uppercase whitespace-nowrap shrink-0 cursor-pointer focus:outline-none"
            >
              {isHi ? "एफएक्यू" : "FAQS"}
            </button>
            <button
              onClick={() => scrollToSection("contact")}
              className="hover:text-[#0B2545] dark:hover:text-blue-400 transition-colors uppercase whitespace-nowrap shrink-0 cursor-pointer focus:outline-none"
            >
              {isHi ? "हेल्पलाइन" : "HELPLINE"}
            </button>
          </nav>

          {/* Zone 3 (Flush Right): Public & Officer CTAs */}
          <div className="flex items-center gap-1.5 xl:gap-2 2xl:gap-3 shrink-0">
            {/* Public Incident Map Link - Opens in new tab */}
            <Link
              to="/public-map"
              target="_blank"
              rel="noopener noreferrer"
              className="hidden sm:inline-flex items-center gap-1.5 px-2 py-1.5 xl:px-2.5 xl:py-1.5 2xl:px-3 2xl:py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-[10.5px] xl:text-[11px] 2xl:text-xs font-bold rounded-lg border border-slate-300 dark:border-slate-700 transition shrink-0 whitespace-nowrap"
              title="Public Citizen Incident Map"
            >
              <Radio className="w-3.5 h-3.5 text-[#F46036] animate-pulse" />
              <span>{isHi ? "सार्वजनिक मानचित्र" : "Public Map"}</span>
            </Link>

            {/* Department Registration Link */}
            <Link
              to="/register"
              className="hidden md:inline-flex items-center gap-1.5 px-2 py-1.5 xl:px-2.5 xl:py-1.5 2xl:px-3.5 2xl:py-2 bg-amber-50 hover:bg-amber-100 dark:bg-amber-950/40 dark:hover:bg-amber-900/60 text-amber-800 dark:text-amber-300 text-[10.5px] xl:text-[11px] 2xl:text-xs font-bold rounded-lg border border-amber-300 dark:border-amber-800 transition shrink-0 whitespace-nowrap"
              title="Official Department Personnel Registration"
            >
              <UserCheck className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
              <span>{isHi ? "अधिकारी पंजीकरण" : "Register Personnel"}</span>
            </Link>

            {/* Officer Access or Dashboard Button */}
            <button
              onClick={() => handleEnterDashboard("/dashboard")}
              className="inline-flex items-center gap-1.5 px-2.5 py-1.5 xl:px-3 xl:py-1.5 2xl:px-4 2xl:py-2 bg-[#0B2545] hover:bg-[#103058] dark:bg-blue-600 dark:hover:bg-blue-500 text-white text-[10.5px] xl:text-[11px] 2xl:text-xs font-bold rounded-lg shadow-md transition-all shrink-0 whitespace-nowrap"
            >
              {isAuthenticated && is2FAVerified ? (
                <>
                  <span>{isHi ? "कमांड डैशबोर्ड" : "Enter Dashboard"}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </>
              ) : (
                <>
                  <Lock className="w-3.5 h-3.5 text-amber-400" />
                  <span>{isHi ? "कमांड डैशबोर्ड में प्रवेश →" : "Enter Dashboard →"}</span>
                </>
              )}
            </button>

            {/* Mobile Hamburger Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-lg text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition border border-slate-200 dark:border-slate-700 shrink-0"
              aria-label="Toggle navigation menu"
              aria-expanded={mobileMenuOpen}
            >
              {mobileMenuOpen ? <X className="w-5 h-5 text-red-500" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Slide-down Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="lg:hidden border-t border-slate-200 dark:border-slate-800 bg-white/98 dark:bg-[#0B2545]/98 backdrop-blur-md px-4 py-4 space-y-3 shadow-xl animate-in fade-in slide-in-from-top-2">
            <nav className="flex flex-col gap-1 text-xs font-bold text-slate-700 dark:text-slate-200">
              <button
                onClick={() => scrollToSection("mandate")}
                className="text-left px-3 py-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 uppercase tracking-wider whitespace-nowrap"
              >
                {isHi ? "वैधानिक जनादेश" : "STATUTORY MANDATE"}
              </button>
              <button
                onClick={() => scrollToSection("pillars")}
                className="text-left px-3 py-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 uppercase tracking-wider whitespace-nowrap"
              >
                {isHi ? "वैज्ञानिक स्तंभ" : "PILLARS"}
              </button>
              <button
                onClick={() => scrollToSection("statistics")}
                className="text-left px-3 py-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 uppercase tracking-wider whitespace-nowrap"
              >
                {isHi ? "राज्य सांख्यिकी" : "STATE TELEMETRY"}
              </button>
              <button
                onClick={() => scrollToSection("architecture")}
                className="text-left px-3 py-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 uppercase tracking-wider whitespace-nowrap"
              >
                {isHi ? "डेटा पाइपलाइन" : "ARCHITECTURE"}
              </button>
              <button
                onClick={() => scrollToSection("faqs")}
                className="text-left px-3 py-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 uppercase tracking-wider whitespace-nowrap"
              >
                {isHi ? "एफएक्यू" : "FAQS"}
              </button>
              <button
                onClick={() => scrollToSection("contact")}
                className="text-left px-3 py-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 uppercase tracking-wider whitespace-nowrap"
              >
                {isHi ? "हेल्पलाइन" : "HELPLINE"}
              </button>
            </nav>

            <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex flex-col gap-2">
              <Link
                to="/public-map"
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-2 px-3 py-2.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-xs font-bold text-slate-800 dark:text-slate-200 whitespace-nowrap"
              >
                <Radio className="w-4 h-4 text-[#F46036] animate-pulse" />
                <span>{isHi ? "सार्वजनिक आपदा मानचित्र" : "Public Incident Map"}</span>
              </Link>
              <Link
                to="/register"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-2 px-3 py-2.5 rounded-lg bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 text-xs font-bold border border-amber-200 dark:border-amber-800 whitespace-nowrap"
              >
                <UserCheck className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                <span>{isHi ? "अधिकारी पंजीकरण" : "Register Department Personnel"}</span>
              </Link>
            </div>
          </div>
        )}
      </header>

      {/* 3. Hero Showcase Section (Government of India Institutional Layout) */}
      <section id="hero" className="relative h-auto bg-[#0B2545] text-white pt-12 pb-16 lg:pt-16 lg:pb-24 border-b border-slate-800 scroll-mt-28">
        {/* Subtle Ashoka Geometric Watermark */}
        <div className="absolute inset-0 pointer-events-none opacity-5 bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:20px_20px]" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            {/* Left Column (7 cols): Official Mandate & Entry Gateways */}
            <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
              {/* Statutory Banner Pill */}
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-900/80 border border-slate-700 text-amber-300 text-[11px] font-bold tracking-wide shadow-sm">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span>
                  {isHi
                    ? "भारत सरकार • आपदा प्रबंधन अधिनियम, 2005 (धारा 14 एवं 30) वैधानिक प्रणाली"
                    : "GOVERNMENT OF INDIA • DISASTER MANAGEMENT ACT, 2005 (SECS. 14 & 30)"}
                </span>
              </div>

              {/* Main Headline */}
              <div className="space-y-2">
                <h2 className="text-xs sm:text-sm font-bold uppercase tracking-widest text-slate-300">
                  {isHi ? "उत्तराखंड राज्य आपदा प्रबंधन प्राधिकरण (USDMA)" : "Uttarakhand State Disaster Management Authority"}
                </h2>
                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight leading-tight text-white font-serif">
                  {isHi ? (
                    <>
                      राष्ट्रीय आपदा जोखिम एवं <br />
                      <span className="text-[#F46036]">
                        पुनर्वास निर्णय समर्थन प्रणाली
                      </span>
                    </>
                  ) : (
                    <>
                      Multi-Hazard Risk & <br />
                      <span className="text-amber-400">
                        Relocation Decision Support System
                      </span>
                    </>
                  )}
                </h1>
              </div>

              {/* Sub-text paragraph */}
              <p className="text-sm sm:text-base text-slate-200 max-w-2xl mx-auto lg:mx-0 leading-relaxed font-normal">
                {isHi
                  ? "राज्य आपदा प्रबंधन प्राधिकरण (SDMA) एवं एनडीएमए के तत्वावधान में विकसित अधिकृत जीआईएस निर्णय मंच। भारतीय जनगणना 2026, भारतीय भूवैज्ञानिक सर्वेक्षण (GSI), तथा उपग्रह रिमोट सेंसिंग द्वारा जोशीमठ, केदारनाथ व हिमालयी घाटियों की 13,967 बस्तियों का सब-मीटर स्तर पर विश्लेषण।"
                  : "Authoritative Government of India GIS platform integrating Census 2026 demographic data, GSI landslide corridors, satellite basemaps, and AI blast simulation for proactive mountain risk governance and evacuation planning."}
              </p>

              {/* Two Distinct Entry Gateways (Public vs Officer) */}
              <div className="pt-2 grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-xl mx-auto lg:mx-0">
                {/* Gateway 1: Public Citizen */}
                <div
                  onClick={() => navigate("/public-map")}
                  className="p-4 rounded-xl bg-slate-900/90 border border-slate-700 hover:border-amber-400 transition-all cursor-pointer text-left group shadow-lg"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400 bg-amber-950/60 px-2 py-0.5 rounded border border-amber-800">
                      {isHi ? "नागरिक पोर्टल" : "Public Citizen"}
                    </span>
                    <Radio className="w-4 h-4 text-[#F46036] group-hover:scale-110 transition-transform" />
                  </div>
                  <h3 className="text-sm font-bold text-white group-hover:text-amber-300 transition-colors">
                    {isHi ? "सार्वजनिक आपदा मानचित्र" : "Public Risk & Shelter Map"}
                  </h3>
                  <p className="text-xs text-slate-300 mt-1 line-clamp-2">
                    {isHi
                      ? "वास्तविक समय मौसम अलर्ट, सुरक्षित आश्रय स्थल एवं सड़क अवरोध की स्थिति देखें।"
                      : "Live early warning advisories, safe evacuation shelters, and road passability status."}
                  </p>
                  <div className="mt-3 flex items-center text-[11px] font-bold text-amber-400 group-hover:underline">
                    <span>{isHi ? "मानचित्र खोलें" : "Launch Public Viewer"}</span>
                    <ChevronRight className="w-3.5 h-3.5 ml-1" />
                  </div>
                </div>

                {/* Gateway 2: Official Command Portal */}
                <div
                  onClick={() => handleEnterDashboard("/dashboard")}
                  className="p-4 rounded-xl bg-[#081930] border border-blue-900/80 hover:border-blue-400 transition-all cursor-pointer text-left group shadow-lg"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-blue-300 bg-blue-950/80 px-2 py-0.5 rounded border border-blue-800">
                      {isHi ? "अधिकारी क्रेडेंशियल" : "Official Command"}
                    </span>
                    <Lock className="w-4 h-4 text-amber-400 group-hover:scale-110 transition-transform" />
                  </div>
                  <h3 className="text-sm font-bold text-white group-hover:text-blue-300 transition-colors">
                    {isHi ? "कमांड डैशबोर्ड में प्रवेश" : "SEOC / District Command"}
                  </h3>
                  <p className="text-xs text-slate-300 mt-1 line-clamp-2">
                    {isHi
                      ? "पोस्टजीआईएस सिमुलेशन, एनडीएमए फॉर्म आईसीएस-201 एवं आपातकालीन सीएपी अलर्ट।"
                      : "PostGIS blast simulation, NDMA Form ICS-201 generation, and CAP broadcasts."}
                  </p>
                  <div className="mt-3 flex items-center text-[11px] font-bold text-blue-300 group-hover:underline">
                    <span>{isAuthenticated && is2FAVerified ? (isHi ? "डैशबोर्ड खोलें" : "Enter Dashboard") : (isHi ? "अधिकारी लॉगिन" : "Official Login")}</span>
                    <ChevronRight className="w-3.5 h-3.5 ml-1" />
                  </div>
                </div>
              </div>

              {/* Department Registration Footer Notice */}
              <div className="pt-2 flex flex-wrap items-center justify-center lg:justify-start gap-4 text-xs text-slate-300">
                <span className="flex items-center gap-1.5">
                  <UserCheck className="w-4 h-4 text-amber-400" />
                  {isHi ? "नया क्षेत्रीय अधिकारी अथवा विश्लेषक?" : "New Field Officer or Analyst?"}{" "}
                  <Link to="/register" className="text-amber-400 font-bold hover:underline ml-1">
                    {isHi ? "विभागीय आईडी पंजीकृत करें" : "Register Department ID →"}
                  </Link>
                </span>
                <span className="hidden sm:inline text-slate-600">|</span>
                <span className="flex items-center gap-1.5">
                  <Shield className="w-4 h-4 text-emerald-400" />
                  {isHi ? "सीईआरटी-इन 180-दिवसीय ऑडिट लेज़र" : "CERT-In 180-Day Ledger"}
                </span>
              </div>
            </div>

            {/* Right Showcase Column (5 cols) - Interactive GIS Module Showcase */}
            <div className="lg:col-span-5 relative flex flex-col items-center">
              {/* Laptop Shell Frame */}
              <div className="w-full max-w-lg bg-slate-950 rounded-2xl p-2.5 sm:p-3 shadow-2xl border-2 border-slate-700 relative group">
                {/* Laptop Camera Dot */}
                <div className="w-2 h-2 rounded-full bg-slate-700 mx-auto mb-2" />

                {/* Display Frame */}
                <div className="relative aspect-[16/10] rounded-lg overflow-hidden bg-slate-900 border border-slate-800">
                  {/* Active Slide Visual Card */}
                  <div className={`absolute inset-0 bg-gradient-to-br ${slides[activeSlide].accent} p-6 flex flex-col justify-between text-white transition-all duration-500`}>
                    <div className="flex items-center justify-between">
                      <span className="px-2.5 py-1 rounded-md bg-black/50 backdrop-blur-sm text-[10px] font-bold tracking-wider uppercase border border-white/20">
                        {slides[activeSlide].badge}
                      </span>
                      <div className="flex items-center gap-1.5 text-xs text-emerald-300 font-mono">
                        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                        <span>LIVE GIS</span>
                      </div>
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
                        <div className="text-lg font-mono font-bold text-amber-300">{slides[activeSlide].stats.primary}</div>
                        <div className="text-[10px] uppercase tracking-wider text-white/80">{slides[activeSlide].stats.label}</div>
                      </div>
                      <Link
                        to={
                          slides[activeSlide].id === "slide-3"
                            ? "/public-map?filter=shelters"
                            : slides[activeSlide].id === "slide-4"
                            ? "/public-map?layer=landslide"
                            : "/public-map"
                        }
                        className="px-3.5 py-1.5 bg-white text-slate-950 hover:bg-slate-100 rounded-md text-xs font-bold flex items-center gap-1.5 shadow transition-all"
                      >
                        <span>{isHi ? "मानचित्र खोलें" : "Launch GIS"}</span>
                        <ArrowUpRight className="w-3.5 h-3.5" />
                      </Link>
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
                  className="p-1.5 rounded-full bg-slate-900 hover:bg-slate-800 border border-slate-700 text-white transition shadow"
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
                        activeSlide === i ? "w-6 bg-[#F46036]" : "w-2 bg-slate-600 hover:bg-slate-400"
                      }`}
                      aria-label={`Go to slide ${i + 1}`}
                    />
                  ))}
                </div>

                <button
                  onClick={() => setActiveSlide((prev) => (prev + 1) % slides.length)}
                  className="p-1.5 rounded-full bg-slate-900 hover:bg-slate-800 border border-slate-700 text-white transition shadow"
                  aria-label="Next slide"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Statutory Mandate & Legal Framework Section */}
      <section id="mandate" className="py-14 sm:py-16 bg-white dark:bg-[#070D18] border-b border-slate-200 dark:border-slate-800 scroll-mt-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-12 space-y-3">
            <span className="text-xs font-bold text-[#0B2545] dark:text-blue-400 uppercase tracking-widest bg-blue-50 dark:bg-blue-950/60 px-3 py-1 rounded-full border border-blue-200 dark:border-blue-800">
              {isHi ? "वैधानिक जनादेश एवं कानूनी अधिकार" : "Statutory Authority & Institutional Mandate"}
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white font-serif">
              {isHi
                ? "आपदा प्रबंधन अधिनियम, 2005 के अंतर्गत विहित उत्तरदायित्व"
                : "Institutional Framework Under Disaster Management Act, 2005"}
            </h2>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              {isHi
                ? "राष्ट्रीय स्तर से जिला एवं ग्राम स्तर तक त्रि-स्तरीय निर्णय समर्थन प्रणाली"
                : "Tri-tier decision hierarchy synchronizing policy guidelines to ground incident operations."}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Tier 1: NDMA National Policy */}
            <div className="p-6 rounded-2xl bg-[#F8FAFC] dark:bg-[#0F172A] border border-slate-200 dark:border-slate-800 flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-950 text-[#0B2545] dark:text-blue-400 flex items-center justify-center font-bold mb-4">
                  <Shield className="w-5 h-5" />
                </div>
                <div className="text-[11px] font-bold text-blue-700 dark:text-blue-400 uppercase tracking-wider mb-1">
                  {isHi ? "राष्ट्रीय स्तर" : "National Tier (NDMA)"}
                </div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white mb-2">
                  {isHi ? "राष्ट्रीय आपदा प्रबंधन प्राधिकरण" : "National Policy & Standards"}
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                  {isHi
                    ? "राष्ट्रीय आपदा नीति, राष्ट्रीय सुदूर संवेदन केंद्र (NRSC) उपग्रह एकीकरण एवं कॉमन अलर्टिंग प्रोटोकॉल (CAP) मानक।"
                    : "Statutory national policies, NRSC satellite feeds, and multi-state Common Alerting Protocol (CAP) coordination under Section 6 of DMA 2005."}
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-slate-200 dark:border-slate-800 text-[11px] font-semibold text-slate-500">
                {isHi ? "अधिनियम 53 / 2005" : "DMA 2005 Sec. 6"}
              </div>
            </div>

            {/* Tier 2: SDMA State Authority */}
            <div className="p-6 rounded-2xl bg-[#F8FAFC] dark:bg-[#0F172A] border border-slate-200 dark:border-slate-800 flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 rounded-lg bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-400 flex items-center justify-center font-bold mb-4">
                  <Building2 className="w-5 h-5" />
                </div>
                <div className="text-[11px] font-bold text-[#F46036] dark:text-amber-400 uppercase tracking-wider mb-1">
                  {isHi ? "राज्य स्तर" : "State Tier (USDMA)"}
                </div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white mb-2">
                  {isHi ? "राज्य आपातकालीन संचालन केंद्र" : "State Emergency Operations (SEOC)"}
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                  {isHi
                    ? "उत्तराखंड राज्य आपातकालीन संचालन केंद्र (SEOC) द्वारा 13 जिलों की वास्तविक समय निगरानी एवं एसडीआरएफ तैनाती।"
                    : "Real-time state command centre in Dehradun coordinating inter-district resource allocation, SDRF rapid deployments, and state relief funds."}
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-slate-200 dark:border-slate-800 text-[11px] font-semibold text-slate-500">
                {isHi ? "अधिनियम 53 / 2005 धारा 14" : "DMA 2005 Sec. 14 & 22"}
              </div>
            </div>

            {/* Tier 3: DDMA District Level */}
            <div className="p-6 rounded-2xl bg-[#F8FAFC] dark:bg-[#0F172A] border border-slate-200 dark:border-slate-800 flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 rounded-lg bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400 flex items-center justify-center font-bold mb-4">
                  <Users className="w-5 h-5" />
                </div>
                <div className="text-[11px] font-bold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider mb-1">
                  {isHi ? "जिला स्तर" : "District Tier (DDMA)"}
                </div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white mb-2">
                  {isHi ? "जिला मजिस्ट्रेट / घटना कमांडर" : "District Incident Command"}
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                  {isHi
                    ? "जिला कलेक्टर द्वारा एनडीएमए प्रपत्र आईसीएस-201 का संपादन, सुरक्षित आश्रय स्थल आवंटन एवं स्थानीय निकासी निष्पादन।"
                    : "District Collector / Magistrate leadership commanding localized field operations, shelter management, and community early warning."}
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-slate-200 dark:border-slate-800 text-[11px] font-semibold text-slate-500">
                {isHi ? "अधिनियम 53 / 2005 धारा 30" : "DMA 2005 Sec. 30 & 34"}
              </div>
            </div>
          </div>

          {/* Statutory Powers & Enforcement Provisions (Dynamic Bilingual via t(...)) */}
          <div className="mt-10 pt-8 border-t border-slate-200 dark:border-slate-800 space-y-6">
            <div className="text-left space-y-1">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-amber-500/10 text-amber-600 dark:text-amber-400 text-xs font-bold border border-amber-500/20">
                <Scale className="w-3.5 h-3.5" />
                <span>{isHi ? "विधिक अधिकार व अनुपालन" : "Enforcement Powers & Penalties"}</span>
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white">
                {t("mandate.powers_title")}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {t("mandate.powers_subtitle")}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 rounded-xl bg-[#F8FAFC] dark:bg-[#0F172A] border border-slate-200 dark:border-slate-800 space-y-2 hover:border-blue-500/50 transition-colors">
                <span className="text-xs font-bold text-blue-700 dark:text-blue-400 block font-mono">
                  {t("mandate.sec34a_title")}
                </span>
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                  {t("mandate.sec34a_desc")}
                </p>
              </div>

              <div className="p-4 rounded-xl bg-[#F8FAFC] dark:bg-[#0F172A] border border-slate-200 dark:border-slate-800 space-y-2 hover:border-amber-500/50 transition-colors">
                <span className="text-xs font-bold text-amber-700 dark:text-amber-400 block font-mono">
                  {t("mandate.sec34c_title")}
                </span>
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                  {t("mandate.sec34c_desc")}
                </p>
              </div>

              <div className="p-4 rounded-xl bg-[#F8FAFC] dark:bg-[#0F172A] border border-slate-200 dark:border-slate-800 space-y-2 hover:border-emerald-500/50 transition-colors">
                <span className="text-xs font-bold text-emerald-700 dark:text-emerald-400 block font-mono">
                  {t("mandate.sec51_title")}
                </span>
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                  {t("mandate.sec51_desc")}
                </p>
              </div>

              <div className="p-4 rounded-xl bg-[#F8FAFC] dark:bg-[#0F172A] border border-slate-200 dark:border-slate-800 space-y-2 hover:border-rose-500/50 transition-colors">
                <span className="text-xs font-bold text-rose-700 dark:text-rose-400 block font-mono">
                  {t("mandate.sec54_title")}
                </span>
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                  {t("mandate.sec54_desc")}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5. Four Scientific Pillars (With Direct Dashboard Links) */}
      <section id="pillars" className="py-16 sm:py-20 bg-[#F8FAFC] dark:bg-[#0B2545]/30 border-b border-slate-200 dark:border-slate-800 scroll-mt-28 relative">
        <div id="modules" className="absolute -top-28 pointer-events-none" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-14 space-y-3">
            <span className="text-xs font-bold text-[#0B2545] dark:text-blue-400 uppercase tracking-widest bg-blue-50 dark:bg-blue-950/60 px-3 py-1 rounded-full border border-blue-200 dark:border-blue-800">
              {isHi ? "चार वैज्ञानिक स्तंभ" : "Four Core Scientific Pillars"}
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white font-serif">
              {isHi
                ? "आपदा न्यूनीकरण एवं त्वरित पुनर्वास हेतु वैज्ञानिक संरचना"
                : "Scientific Architecture for Disaster Risk Governance"}
            </h2>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              {isHi
                ? "प्रत्येक मॉड्यूल एनडीएमए एसओपी एवं भू-स्थानिक मानकों के अनुरूप सीधे कमान डैशबोर्ड से जुड़ा हुआ है।"
                : "Engineered under NDMA guidelines to deliver actionable early warnings and operational relocation logistics."}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Card 1: Landslide Vulnerability Mapping */}
            <div className="p-6 rounded-2xl bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-slate-800 hover:border-red-400 hover:shadow-xl transition-all group flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 rounded-xl bg-red-100 dark:bg-red-950/80 text-red-600 dark:text-red-400 flex items-center justify-center font-bold mb-4 group-hover:scale-110 transition-transform">
                  <Mountain className="w-6 h-6" />
                </div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white mb-2">
                  {isHi ? "भूस्खलन संवेदनशीलता मानचित्रण" : "Landslide Vulnerability Mapping"}
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed mb-4">
                  {isHi
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
                <span>{isHi ? "लाल/उच्च जोखिम फ़िल्टर" : "Red & High Risk Index"}</span>
                <ChevronRight className="w-4 h-4 group-hover:translate-x-1.5 transition-transform duration-200" />
              </div>
            </div>

            {/* Card 2: Cloudburst Inundation Analytics */}
            <div className="p-6 rounded-2xl bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-slate-800 hover:border-blue-400 hover:shadow-xl transition-all group flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 rounded-xl bg-blue-100 dark:bg-blue-950/80 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold mb-4 group-hover:scale-110 transition-transform">
                  <Waves className="w-6 h-6" />
                </div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white mb-2">
                  {isHi ? "बादल फटना एवं जलप्लावन विश्लेषण" : "Cloudburst Inundation Analytics"}
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed mb-4">
                  {isHi
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
                <span>{isHi ? "जलप्लावन स्तर" : "Flash Flood Corridors"}</span>
                <ChevronRight className="w-4 h-4 group-hover:translate-x-1.5 transition-transform duration-200" />
              </div>
            </div>

            {/* Card 3: Evacuation Shelter Allocation */}
            <div className="p-6 rounded-2xl bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-slate-800 hover:border-emerald-400 hover:shadow-xl transition-all group flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 rounded-xl bg-emerald-100 dark:bg-emerald-950/80 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold mb-4 group-hover:scale-110 transition-transform">
                  <Building2 className="w-6 h-6" />
                </div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white mb-2">
                  {isHi ? "सुरक्षित आश्रय स्थल आवंटन" : "Evacuation Shelter Allocation"}
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed mb-4">
                  {isHi
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
                <span>{isHi ? "सत्यापित शिविर" : "42K Capacity Transit Camps"}</span>
                <ChevronRight className="w-4 h-4 group-hover:translate-x-1.5 transition-transform duration-200" />
              </div>
            </div>

            {/* Card 4: AI Scenario Blast Simulation */}
            <div className="p-6 rounded-2xl bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-slate-800 hover:border-purple-400 hover:shadow-xl transition-all group flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 rounded-xl bg-purple-100 dark:bg-purple-950/80 text-purple-600 dark:text-purple-400 flex items-center justify-center font-bold mb-4 group-hover:scale-110 transition-transform">
                  <Activity className="w-6 h-6" />
                </div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white mb-2">
                  {isHi ? "एआई परिदृश्य प्रभाव सिमुलेटर" : "AI Scenario Blast Simulation"}
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed mb-4">
                  {isHi
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
                <span>{isHi ? "आईसीएस-201 कार्य योजना" : "NDMA ICS-201 Action Plan"}</span>
                <ChevronRight className="w-4 h-4 group-hover:translate-x-1.5 transition-transform duration-200" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 6. Live Operational State Telemetry & Statistics (Authoritative Data Strip) */}
      <section id="statistics" className="py-14 bg-[#0B2545] text-white border-b border-slate-800 relative scroll-mt-28">
        <div id="telemetry" className="absolute -top-28 pointer-events-none" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-8 pb-4 border-b border-slate-700/80">
            <div>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                <h3 className="text-base font-bold tracking-tight">
                  {isHi ? "उत्तराखंड राज्य वास्तविक समय टेलीमेट्री एवं जोखिम सांख्यिकी" : "Uttarakhand Real-Time State Telemetry & Operational Metrics"}
                </h3>
              </div>
              <p className="text-xs text-slate-300 mt-0.5">
                {isHi ? "स्रोत: राज्य आपदा प्रबंधन प्राधिकरण, जनगणना 2026 एवं भारतीय भूवैज्ञानिक सर्वेक्षण" : "Official Source: SDMA Uttarakhand, Census 2026, and Geological Survey of India"}
              </p>
            </div>
            <div className="flex items-center gap-2 text-xs font-mono text-slate-300 bg-slate-900/60 px-3 py-1.5 rounded border border-slate-700">
              <span>SYNC STATUS:</span>
              <span className="text-emerald-400 font-bold">100% POSTGIS ACTIVE</span>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {/* Card 1: 13,967 (Amber) */}
            <div className="group relative overflow-hidden bg-slate-900/60 dark:bg-slate-900/70 border border-slate-800/80 rounded-2xl p-5 sm:p-6 transition-all duration-300 ease-out hover:-translate-y-1.5 hover:shadow-2xl hover:border-amber-500/50 hover:shadow-amber-500/10 cursor-default text-amber-500">
              <div className="absolute -top-12 -right-12 w-28 h-28 rounded-full blur-2xl opacity-0 group-hover:opacity-20 transition-opacity duration-500 pointer-events-none bg-amber-400" />
              <div className="flex items-center gap-1.5 mb-3">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
                <span className="text-[10px] font-bold font-mono tracking-wider uppercase text-amber-400/90 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20">
                  GIS Layer Indexed
                </span>
              </div>
              <div className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight font-mono text-amber-400 mb-1.5 group-hover:scale-105 transition-transform duration-300 origin-left">
                <CountUpNumber target={13967} />
              </div>
              <div className="text-xs font-bold text-slate-200 uppercase tracking-wider">
                {isHi ? "कुल मूल्यांकित बस्तियाँ" : "Habitations Scored"}
              </div>
              <div className="text-[11px] text-slate-400 mt-1">
                {isHi ? "सभी 13 जनपद" : "All 13 Districts"}
              </div>
            </div>

            {/* Card 2: 1,340,000+ (Rose/Coral) */}
            <div className="group relative overflow-hidden bg-slate-900/60 dark:bg-slate-900/70 border border-slate-800/80 rounded-2xl p-5 sm:p-6 transition-all duration-300 ease-out hover:-translate-y-1.5 hover:shadow-2xl hover:border-rose-500/50 hover:shadow-rose-500/10 cursor-default text-rose-500">
              <div className="absolute -top-12 -right-12 w-28 h-28 rounded-full blur-2xl opacity-0 group-hover:opacity-20 transition-opacity duration-500 pointer-events-none bg-rose-400" />
              <div className="flex items-center gap-1.5 mb-3">
                <span className="w-1.5 h-1.5 rounded-full bg-rose-400 animate-pulse" />
                <span className="text-[10px] font-bold font-mono tracking-wider uppercase text-rose-400/90 bg-rose-500/10 px-2 py-0.5 rounded-full border border-rose-500/20">
                  High Exposure Alert
                </span>
              </div>
              <div className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight font-mono text-rose-400 mb-1.5 group-hover:scale-105 transition-transform duration-300 origin-left">
                <CountUpNumber target={1340000} suffix="+" />
              </div>
              <div className="text-xs font-bold text-slate-200 uppercase tracking-wider">
                {isHi ? "संवेदनशील आबादी" : "Vulnerable Population"}
              </div>
              <div className="text-[11px] text-slate-400 mt-1">
                {isHi ? "लाल व उच्च जोखिम" : "Red & High Corridors"}
              </div>
            </div>

            {/* Card 3: 20 (Emerald) */}
            <div className="group relative overflow-hidden bg-slate-900/60 dark:bg-slate-900/70 border border-slate-800/80 rounded-2xl p-5 sm:p-6 transition-all duration-300 ease-out hover:-translate-y-1.5 hover:shadow-2xl hover:border-emerald-500/50 hover:shadow-emerald-500/10 cursor-default text-emerald-500">
              <div className="absolute -top-12 -right-12 w-28 h-28 rounded-full blur-2xl opacity-0 group-hover:opacity-20 transition-opacity duration-500 pointer-events-none bg-emerald-400" />
              <div className="flex items-center gap-1.5 mb-3">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-[10px] font-bold font-mono tracking-wider uppercase text-emerald-400/90 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                  Active Transits
                </span>
              </div>
              <div className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight font-mono text-emerald-400 mb-1.5 group-hover:scale-105 transition-transform duration-300 origin-left">
                <CountUpNumber target={20} />
              </div>
              <div className="text-xs font-bold text-slate-200 uppercase tracking-wider">
                {isHi ? "सुरक्षित राहत शिविर" : "Verified Shelters"}
              </div>
              <div className="text-[11px] text-slate-400 mt-1">
                {isHi ? "42,000 सुरक्षित क्षमता" : "42,000 Verified Placements"}
              </div>
            </div>

            {/* Card 4: 100% (Sky Blue) */}
            <div className="group relative overflow-hidden bg-slate-900/60 dark:bg-slate-900/70 border border-slate-800/80 rounded-2xl p-5 sm:p-6 transition-all duration-300 ease-out hover:-translate-y-1.5 hover:shadow-2xl hover:border-sky-500/50 hover:shadow-sky-500/10 cursor-default text-sky-500">
              <div className="absolute -top-12 -right-12 w-28 h-28 rounded-full blur-2xl opacity-0 group-hover:opacity-20 transition-opacity duration-500 pointer-events-none bg-sky-400" />
              <div className="flex items-center gap-1.5 mb-3">
                <span className="w-1.5 h-1.5 rounded-full bg-sky-400 animate-pulse" />
                <span className="text-[10px] font-bold font-mono tracking-wider uppercase text-sky-400/90 bg-sky-500/10 px-2 py-0.5 rounded-full border border-sky-500/20">
                  Audited Standard
                </span>
              </div>
              <div className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight font-mono text-sky-400 mb-1.5 group-hover:scale-105 transition-transform duration-300 origin-left">
                <CountUpNumber target={100} suffix="%" />
              </div>
              <div className="text-xs font-bold text-slate-200 uppercase tracking-wider">
                {isHi ? "गीग्व 3.0 सुलभता" : "GIGW 3.0 / WCAG"}
              </div>
              <div className="text-[11px] text-slate-400 mt-1">
                {isHi ? "द्विभाषी एवं स्क्रीन रीडर" : "Bilingual Screen Reader"}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 7. System Architecture & Ingestion Pipeline */}
      <section id="architecture" className="py-16 bg-white dark:bg-[#070D18] border-b border-slate-200 dark:border-slate-800 scroll-mt-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-5">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-950/60 text-[#0B2545] dark:text-blue-400 text-xs font-bold border border-blue-200 dark:border-blue-800">
                <Database className="w-3.5 h-3.5" />
                <span>{isHi ? "प्रणाली वास्तुकला एवं डेटा पाइपलाइन" : "System Architecture & Data Ingestion Pipeline"}</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white leading-tight font-serif">
                {isHi
                  ? "उपग्रह डेटा से फील्ड निकासी तक एकीकृत निर्णय प्रवाह"
                  : "From Satellite Observations to Ground Evacuation Execution"}
              </h2>
              <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                {isHi
                  ? "रिस्कओएस प्रणाली राष्ट्रीय सुदूर संवेदन केंद्र (NRSC), भारतीय भूवैज्ञानिक सर्वेक्षण (GSI) तथा भारतीय जनगणना 2026 के आंकड़ों को पोस्टजीआईएस (PostGIS) स्थानिक डेटाबेस में संयोजित करती है। अधिकृत अधिकारी 60 सेकंड के भीतर औपचारिक आईसीएस-201 कार्य योजना और सीएपी अलर्ट जारी कर सकते हैं।"
                  : "RiskOS fuses remote sensing layers, digital elevation models, and socio-economic vulnerability indicators into an authoritative PostGIS spatial cluster. Emergency response officials evaluate dynamic shockwave buffers and dispatch Common Alerting Protocol (CAP) notifications in under 60 seconds."}
              </p>

              <div className="space-y-3 pt-2">
                <div className="flex items-start gap-3 p-3.5 rounded-lg bg-[#F8FAFC] dark:bg-[#0F172A] border border-slate-200 dark:border-slate-800">
                  <div className="w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-900/60 text-[#0B2545] dark:text-blue-300 font-bold text-xs flex items-center justify-center flex-shrink-0 mt-0.5">
                    1
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                      {isHi ? "बहु-स्रोत उपग्रह एवं कैडस्ट्रल अंतर्ग्रहण" : "Multi-Source Satellite & Cadastral Vector Ingestion"}
                    </h4>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">
                      High-resolution Esri World Imagery, OpenStreetMap cadastre, Survey of India inviolable boundaries, and 13,967 habitation point vectors.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3.5 rounded-lg bg-[#F8FAFC] dark:bg-[#0F172A] border border-slate-200 dark:border-slate-800">
                  <div className="w-6 h-6 rounded-full bg-purple-100 dark:bg-purple-900/60 text-purple-700 dark:text-purple-300 font-bold text-xs flex items-center justify-center flex-shrink-0 mt-0.5">
                    2
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                      {isHi ? "पोस्टजीआईएस स्थानिक क्वेरी व त्रि-स्तरीय ज़ोनिंग" : "PostGIS Spatial Queries & 3-Tier Zoning"}
                    </h4>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">
                      Direct Hit (Zone 1), High Alert (Zone 2), and Advisory (Zone 3) distance intersections computed with millisecond geodesic buffering.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3.5 rounded-lg bg-[#F8FAFC] dark:bg-[#0F172A] border border-slate-200 dark:border-slate-800">
                  <div className="w-6 h-6 rounded-full bg-emerald-100 dark:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300 font-bold text-xs flex items-center justify-center flex-shrink-0 mt-0.5">
                    3
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                      {isHi ? "स्वचालित राहत शिविर मिलान एवं सीएपी प्रसारण" : "Shelter Allocation, ICS-201 & CAP Broadcast"}
                    </h4>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">
                      Automated capacity reservation to 20 strategic camps, tamper-evident CERT-In cryptographic audit hashes, and SMS alerting.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Officer Workflow Command Card */}
            <div className="p-8 rounded-3xl bg-[#0B2545] text-white shadow-2xl border border-blue-900/80 space-y-6">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold px-3 py-1 rounded-full bg-[#F46036] text-white">
                  NIC & SDMA Standards
                </span>
                <span className="text-xs text-blue-300 font-mono">GOI-DSS-2026</span>
              </div>

              <div className="space-y-3">
                <h3 className="text-2xl font-bold font-serif">
                  {isHi ? "आधिकारिक परिचालन पोर्टल" : "Statutory Emergency Operations"}
                </h3>
                <p className="text-xs text-slate-300 leading-relaxed">
                  {isHi
                    ? "यह पोर्टल राज्य आपदा प्रबंधन प्राधिकरण, उत्तराखंड एवं गृह मंत्रालय (MHA) के तत्वावधान में संचालित है। अधिकृत अधिकारी एवं जिला मजिस्ट्रेट 2FA प्रमाणीकरण के साथ कमांड डैशबोर्ड में प्रवेश कर सकते हैं।"
                    : "Authorized disaster management officers, District Magistrates, and field teams utilize the secure workspace for emergency action plan execution and inter-agency coordination."}
                </p>
              </div>

              <div className="pt-4 border-t border-slate-700 flex flex-col sm:flex-row gap-3">
                <button
                  onClick={() => handleEnterDashboard("/dashboard")}
                  className="w-full py-3 bg-white text-slate-950 hover:bg-slate-100 font-extrabold text-xs rounded-xl shadow transition flex items-center justify-center gap-2"
                >
                  <Compass className="w-4 h-4 text-[#0B2545]" />
                  <span>{isHi ? "कमांड डैशबोर्ड खोलें" : "Launch GIS Dashboard"}</span>
                </button>

                <button
                  onClick={() => navigate("/login?redirect=%2Fdashboard")}
                  className="w-full py-3 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl border border-slate-700 transition flex items-center justify-center gap-2"
                >
                  <Lock className="w-3.5 h-3.5 text-amber-400" />
                  <span>{isHi ? "अधिकारी लॉगिन" : "Official Officer Login"}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 8. Interactive FAQ Accordion Section */}
      <section id="faqs" className="py-16 sm:py-20 bg-[#F8FAFC] dark:bg-[#0A1220] border-b border-slate-200 dark:border-slate-800 scroll-mt-28">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12 space-y-3">
            <span className="text-xs font-bold text-[#0B2545] dark:text-blue-400 uppercase tracking-widest bg-blue-50 dark:bg-blue-950/60 px-3 py-1 rounded-full border border-blue-200 dark:border-blue-800">
              {isHi ? "सामान्य प्रश्न एवं दिशानिर्देश" : "Frequently Asked Questions"}
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white font-serif">
              {isHi
                ? "प्रणाली कार्यप्रणाली एवं वैधानिक मार्गदर्शन"
                : "Operational Guidelines & Statutory Answers"}
            </h2>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              {isHi
                ? "नागरिकों, जिला कलेक्टरों और क्षेत्रीय अधिकारियों हेतु सामान्य प्रश्नों के आधिकारिक उत्तर"
                : "Authoritative answers for citizens, district magistrates, and disaster response teams."}
            </p>
          </div>

          <div className="space-y-3">
            {faqs.map((faq, index) => {
              const isOpen = openFaq === index;
              return (
                <div
                  key={index}
                  className="rounded-xl bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm transition-all"
                >
                  <button
                    onClick={() => toggleFaq(index)}
                    className="w-full px-5 py-4 text-left flex items-center justify-between gap-4 font-bold text-sm text-slate-900 dark:text-white hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors focus:outline-none focus:ring-1 focus:ring-blue-500"
                    aria-expanded={isOpen}
                  >
                    <span className="flex items-center gap-3">
                      <HelpCircle className="w-4 h-4 text-[#F46036] flex-shrink-0" />
                      <span>{faq.q}</span>
                    </span>
                    <ChevronDown
                      className={`w-4 h-4 text-slate-500 transition-transform duration-200 flex-shrink-0 ${
                        isOpen ? "rotate-180 text-blue-600" : ""
                      }`}
                    />
                  </button>
                  {isOpen && (
                    <div className="px-5 pb-5 pt-2 text-xs text-slate-600 dark:text-slate-300 leading-relaxed border-t border-slate-100 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-900/30">
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 9. Contact / SEOC Direct Dial Emergency Helpline Strip */}
      <section id="contact" className="py-10 bg-white dark:bg-[#0B2545]/40 border-b border-slate-200 dark:border-slate-800 scroll-mt-28 relative">
        <div id="helpline" className="absolute -top-28 pointer-events-none" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6 text-center md:text-left">
            <div>
              <div className="flex items-center justify-center md:justify-start gap-2">
                <PhoneCall className="w-4 h-4 text-red-600 dark:text-red-400" />
                <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                  {isHi ? "राज्य आपातकालीन संचालन केंद्र (SEOC) 24x7 हेल्पलाइन" : "State Emergency Operations Centre (SEOC) 24x7 Direct Helplines"}
                </h4>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Uttarakhand State Disaster Management Authority, Secretariat, Subhash Road, Dehradun - 248001
              </p>
            </div>
            <div className="flex flex-wrap items-center justify-center gap-3">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg bg-red-100 dark:bg-red-950/80 text-red-700 dark:text-red-300 font-bold font-mono text-xs border border-red-300 dark:border-red-800">
                <span>Toll Free:</span>
                <a
                  href="tel:1070"
                  className="hover:underline focus:outline-none focus:ring-1 focus:ring-red-500 rounded px-0.5 cursor-pointer font-bold"
                  title="Dial State Emergency Helpline 1070"
                  aria-label="Dial State Emergency Helpline 1070"
                >
                  1070
                </a>
                <span>/</span>
                <a
                  href="tel:1077"
                  className="hover:underline focus:outline-none focus:ring-1 focus:ring-red-500 rounded px-0.5 cursor-pointer font-bold"
                  title="Dial District Emergency Helpline 1077"
                  aria-label="Dial District Emergency Helpline 1077"
                >
                  1077
                </a>
              </div>
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg bg-blue-100 dark:bg-blue-950/80 text-blue-700 dark:text-blue-300 font-bold font-mono text-xs border border-blue-300 dark:border-blue-800">
                <span>SEOC Secretariat:</span>
                <a
                  href="tel:+911352710334"
                  className="hover:underline focus:outline-none focus:ring-1 focus:ring-blue-500 rounded px-0.5 cursor-pointer font-bold"
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

      {/* 10. Official GIGW Compliance Footer */}
      <GoiFooter />
    </div>
  );
}

function CountUpNumber({
  target,
  suffix = "",
  prefix = "",
}: {
  target: number;
  suffix?: string;
  prefix?: string;
}) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const started = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting && !started.current) {
          started.current = true;
          const duration = 1600;
          const startTime = performance.now();

          const animate = (currentTime: number) => {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            // Ease-out cubic
            const easeOut = 1 - Math.pow(1 - progress, 3);
            const currentVal = Math.floor(easeOut * target);
            setCount(currentVal);

            if (progress < 1) {
              requestAnimationFrame(animate);
            } else {
              setCount(target);
            }
          };

          requestAnimationFrame(animate);
        }
      },
      { threshold: 0.15 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [target]);

  return (
    <span ref={ref}>
      {prefix}
      {count.toLocaleString()}
      {suffix}
    </span>
  );
}
