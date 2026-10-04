import { Link } from "react-router-dom";
import { Map, Shield, FileText, Phone, CornerDownRight } from "lucide-react";
import GoiTopBar from "../components/GoiTopBar";
import GoiFooter from "../components/GoiFooter";
import { useTranslation } from "../i18n/translations";

export default function Sitemap() {
  const { lang } = useTranslation();
  const isHi = lang === "hi";

  return (
    <div id="main-content" className="min-h-screen flex flex-col bg-slate-50 dark:bg-[#0a0f1d] text-slate-900 dark:text-slate-100 font-sans transition-colors">
      <GoiTopBar />

      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        {/* Header */}
        <div className="border-b border-slate-200 dark:border-slate-800 pb-5 mb-8">
          <div className="flex items-center gap-2.5 text-xs text-blue-700 dark:text-blue-400 font-semibold mb-2">
            <Link to="/" className="hover:underline">{isHi ? "मुख्य पृष्ठ" : "Home"}</Link>
            <span>/</span>
            <span className="text-slate-500">{isHi ? "साइटमैप" : "Sitemap"}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#0B2545] dark:text-white">
            {isHi ? "पोर्टल साइटमैप (Sitemap)" : "Statutory Portal Sitemap"}
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            {isHi
              ? "भारत सरकार (GIGW 3.0) मानकों के अंतर्गत संपूर्ण वेबसाइट संरचना एवं नेविगेशन अनुक्रमणिका।"
              : "Complete hierarchical navigation index of RiskOS under Government of India (GIGW 3.0) guidelines."}
          </p>
        </div>

        {/* Sitemap Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-xs">
          {/* Section 1: Main Portals & Views */}
          <section className="bg-white dark:bg-[#131e36] p-6 rounded-2xl border border-slate-300 dark:border-slate-800 shadow-sm space-y-4">
            <h2 className="text-sm font-bold text-[#0B2545] dark:text-white flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-2">
              <Map className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              <span>{isHi ? "1. मुख्य पोर्टल एवं डैशबोर्ड" : "1. Primary Portals & Map Interfaces"}</span>
            </h2>
            <ul className="space-y-2.5 pl-2">
              <li className="flex items-center gap-2">
                <CornerDownRight className="w-3.5 h-3.5 text-slate-400" />
                <Link to="/" className="font-semibold text-blue-700 dark:text-blue-400 hover:underline">
                  {isHi ? "मुख्य लैंडिंग पृष्ठ (Home Portal)" : "Home Portal & Scientific Overview"}
                </Link>
              </li>
              <li className="flex items-center gap-2">
                <CornerDownRight className="w-3.5 h-3.5 text-slate-400" />
                <Link to="/public-map" className="font-semibold text-blue-700 dark:text-blue-400 hover:underline">
                  {isHi ? "सार्वजनिक नागरिक मानचित्र (Public Hazard Viewer)" : "Public Citizen Hazard Map"}
                </Link>
              </li>
              <li className="flex items-center gap-2">
                <CornerDownRight className="w-3.5 h-3.5 text-slate-400" />
                <Link to="/login" className="font-semibold text-blue-700 dark:text-blue-400 hover:underline">
                  {isHi ? "अधिकारी सुरक्षित लॉगिन (Official Single Sign-On)" : "Official Disaster Authority Login"}
                </Link>
              </li>
              <li className="flex items-center gap-2">
                <CornerDownRight className="w-3.5 h-3.5 text-slate-400" />
                <Link to="/dashboard" className="font-semibold text-blue-700 dark:text-blue-400 hover:underline">
                  {isHi ? "राज्य कमांड सेंटर (Executive Operations Desk)" : "SDMA Command Centre Dashboard"}
                </Link>
              </li>
            </ul>
          </section>

          {/* Section 2: Core Analytical & Scientific Modules */}
          <section className="bg-white dark:bg-[#131e36] p-6 rounded-2xl border border-slate-300 dark:border-slate-800 shadow-sm space-y-4">
            <h2 className="text-sm font-bold text-[#0B2545] dark:text-white flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-2">
              <Shield className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span>{isHi ? "2. मुख्य वैज्ञानिक एवं विश्लेषणात्मक मॉड्यूल" : "2. Scientific Pillars & DSS Modules"}</span>
            </h2>
            <ul className="space-y-2.5 pl-2">
              <li className="flex items-center gap-2">
                <CornerDownRight className="w-3.5 h-3.5 text-slate-400" />
                <Link to="/dashboard?tab=risk-map&layer=landslide" className="font-semibold text-blue-700 dark:text-blue-400 hover:underline">
                  {isHi ? "भूस्खलन सुभेद्यता मानचित्रण (Landslide Vulnerability)" : "Landslide Vulnerability Susceptibility"}
                </Link>
              </li>
              <li className="flex items-center gap-2">
                <CornerDownRight className="w-3.5 h-3.5 text-slate-400" />
                <Link to="/dashboard?tab=risk-map&layer=flood" className="font-semibold text-blue-700 dark:text-blue-400 hover:underline">
                  {isHi ? "बादल फटना एवं बाढ़ विश्लेषण (Cloudburst Inundation)" : "Cloudburst Flash Flood Inundation"}
                </Link>
              </li>
              <li className="flex items-center gap-2">
                <CornerDownRight className="w-3.5 h-3.5 text-slate-400" />
                <Link to="/dashboard?tab=risk-map&facility=SHELTER" className="font-semibold text-blue-700 dark:text-blue-400 hover:underline">
                  {isHi ? "सुरक्षित राहत आश्रय स्थल आवंटन (Safe Shelters)" : "Evacuation Shelter Spatial Allocation"}
                </Link>
              </li>
              <li className="flex items-center gap-2">
                <CornerDownRight className="w-3.5 h-3.5 text-slate-400" />
                <Link to="/dashboard?tab=simulate" className="font-semibold text-blue-700 dark:text-blue-400 hover:underline">
                  {isHi ? "बहु-आपदा प्रभाव सिमुलेशन (Multi-Hazard Simulation)" : "Multi-Hazard Simulation & Buffer Analytics"}
                </Link>
              </li>
              <li className="flex items-center gap-2">
                <CornerDownRight className="w-3.5 h-3.5 text-slate-400" />
                <Link to="/dashboard?tab=audit" className="font-semibold text-blue-700 dark:text-blue-400 hover:underline">
                  {isHi ? "CERT-In 180-दिवसीय अपरिवर्तनीय ऑडिट ट्रेल" : "CERT-In 180-Day Immutable Ledger"}
                </Link>
              </li>
            </ul>
          </section>

          {/* Section 3: Statutory Compliance & Redressal */}
          <section className="bg-white dark:bg-[#131e36] p-6 rounded-2xl border border-slate-300 dark:border-slate-800 shadow-sm space-y-4">
            <h2 className="text-sm font-bold text-[#0B2545] dark:text-white flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-2">
              <FileText className="w-4 h-4 text-amber-600 dark:text-amber-400" />
              <span>{isHi ? "3. सुलभता, नीतियां एवं शिकायत निवारण" : "3. Accessibility & Statutory Policies"}</span>
            </h2>
            <ul className="space-y-2.5 pl-2">
              <li className="flex items-center gap-2">
                <CornerDownRight className="w-3.5 h-3.5 text-slate-400" />
                <Link to="/accessibility-grievance" className="font-semibold text-blue-700 dark:text-blue-400 hover:underline">
                  {isHi ? "सुलभता शिकायत एवं प्रतिपुष्टि निवारण (Mandate 4.3)" : "Accessibility Grievance & Feedback Form"}
                </Link>
              </li>
              <li className="flex items-center gap-2">
                <CornerDownRight className="w-3.5 h-3.5 text-slate-400" />
                <Link to="/sitemap" className="font-semibold text-blue-700 dark:text-blue-400 hover:underline">
                  {isHi ? "सांविधिक साइटमैप (Sitemap - Current Page)" : "Official Text-Only Sitemap (Current)"}
                </Link>
              </li>
              <li className="flex items-center gap-2">
                <CornerDownRight className="w-3.5 h-3.5 text-slate-400" />
                <span className="text-slate-700 dark:text-slate-300">
                  {isHi ? "GIGW 3.0 नीतियां (नियम, गोपनीयता, कॉपीराइट, अस्वीकरण)" : "GIGW 3.0 Policies (Terms, Privacy, Copyright, Disclaimer)"}
                </span>
              </li>
            </ul>
          </section>

          {/* Section 4: Emergency Helplines & Control Rooms */}
          <section className="bg-white dark:bg-[#131e36] p-6 rounded-2xl border border-slate-300 dark:border-slate-800 shadow-sm space-y-4">
            <h2 className="text-sm font-bold text-[#0B2545] dark:text-white flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-2">
              <Phone className="w-4 h-4 text-rose-600 dark:text-rose-400" />
              <span>{isHi ? "4. आपातकालीन नियंत्रण कक्ष एवं हेल्पलाइन" : "4. State & District Helplines"}</span>
            </h2>
            <ul className="space-y-2.5 pl-2">
              <li className="flex items-center gap-2">
                <CornerDownRight className="w-3.5 h-3.5 text-slate-400" />
                <a href="tel:1070" className="font-semibold text-rose-600 dark:text-rose-400 hover:underline">
                  {isHi ? "राज्य आपातकालीन संचालन केंद्र (SEOC): 1070" : "State Emergency Operations Centre: 1070"}
                </a>
              </li>
              <li className="flex items-center gap-2">
                <CornerDownRight className="w-3.5 h-3.5 text-slate-400" />
                <a href="tel:1077" className="font-semibold text-rose-600 dark:text-rose-400 hover:underline">
                  {isHi ? "जिला आपातकालीन संचालन केंद्र (DEOC): 1077" : "District Emergency Operations Centre: 1077"}
                </a>
              </li>
              <li className="flex items-center gap-2">
                <CornerDownRight className="w-3.5 h-3.5 text-slate-400" />
                <a href="tel:112" className="font-semibold text-rose-600 dark:text-rose-400 hover:underline">
                  {isHi ? "अखिल भारतीय आपातकालीन नंबर (ERSS): 112" : "National Emergency Response (ERSS): 112"}
                </a>
              </li>
            </ul>
          </section>
        </div>
      </main>

      <GoiFooter />
    </div>
  );
}
