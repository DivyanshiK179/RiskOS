import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import { Shield, Lock, User, ArrowRight, CheckCircle2, AlertCircle } from "lucide-react";
import { login } from "../api/auth";
import { useAuthStore } from "../store/authStore";
import { useTranslation } from "../i18n/translations";
import GoiTopBar from "../components/GoiTopBar";
import GoiFooter from "../components/GoiFooter";

export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const authLogin = useAuthStore((s) => s.login);
  const navigate = useNavigate();
  const { lang } = useTranslation();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const data = await login(username, password);
      await authLogin(data.access, data.refresh, username);
      navigate("/dashboard");
    } catch {
      setError(
        lang === "hi"
          ? "अमान्य क्रेडेंशियल। कृपया उपयोगकर्ता नाम और पासवर्ड जांचें।"
          : "Invalid credentials. Please verify your official credentials."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div id="main-content" className="min-h-screen flex flex-col bg-slate-50 dark:bg-[#0a0f1d] font-sans transition-colors">
      <GoiTopBar />

      <div className="flex-1 flex flex-col lg:flex-row">
        {/* Left panel — Official GIGW Mission Branding */}
        <div className="hidden lg:flex lg:w-1/2 flex-col justify-between p-12 bg-gradient-to-br from-[#0B2545] via-[#103058] to-[#081930] text-white relative overflow-hidden select-none">
          {/* Subtle Ashoka Chakra watermark in background */}
          <div className="absolute -right-20 -bottom-20 w-96 h-96 opacity-10 pointer-events-none">
            <svg viewBox="0 0 100 100" className="w-full h-full fill-current text-amber-300">
              <circle cx="50" cy="50" r="46" fill="none" stroke="currentColor" strokeWidth="4" />
              <circle cx="50" cy="50" r="8" fill="currentColor" />
            </svg>
          </div>

          <div>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-14 h-14 rounded-full overflow-hidden p-0.5 bg-gradient-to-tr from-blue-700 via-indigo-600 to-amber-500 shadow-lg flex-shrink-0">
                <img src="/riskos-logo.png" alt="RiskOS Emblem" className="w-full h-full object-cover rounded-full" />
              </div>
              <div>
                <span className="text-2xl font-black font-serif tracking-tight text-white block">
                  RiskOS | रिस्क ओएस
                </span>
                <span className="text-xs text-amber-300 font-semibold uppercase tracking-wider">
                  SDMA Uttarakhand • NDMA GOI
                </span>
              </div>
            </div>

            <div className="mt-8 space-y-4 max-w-lg">
              <span className="inline-block px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-amber-400/20 text-amber-300 border border-amber-400/30">
                GOVERNMENT OF INDIA • STATUTORY SDMA PORTAL
              </span>
              <h1 className="text-3xl font-extrabold leading-tight">
                National Geospatial Decision Support System for Disaster Risk & Relocation
              </h1>
              <p className="text-sm text-slate-300 leading-relaxed">
                Authoritative platform for state disaster management authorities to identify vulnerable mountain habitations, simulate multi-hazard impacts, and execute verified population relocations.
              </p>
            </div>
          </div>

          {/* Mission Features */}
          <div className="space-y-3.5 my-8">
            {[
              "Real-time PostGIS GeoJSON acceleration for 13,967+ habitations",
              "Multi-hazard vulnerability scoring (Seismic Zone V, Flash Flood, Landslide)",
              "Automated capacity-matching to verified safe relocation shelters",
              "Audited chain-of-custody relocation planning under NDMA guidelines",
            ].map((item, idx) => (
              <div key={idx} className="flex items-center gap-3 text-xs text-slate-200">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                <span>{item}</span>
              </div>
            ))}
          </div>

          <div className="text-[11px] text-slate-400 border-t border-blue-900/80 pt-4 flex items-center justify-between">
            <span>Security Standard: GIGW 3.0 Compliant</span>
            <span>Server: NIC GovNet Ready</span>
          </div>
        </div>

        {/* Right panel — Official Officer Authentication */}
        <div className="flex-1 flex flex-col justify-center items-center p-6 sm:p-12">
          <div className="w-full max-w-md bg-white dark:bg-[#131e36] border border-slate-300 dark:border-slate-700/80 rounded-2xl shadow-xl p-8 space-y-6">
            <div className="space-y-1.5">
              <div className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-blue-700 dark:text-blue-400" />
                <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                  {lang === "hi" ? "अधिकारी सुरक्षित लॉगिन" : "Official Officer Login"}
                </h2>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {lang === "hi"
                  ? "केवल अधिकृत राज्य एवं राष्ट्रीय आपदा प्रबंधन अधिकारियों के लिए।"
                  : "Authorized access for State & District Disaster Management Personnel."}
              </p>
            </div>

            {error && (
              <div className="p-3 bg-red-50 dark:bg-red-950/60 border border-red-200 dark:border-red-900/60 rounded-lg flex items-start gap-2.5 text-xs text-red-700 dark:text-red-400 animate-fade-in">
                <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  {lang === "hi" ? "उपयोगकर्ता नाम (Username)" : "Official Username"}
                </label>
                <div className="relative">
                  <User className="w-4 h-4 absolute left-3 top-3 text-slate-400 pointer-events-none" />
                  <input
                    type="text"
                    required
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="e.g. official"
                    autoComplete="username"
                    className="w-full pl-9 pr-3 py-2 text-sm bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  {lang === "hi" ? "पासवर्ड (Password)" : "Password"}
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 absolute left-3 top-3 text-slate-400 pointer-events-none" />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••••"
                    autoComplete="current-password"
                    className="w-full pl-9 pr-3 py-2 text-sm bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 px-4 bg-[#0B2545] hover:bg-blue-900 dark:bg-blue-600 dark:hover:bg-blue-700 text-white font-bold text-xs rounded-lg shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Verifying Credentials...</span>
                  </>
                ) : (
                  <>
                    <span>{lang === "hi" ? "कमांड सेंटर में प्रवेश करें" : "Sign In to Command Center"}</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>

            {/* Quick Fill Credentials Box */}
            <div className="p-3.5 bg-slate-50 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 rounded-xl space-y-2">
              <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
                Pre-configured Official Accounts:
              </span>
              <div className="grid grid-cols-2 gap-2 text-[11px]">
                <button
                  type="button"
                  onClick={() => {
                    setUsername("official");
                    setPassword("RiskSetu@2026");
                  }}
                  className="p-2 rounded bg-white dark:bg-[#131e36] border border-slate-300 dark:border-slate-700 text-left hover:border-blue-500 transition"
                >
                  <span className="font-bold text-blue-700 dark:text-blue-400 block truncate">State Officer</span>
                  <span className="text-[10px] font-mono text-slate-500">official / RiskSetu@2026</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setUsername("superadmin");
                    setPassword("Admin@RS2026");
                  }}
                  className="p-2 rounded bg-white dark:bg-[#131e36] border border-slate-300 dark:border-slate-700 text-left hover:border-blue-500 transition"
                >
                  <span className="font-bold text-amber-700 dark:text-amber-400 block truncate">Super Admin</span>
                  <span className="text-[10px] font-mono text-slate-500">superadmin / Admin@RS2026</span>
                </button>
              </div>
            </div>

            <div className="text-center pt-2">
              <Link to="/" className="text-xs text-blue-700 dark:text-blue-400 hover:underline font-semibold">
                ← {lang === "hi" ? "सार्वजनिक आपदा मानचित्र पर वापस जाएं" : "Return to Public Hazard Map"}
              </Link>
            </div>
          </div>
        </div>
      </div>

      <GoiFooter />
    </div>
  );
}