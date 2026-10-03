import { Link } from "react-router-dom";
import { Shield, Building2, Users, Scale, ArrowRight, ChevronRight } from "lucide-react";
import GoiTopBar from "../components/GoiTopBar";
import GoiBrandHeader from "../components/GoiBrandHeader";
import GoiFooter from "../components/GoiFooter";
import { useTranslation } from "../i18n/translations";

export default function MandatePage() {
  const { t, lang } = useTranslation();
  const isHi = lang === "hi";

  return (
    <div className="min-h-screen flex flex-col bg-[#070D18] text-slate-100 font-sans transition-colors selection:bg-[#0B2545] selection:text-white">
      <GoiTopBar />
      <GoiBrandHeader showNav activeNav="mandate" />

      {/* Breadcrumb Navigation Strip */}
      <div className="w-full bg-slate-900/80 border-b border-slate-800 py-2.5 px-4 sm:px-6 lg:px-12 text-xs">
        <div className="max-w-7xl mx-auto flex items-center gap-2 text-slate-400">
          <Link to="/" className="hover:text-blue-400 font-medium">
            {isHi ? "मुखपृष्ठ" : "Home"}
          </Link>
          <ChevronRight className="w-3.5 h-3.5 text-slate-500" />
          <span className="text-white font-bold">
            {isHi ? "वैधानिक जनादेश एवं कानूनी अधिकार" : "Statutory Mandate & Institutional Framework"}
          </span>
        </div>
      </div>

      {/* Hero Banner Section */}
      <section className="bg-gradient-to-br from-[#0B2545] via-[#103058] to-[#081930] text-white py-12 px-4 sm:px-6 lg:px-12 border-b border-slate-800">
        <div className="max-w-7xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 text-xs font-bold border border-amber-500/30">
            <Scale className="w-3.5 h-3.5" />
            <span>{isHi ? "आपदा प्रबंधन अधिनियम, 2005 (अधिनियम सं. 53/2005)" : "Disaster Management Act, 2005 (Act No. 53 of 2005)"}</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-black font-serif tracking-tight text-white">
            {isHi ? "वैधानिक जनादेश एवं संस्थागत कानूनी संरचना" : "Statutory Mandate & Institutional Governance"}
          </h1>
          <p className="text-slate-300 text-sm sm:text-base max-w-3xl leading-relaxed">
            {isHi
              ? "आपदा प्रबंधन अधिनियम, 2005 की धारा 6, 14, 22 एवं 30 के अंतर्गत विहित शक्तियों के अधीन रिस्कओएस (RiskOS) भारत सरकार एवं उत्तराखंड राज्य आपदा प्रबंधन प्राधिकरण (USDMA) का अधिकृत भू-स्थानिक निर्णय समर्थन मंच (GIS-DSS) है।"
              : "Operated under statutory mandates of Sections 6, 14, 22, and 30 of the Disaster Management Act, 2005. RiskOS serves as the authoritative Decision Support System synchronizing national guidelines to ground-level incident command."}
          </p>
        </div>
      </section>

      {/* Main Content Body */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-12 py-10 space-y-12">
        {/* Tri-Tier Institutional Hierarchy */}
        <section className="space-y-6">
          <div className="text-left space-y-1">
            <h2 className="text-xl sm:text-2xl font-black text-white font-serif">
              {isHi ? "त्रि-स्तरीय निर्णय पदानुक्रम (Tri-Tier Governance)" : "Tri-Tier Statutory Governance Hierarchy"}
            </h2>
            <p className="text-xs sm:text-sm text-slate-400">
              {isHi
                ? "राष्ट्रीय स्तर (एनडीएमए), राज्य स्तर (एसडीएमए) तथा जिला स्तर (डीडीएमए) के मध्य समन्वय।"
                : "Synchronized statutory delegation under Sections 6, 14, and 30 of DMA 2005."}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* National Tier */}
            <div className="p-6 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-sm flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 rounded-xl bg-blue-950 text-blue-400 flex items-center justify-center font-bold mb-4">
                  <Shield className="w-6 h-6" />
                </div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-blue-400 block mb-1">
                  {isHi ? "राष्ट्रीय स्तर" : "National Tier (NDMA)"}
                </span>
                <h3 className="text-base font-bold text-white mb-2">
                  {isHi ? "राष्ट्रीय आपदा प्रबंधन प्राधिकरण" : "National Policy & Standards"}
                </h3>
                <p className="text-xs text-slate-300 leading-relaxed space-y-2">
                  <span>
                    {isHi
                      ? "धारा 6 के अंतर्गत राष्ट्रीय नीतियां, एनआरएससी उपग्रह डेटा एकीकरण, कॉमन अलर्टिंग प्रोटोकॉल (CAP) मानक एवं अंतर-राज्यीय समन्वय।"
                      : "Formulation of national disaster risk reduction policies, multi-state alert broadcasts, and statutory technical standards."}
                  </span>
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-slate-800 text-[11px] font-semibold text-slate-500">
                DMA 2005 Section 6
              </div>
            </div>

            {/* State Tier */}
            <div className="p-6 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-sm flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 rounded-xl bg-amber-950 text-amber-400 flex items-center justify-center font-bold mb-4">
                  <Building2 className="w-6 h-6" />
                </div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-amber-400 block mb-1">
                  {isHi ? "राज्य स्तर" : "State Tier (USDMA)"}
                </span>
                <h3 className="text-base font-bold text-white mb-2">
                  {isHi ? "राज्य आपातकालीन संचालन केंद्र" : "State Operations (SEOC)"}
                </h3>
                <p className="text-xs text-slate-300 leading-relaxed">
                  {isHi
                    ? "धारा 14 व 22 के अंतर्गत राज्य आपातकालीन संचालन केंद्र (SEOC) देहरादून द्वारा 13 जिलों की वास्तविक समय निगरानी, एसडीआरएफ तैनाती एवं लॉजिस्टिक्स समन्वय।"
                    : "Command and control hub in Dehradun coordinating inter-district resources, SDRF mobilization, and State Disaster Response Fund disbursals."}
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-slate-800 text-[11px] font-semibold text-slate-500">
                DMA 2005 Sections 14 & 22
              </div>
            </div>

            {/* District Tier */}
            <div className="p-6 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-sm flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 rounded-xl bg-emerald-950 text-emerald-400 flex items-center justify-center font-bold mb-4">
                  <Users className="w-6 h-6" />
                </div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-400 block mb-1">
                  {isHi ? "जिला स्तर" : "District Tier (DDMA)"}
                </span>
                <h3 className="text-base font-bold text-white mb-2">
                  {isHi ? "जिला मजिस्ट्रेट / घटना कमांडर" : "District Incident Command"}
                </h3>
                <p className="text-xs text-slate-300 leading-relaxed">
                  {isHi
                    ? "धारा 30 व 34 के अंतर्गत जिला कलेक्टर/मजिस्ट्रेट द्वारा राहत शिविर प्रबंधन, तत्काल निकासी गलियारा अनुमोदन एवं एनडीएमए फॉर्म आईसीएस-201 का संपादन।"
                    : "District Collector / Magistrate leadership heading local response, emergency shelter activation, and formal ICS-201 action plan approvals."}
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-slate-800 text-[11px] font-semibold text-slate-500">
                DMA 2005 Sections 30 & 34
              </div>
            </div>
          </div>
        </section>

        {/* Legal Authority & Statutory Provisions */}
        <section className="bg-slate-900/90 rounded-2xl border border-slate-800 p-6 sm:p-8 space-y-6">
          <div className="space-y-1">
            <h3 className="text-lg font-bold text-white">
              {t("mandate.powers_title")}
            </h3>
            <p className="text-xs text-slate-400">
              {t("mandate.powers_subtitle")}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 rounded-xl bg-slate-800/60 border border-slate-700/60 space-y-2">
              <span className="text-xs font-bold text-blue-400 block font-mono">
                {t("mandate.sec34a_title")}
              </span>
              <p className="text-xs text-slate-300 leading-relaxed">
                {t("mandate.sec34a_desc")}
              </p>
            </div>

            <div className="p-4 rounded-xl bg-slate-800/60 border border-slate-700/60 space-y-2">
              <span className="text-xs font-bold text-amber-400 block font-mono">
                {t("mandate.sec34c_title")}
              </span>
              <p className="text-xs text-slate-300 leading-relaxed">
                {t("mandate.sec34c_desc")}
              </p>
            </div>

            <div className="p-4 rounded-xl bg-slate-800/60 border border-slate-700/60 space-y-2">
              <span className="text-xs font-bold text-emerald-400 block font-mono">
                {t("mandate.sec51_title")}
              </span>
              <p className="text-xs text-slate-300 leading-relaxed">
                {t("mandate.sec51_desc")}
              </p>
            </div>

            <div className="p-4 rounded-xl bg-slate-800/60 border border-slate-700/60 space-y-2">
              <span className="text-xs font-bold text-rose-400 block font-mono">
                {t("mandate.sec54_title")}
              </span>
              <p className="text-xs text-slate-300 leading-relaxed">
                {t("mandate.sec54_desc")}
              </p>
            </div>
          </div>
        </section>

        {/* Quick Action Navigation */}
        <section className="flex flex-col sm:flex-row items-center justify-between gap-4 p-6 rounded-2xl bg-[#0B2545] text-white">
          <div>
            <h4 className="text-base font-bold">
              {isHi ? "कमांड डैशबोर्ड में प्रवेश करें" : "Enter GIS Decision Support Command"}
            </h4>
            <p className="text-xs text-slate-300 mt-0.5">
              {isHi ? "वास्तविक समय उपग्रह विश्लेषण एवं घटना कार्य योजना (ICS-201)" : "Real-time PostGIS simulation, vulnerability scoring, and shelter allocation"}
            </p>
          </div>
          <Link
            to="/dashboard"
            className="px-5 py-2.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs rounded-xl transition flex items-center gap-2 whitespace-nowrap shadow-md shrink-0"
          >
            <span>{isHi ? "डैशबोर्ड खोलें" : "Launch Dashboard"}</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </section>
      </main>

      <GoiFooter />
    </div>
  );
}
