import { useState } from "react";
import { Link } from "react-router-dom";
import { HelpCircle, ChevronDown, Search, ArrowRight, ChevronRight, PhoneCall } from "lucide-react";
import GoiTopBar from "../components/GoiTopBar";
import GoiBrandHeader from "../components/GoiBrandHeader";
import GoiFooter from "../components/GoiFooter";
import { useTranslation } from "../i18n/translations";

export default function FaqsPage() {
  const { lang } = useTranslation();
  const isHi = lang === "hi";
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

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
    },
    {
      q: isHi
        ? "अधिकारी क्रेडेंशियल और जन परिचय (Jan Parichay) राष्ट्रीय एसएसओ कैसे कार्य करता है?"
        : "How does Jan Parichay National Single Sign-On (MeriPehchaan) integrate with RiskOS?",
      a: isHi
        ? "रिस्कओएस राष्ट्रीय एकल साइन-ऑन (Jan Parichay 2.0) का समर्थन करता है। अधिकृत सरकारी अधिकारी अपने आधिकारिक पहचान पत्र अथवा मोबाइल ओटीपी प्रमाणीकरण के माध्यम से दो-चरणीय सुरक्षा (2FA) के साथ सुरक्षित रूप से कमान डैशबोर्ड में प्रवेश कर सकते हैं।"
        : "RiskOS supports India's National Single Sign-On (MeriPehchaan / Jan Parichay 2.0). Departmental personnel authenticate using GovNet credentials or verified mobile 2FA OTP with clearance based on role-based access control (RBAC)."
    }
  ];

  const filteredFaqs = faqs.filter(
    (f) =>
      f.q.toLowerCase().includes(searchQuery.toLowerCase()) ||
      f.a.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen flex flex-col bg-[#070D18] text-slate-100 font-sans transition-colors selection:bg-[#0B2545] selection:text-white">
      <GoiTopBar />
      <GoiBrandHeader showNav activeNav="faqs" />

      {/* Breadcrumb Navigation Strip */}
      <div className="w-full bg-slate-900/80 border-b border-slate-800 py-2.5 px-4 sm:px-6 lg:px-12 text-xs">
        <div className="max-w-7xl mx-auto flex items-center gap-2 text-slate-400">
          <Link to="/" className="hover:text-blue-400 font-medium">
            {isHi ? "मुखपृष्ठ" : "Home"}
          </Link>
          <ChevronRight className="w-3.5 h-3.5 text-slate-500" />
          <span className="text-white font-bold">
            {isHi ? "सामान्य प्रश्न एवं वैधानिक मार्गदर्शन" : "Frequently Asked Questions (FAQs)"}
          </span>
        </div>
      </div>

      {/* Hero Banner Section */}
      <section className="bg-gradient-to-br from-[#0B2545] via-[#103058] to-[#081930] text-white py-12 px-4 sm:px-6 lg:px-12 border-b border-slate-800">
        <div className="max-w-7xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 text-xs font-bold border border-amber-500/30">
            <HelpCircle className="w-3.5 h-3.5" />
            <span>{isHi ? "नागरिक एवं अधिकारी सहायता केंद्र" : "Citizen & Officer Knowledge Base"}</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-black font-serif tracking-tight text-white">
            {isHi ? "सामान्य प्रश्न एवं वैधानिक मार्गदर्शन" : "Frequently Asked Questions & Statutory Guidance"}
          </h1>
          <p className="text-slate-300 text-sm sm:text-base max-w-3xl leading-relaxed">
            {isHi
              ? "नागरिकों, जिला कलेक्टरों और क्षेत्रीय अधिकारियों हेतु जोखिम स्कोरिंग, सिमुलेशन एवं विधिक अनुपालन से जुड़े आधिकारिक उत्तर।"
              : "Authoritative clarifications for citizens, District Magistrates, and field rescue commanders regarding risk algorithms, 3-tier zoning, and statutory procedures."}
          </p>

          {/* Search Bar */}
          <div className="max-w-xl pt-2">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3 pointer-events-none" />
              <input
                type="text"
                placeholder={isHi ? "प्रश्नों में खोजें (उदा. ज़ोनिंग, आईसीएस, भूस्खलन)..." : "Search FAQs (e.g. zoning, ICS-201, scoring)..."}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-900/90 border border-slate-700 text-white placeholder-slate-400 text-xs focus:outline-none focus:ring-2 focus:ring-amber-400 shadow-md"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Main Content Body */}
      <main className="flex-1 max-w-5xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-10 space-y-8">
        <div className="space-y-3">
          {filteredFaqs.map((faq, index) => {
            const isOpen = openFaq === index;
            return (
              <div
                key={index}
                className="rounded-2xl bg-slate-900/90 border border-slate-800 overflow-hidden shadow-xs transition-all"
              >
                <button
                  onClick={() => setOpenFaq(isOpen ? null : index)}
                  className="w-full px-6 py-4 text-left flex items-center justify-between gap-4 font-bold text-sm text-white hover:bg-slate-800/50 transition-colors"
                  aria-expanded={isOpen}
                >
                  <span className="flex items-center gap-3">
                    <span className="w-6 h-6 rounded-full bg-amber-950/80 text-amber-400 text-xs flex items-center justify-center shrink-0 font-bold border border-amber-800">
                      Q{index + 1}
                    </span>
                    <span>{faq.q}</span>
                  </span>
                  <ChevronDown
                    className={`w-4 h-4 text-slate-400 transition-transform duration-200 shrink-0 ${
                      isOpen ? "rotate-180 text-blue-400" : ""
                    }`}
                  />
                </button>
                {isOpen && (
                  <div className="px-6 pb-5 pt-2 text-xs sm:text-sm text-slate-300 leading-relaxed border-t border-slate-800/80 bg-slate-950/40">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Helpline CTA Strip */}
        <div className="p-6 rounded-2xl bg-[#0B2545]/80 border border-blue-900/60 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <PhoneCall className="w-6 h-6 text-red-400 shrink-0" />
            <div>
              <h4 className="text-sm font-bold text-white">
                {isHi ? "क्या आपका प्रश्न अभी भी अनुत्तरित है?" : "Need Further Technical or Emergency Assistance?"}
              </h4>
              <p className="text-xs text-slate-400 mt-0.5">
                Contact the State Emergency Operations Centre (SEOC) 24x7 Direct Helplines
              </p>
            </div>
          </div>
          <Link
            to="/helpline"
            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-bold text-xs rounded-xl transition flex items-center gap-2 whitespace-nowrap shadow-xs"
          >
            <span>{isHi ? "आपातकालीन निर्देशिका खोलें" : "View Emergency Directory"}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </main>

      <GoiFooter />
    </div>
  );
}
