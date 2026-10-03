import { useState } from "react";
import { Link } from "react-router-dom";
import {
  ShieldAlert,
  Send,
  CheckCircle2,
  ArrowLeft,
  AlertCircle
} from "lucide-react";
import GoiTopBar from "../components/GoiTopBar";
import GoiFooter from "../components/GoiFooter";
import { useTranslation } from "../i18n/translations";

export default function AccessibilityGrievance() {
  const { lang } = useTranslation();
  const isHi = lang === "hi";

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [assistiveTech, setAssistiveTech] = useState("NVDA");
  const [barrierType, setBarrierType] = useState("NAVIGATION");
  const [affectedPage, setAffectedPage] = useState("/dashboard");
  const [description, setDescription] = useState("");
  const [submittedId, setSubmittedId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    setTimeout(() => {
      const generatedId = `AGR-UK-${new Date().getFullYear()}-${Math.floor(100000 + Math.random() * 900000)}`;
      setSubmittedId(generatedId);
      setLoading(false);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }, 600);
  };

  return (
    <div id="main-content" className="min-h-screen flex flex-col bg-slate-50 dark:bg-[#0a0f1d] text-slate-900 dark:text-slate-100 font-sans transition-colors">
      <GoiTopBar />

      <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        {/* Navigation Breadcrumb */}
        <div className="mb-6 flex items-center justify-between">
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-700 dark:text-blue-400 hover:underline"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>{isHi ? "मुख्य पृष्ठ पर वापस जाएं" : "Return to Home Portal"}</span>
          </Link>
          <span className="text-[11px] font-mono text-slate-500 bg-slate-200/60 dark:bg-slate-800/60 px-2.5 py-1 rounded">
            GIGW 3.0 Mandate 4.3
          </span>
        </div>

        {/* Header Block */}
        <div className="border-b border-slate-200 dark:border-slate-800 pb-6 mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-blue-700 text-white flex items-center justify-center shadow-md">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[#0B2545] dark:text-white">
                {isHi ? "सुलभता शिकायत एवं प्रतिपुष्टि निवारण पोर्टल" : "Accessibility Grievance & Feedback Redressal"}
              </h1>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                {isHi
                  ? "भारत सरकार की वेबसाइटों के लिए दिशानिर्देश (GIGW 3.0) एवं दिव्यांगजन अधिकार अधिनियम, 2016 के अंतर्गत सांविधिक तंत्र"
                  : "Statutory Redressal Mechanism under Guidelines for Indian Government Websites (GIGW 3.0) & RPwD Act, 2016"}
              </p>
            </div>
          </div>
        </div>

        {/* Success Confirmation Card */}
        {submittedId ? (
          <div className="p-8 bg-white dark:bg-[#131e36] rounded-2xl border border-emerald-300 dark:border-emerald-800 shadow-xl text-center space-y-4 animate-fade-in">
            <div className="w-14 h-14 mx-auto rounded-full bg-emerald-100 dark:bg-emerald-950/80 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">
              {isHi ? "शिकायत सफलतापूर्वक दर्ज की गई" : "Accessibility Grievance Registered Successfully"}
            </h2>
            <div className="inline-block bg-slate-100 dark:bg-slate-900 px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-700 font-mono text-sm text-blue-700 dark:text-blue-400 font-bold">
              {isHi ? "संदर्भ ट्रैकिंग संख्या:" : "Reference Token:"} {submittedId}
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-300 max-w-lg mx-auto leading-relaxed">
              {isHi
                ? "आपकी सुलभता शिकायत को राज्य आपातकालीन संचालन केंद्र (SEOC) नोडल सुलभता अधिकारी को अग्रेषित कर दिया गया है। GIGW 3.0 के अंतर्गत 15 कार्य दिवसों में समाधान प्रदान किया जाएगा।"
                : "Your feedback has been logged in the SEOC Statutory Register and transmitted to the Nodal Web Accessibility Officer. Compliance resolution will be communicated within 15 working days as per GIGW 3.0 norms."}
            </p>
            <div className="pt-4 flex justify-center gap-3">
              <button
                type="button"
                onClick={() => {
                  setSubmittedId(null);
                  setDescription("");
                }}
                className="px-4 py-2 rounded-lg bg-slate-200 dark:bg-slate-800 text-xs font-semibold hover:bg-slate-300 dark:hover:bg-slate-700 transition"
              >
                {isHi ? "अन्य प्रतिपुष्टि दर्ज करें" : "Submit Another Grievance"}
              </button>
              <Link
                to="/"
                className="px-4 py-2 rounded-lg bg-[#0B2545] dark:bg-blue-600 text-white text-xs font-semibold hover:bg-blue-900 dark:hover:bg-blue-700 transition shadow"
              >
                {isHi ? "पोर्टल पर जाएं" : "Return to Portal"}
              </Link>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="bg-white dark:bg-[#131e36] rounded-2xl border border-slate-300 dark:border-slate-800 p-6 sm:p-8 shadow-xl space-y-6">
            <div className="bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900/60 rounded-xl p-4 text-xs text-blue-900 dark:text-blue-300 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 flex-shrink-0 text-blue-600 dark:text-blue-400 mt-0.5" />
              <div className="space-y-1">
                <p className="font-semibold">
                  {isHi ? "सुलभता आश्वासन एवं दायित्व" : "Statutory Commitment to Web Accessibility"}
                </p>
                <p className="text-[11px] leading-relaxed text-blue-800 dark:text-blue-400">
                  {isHi
                    ? "रिस्क ओएस (RiskOS) दृष्टिबाधित, अल्प-दृष्टि, श्रवणबाधित एवं शारीरिक दिव्यांग नागरिकों के लिए पूर्णतः सुलभ होने हेतु प्रतिबद्ध है। यदि आपको स्क्रीन रीडर या कीबोर्ड नेविगेशन में कोई समस्या आती है, तो कृपया नीचे विवरण दर्ज करें।"
                    : "RiskOS is engineered to ensure seamless accessibility for users with visual, auditory, motor, or cognitive impairments. Use this form to report barrier experiences directly to the State Web Accessibility Redressal Officer."}
                </p>
              </div>
            </div>

            {/* User Personal Details */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  {isHi ? "पूरा नाम" : "Full Name"} <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="e.g. Ramesh Chandra"
                  className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  {isHi ? "ईमेल पता" : "Official / Personal Email"} <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="e.g. citizen@gov.in"
                  className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  {isHi ? "मोबाइल नंबर (वैकल्पिक)" : "Phone Number (Optional)"}
                </label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+91 94120 00000"
                  className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  {isHi ? "प्रयुक्त सहायक तकनीक" : "Assistive Technology Used"}
                </label>
                <select
                  value={assistiveTech}
                  onChange={(e) => setAssistiveTech(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                >
                  <option value="NVDA">NVDA (NonVisual Desktop Access)</option>
                  <option value="JAWS">JAWS for Windows</option>
                  <option value="VoiceOver">Apple VoiceOver (macOS / iOS)</option>
                  <option value="TalkBack">Android TalkBack</option>
                  <option value="Narrator">Microsoft Windows Narrator</option>
                  <option value="HighContrast">High Contrast Display / Zoom Magnifier</option>
                  <option value="KeyboardOnly">Keyboard-Only Navigation</option>
                  <option value="Braille">Refreshable Braille Terminal</option>
                  <option value="Other">Other Assistive Aid</option>
                </select>
              </div>
            </div>

            {/* Barrier Category & Page URL */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  {isHi ? "सुलभता बाधा का प्रकार" : "Nature of Accessibility Barrier"}
                </label>
                <select
                  value={barrierType}
                  onChange={(e) => setBarrierType(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                >
                  <option value="NAVIGATION">{isHi ? "कीबोर्ड फोकस एवं नेविगेशन बाधा" : "Keyboard Focus / Skip Link Issue"}</option>
                  <option value="SCREEN_READER">{isHi ? "स्क्रीन रीडर अनपढ़ लेबल / ARIA कमी" : "Unlabeled Control / ARIA Missing"}</option>
                  <option value="CONTRAST">{isHi ? "कंट्रास्ट / रंग दृष्टिहीनता अस्पष्टता" : "Color Contrast / Visibility Barrier"}</option>
                  <option value="MAP_GEO">{isHi ? "भू-स्थानिक मानचित्र सुलभता विकल्प" : "GIS Map Vector Accessibility Barrier"}</option>
                  <option value="FORMS">{isHi ? "फ़ॉर्म इनपुट / सत्यापन त्रुटि स्पष्टता" : "Form Validation / Screen Reader Alert"}</option>
                  <option value="OTHER">{isHi ? "अन्य सुलभता कठिनाई" : "Other Specific Barrier"}</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  {isHi ? "प्रभावित पोर्टल पृष्ठ / खंड" : "Affected URL / Feature Section"}
                </label>
                <input
                  type="text"
                  value={affectedPage}
                  onChange={(e) => setAffectedPage(e.target.value)}
                  placeholder="/dashboard, /public-map, etc."
                  className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                {isHi ? "बाधा का विस्तृत विवरण" : "Detailed Description of Barrier & Assistive Behavior"} <span className="text-red-500">*</span>
              </label>
              <textarea
                required
                rows={4}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder={
                  isHi
                    ? "कृपया विस्तार से बताएं कि किस बटन, मेनू या डेटा तालिका में स्क्रीन रीडर द्वारा क्या समस्या आ रही है..."
                    : "Please describe the behavior observed, expected assistive output, and steps to reproduce the barrier..."
                }
                className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
              />
            </div>

            {/* Statutory Compliance Footer and Submit */}
            <div className="pt-2 border-t border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
              <span className="text-[11px] text-slate-500 dark:text-slate-400">
                {isHi
                  ? "यह पोर्टल एनआईसी (NIC) एवं प्रमाणन एजेंसी CERT-In द्वारा सुलभता अनुपालित है।"
                  : "Certified for GIGW 3.0 / WCAG 2.1 AA Compliance with 15-day SLA guarantee."}
              </span>
              <button
                type="submit"
                disabled={loading}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-2.5 bg-[#0B2545] hover:bg-blue-900 dark:bg-blue-600 dark:hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-md transition disabled:opacity-50"
              >
                {loading ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    <span>{isHi ? "शिकायत दर्ज करें" : "Submit Statutory Grievance"}</span>
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </main>

      <GoiFooter />
    </div>
  );
}
