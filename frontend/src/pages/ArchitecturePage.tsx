import { Link } from "react-router-dom";
import { Database, Server, Cpu, ShieldCheck, ChevronRight, Layers } from "lucide-react";
import GoiTopBar from "../components/GoiTopBar";
import GoiBrandHeader from "../components/GoiBrandHeader";
import GoiFooter from "../components/GoiFooter";
import { useTranslation } from "../i18n/translations";

export default function ArchitecturePage() {
  const { lang } = useTranslation();
  const isHi = lang === "hi";

  return (
    <div className="min-h-screen flex flex-col bg-[#070D18] text-slate-100 font-sans transition-colors selection:bg-[#0B2545] selection:text-white">
      <GoiTopBar />
      <GoiBrandHeader showNav activeNav="architecture" />

      {/* Breadcrumb Navigation Strip */}
      <div className="w-full bg-slate-900/80 border-b border-slate-800 py-2.5 px-4 sm:px-6 lg:px-12 text-xs">
        <div className="max-w-7xl mx-auto flex items-center gap-2 text-slate-400">
          <Link to="/" className="hover:text-blue-400 font-medium">
            {isHi ? "मुखपृष्ठ" : "Home"}
          </Link>
          <ChevronRight className="w-3.5 h-3.5 text-slate-500" />
          <span className="text-white font-bold">
            {isHi ? "प्रणाली वास्तुकला एवं डेटा पाइपलाइन" : "System Architecture & Data Pipeline"}
          </span>
        </div>
      </div>

      {/* Hero Banner Section */}
      <section className="bg-gradient-to-br from-[#0B2545] via-[#103058] to-[#081930] text-white py-12 px-4 sm:px-6 lg:px-12 border-b border-slate-800">
        <div className="max-w-7xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 text-xs font-bold border border-indigo-500/30">
            <Database className="w-3.5 h-3.5" />
            <span>PostGIS Geodesic GIS Engine • Level 4 Pipeline</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-black font-serif tracking-tight text-white">
            {isHi ? "प्रणाली वास्तुकला एवं डेटा अंतर्ग्रहण पाइपलाइन" : "System Architecture & Geospatial Ingestion Pipeline"}
          </h1>
          <p className="text-slate-300 text-sm sm:text-base max-w-3xl leading-relaxed">
            {isHi
              ? "उपग्रह सुदूर संवेदन डेटा से लेकर ज़मीनी स्तर पर निकासी निष्पादन तक निर्बाध निर्णय प्रवाह। पोस्टजीआईएस, जंगो रेस्ट फ्रेमवर्क तथा रिएक्ट आर्किटेक्चर।"
              : "High-performance spatial compute pipeline ingesting satellite telemetry, calculating geodesic shockwaves, and dispatching NDMA ICS-201 plans and CAP broadcasts in sub-second latency."}
          </p>
        </div>
      </section>

      {/* Main Content Body */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-12 py-10 space-y-12">
        {/* Step-by-Step Architecture Pipeline */}
        <section className="space-y-6">
          <div className="space-y-1">
            <h2 className="text-xl sm:text-2xl font-black text-white font-serif">
              {isHi ? "त्रि-स्तरीय डेटा अंतर्ग्रहण एवं प्रसंस्करण प्रवाह" : "Three-Stage Data Ingestion & Processing Flow"}
            </h2>
            <p className="text-xs sm:text-sm text-slate-400">
              {isHi ? "उपग्रह रिमोट सेंसिंग से फील्ड कमांड तक" : "From remote sensing feeds to on-ground rescue unit coordination"}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-sm space-y-4">
              <div className="w-10 h-10 rounded-xl bg-blue-950 text-blue-400 font-bold flex items-center justify-center">
                1
              </div>
              <h3 className="text-base font-bold text-white">
                {isHi ? "बहु-स्रोत उपग्रह एवं कैडस्ट्रल अंतर्ग्रहण" : "Multi-Source Satellite & Vector Ingestion"}
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                {isHi
                  ? "इसरो भुवन एनआरएससी परतें, एसरी वर्ल्ड इमेजरी, भारतीय सर्वेक्षण विभाग (SOI) की अपरिवर्तनीय सीमाएं तथा 13,967 ग्रामीण बस्तियों के बिंदु वैक्टर।"
                  : "High-resolution satellite hybrid basemaps, official Survey of India boundary vectors, and cadastre layers dynamically validated against EPSG:4326."}
              </p>
              <div className="pt-3 border-t border-slate-800 text-[11px] text-slate-400 font-mono">
                EPSG:4326 / WGS 84 • GeoJSON & Shapefile Ingestion
              </div>
            </div>

            <div className="p-6 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-sm space-y-4">
              <div className="w-10 h-10 rounded-xl bg-purple-950 text-purple-400 font-bold flex items-center justify-center">
                2
              </div>
              <h3 className="text-base font-bold text-white">
                {isHi ? "पोस्टजीआईएस स्थानिक क्वेरी व त्रि-स्तरीय ज़ोनिंग" : "PostGIS Spatial Engine & 3-Tier Zoning"}
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                {isHi
                  ? "घटना केंद्र से 1 से 50 किमी की गतिशील प्रभाव त्रिज्या। ज़ोन 1 (प्रत्यक्ष प्रभाव: 0-5 किमी), ज़ोन 2 (उच्च चेतावनी: 5-15 किमी), तथा ज़ोन 3 (परामर्श: 15-50 किमी)।"
                  : "Millisecond geodesic buffering calculating concentric impact zones, querying census demographics, and estimating vulnerable kutcha structures."}
              </p>
              <div className="pt-3 border-t border-slate-800 text-[11px] text-slate-400 font-mono">
                PostGIS 3.4 • ST_DWithin & Geodesic Buffers
              </div>
            </div>

            <div className="p-6 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-sm space-y-4">
              <div className="w-10 h-10 rounded-xl bg-emerald-950 text-emerald-400 font-bold flex items-center justify-center">
                3
              </div>
              <h3 className="text-base font-bold text-white">
                {isHi ? "स्वचालित आश्रय मिलान एवं सीएपी प्रसारण" : "Shelter Allocation, ICS-201 & CAP"}
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                {isHi
                  ? "20 सुरक्षित राहत शिविरों की क्षमता का तत्काल मिलान, सीईआरटी-इन संगत 180-दिवसीय ऑडिट लेज़र ब्लॉकचेन हैश तथा डिजिटल हस्ताक्षर युक्त आईसीएस-201 पीडीएफ।"
                  : "Automated logistics capacity reservation, SHA-256 tamper-evident audit blocks, and instant multi-channel Common Alerting Protocol dispatch."}
              </p>
              <div className="pt-3 border-t border-slate-800 text-[11px] text-slate-400 font-mono">
                SHA-256 Ledger • NDMA Form ICS-201
              </div>
            </div>
          </div>
        </section>

        {/* Technical Stack Specifications */}
        <section className="bg-slate-900/90 rounded-2xl border border-slate-800 p-6 sm:p-8 space-y-6">
          <div className="space-y-1">
            <h3 className="text-lg font-bold text-white">
              {isHi ? "तकनीकी स्टैक एवं अवसंरचना" : "Technical Stack & Infrastructure"}
            </h3>
            <p className="text-xs text-slate-400">
              Enterprise Government of India specifications compliant with GIGW 3.0 and MeitY Guidelines
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="p-4 rounded-xl bg-slate-800/60 border border-slate-700/60 space-y-2">
              <span className="font-bold text-white flex items-center gap-2">
                <Server className="w-4 h-4 text-blue-400" />
                <span>Backend Spatial Infrastructure</span>
              </span>
              <p className="text-slate-300 leading-relaxed">
                PostgreSQL with PostGIS spatial extension on Render cloud. Django REST Framework 3.15 microservice API endpoints with JWT session authentication.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-slate-800/60 border border-slate-700/60 space-y-2">
              <span className="font-bold text-white flex items-center gap-2">
                <Cpu className="w-4 h-4 text-emerald-400" />
                <span>Frontend GIS Engine</span>
              </span>
              <p className="text-slate-300 leading-relaxed">
                React 18, Vite 5, Tailwind CSS, Leaflet/MapLibre GL with sub-meter vector rendering, client-side clustering, and offline SDC vector tile fallback.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-slate-800/60 border border-slate-700/60 space-y-2">
              <span className="font-bold text-white flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-amber-400" />
                <span>Security & Statutory Compliance</span>
              </span>
              <p className="text-slate-300 leading-relaxed">
                Survey of India Inviolable Boundary overlay, CERT-In 180-day tamper-evident ledger proofs, and Jan Parichay National SSO 2.0 integration.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-slate-800/60 border border-slate-700/60 space-y-2">
              <span className="font-bold text-white flex items-center gap-2">
                <Layers className="w-4 h-4 text-indigo-400" />
                <span>Accessibility Standards</span>
              </span>
              <p className="text-slate-300 leading-relaxed">
                GIGW 3.0 / WCAG 2.1 AA certified with 100% English & Hindi bilingualism, ARIA-live screen reader hooks, and keyboard navigation shortcuts.
              </p>
            </div>
          </div>
        </section>
      </main>

      <GoiFooter />
    </div>
  );
}
