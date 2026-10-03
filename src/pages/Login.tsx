import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useState } from "react";
import { Shield, Lock, User, ArrowRight, CheckCircle2, AlertCircle, KeyRound, Smartphone } from "lucide-react";
import { login } from "../api/auth";
import { useAuthStore } from "../store/authStore";
import { useTranslation } from "../i18n/translations";
import type { NdmaRole } from "../types";
import GoiTopBar from "../components/GoiTopBar";
import GoiFooter from "../components/GoiFooter";

export default function Login() {
  const [searchParams] = useSearchParams();
  const rawRedirect = searchParams.get("redirect");
  const redirectUrl = rawRedirect
    ? rawRedirect.startsWith("/")
      ? rawRedirect
      : decodeURIComponent(rawRedirect)
    : "/dashboard";
  const is2FARequired = searchParams.get("reason") === "2fa_required";

  const [loginMode, setLoginMode] = useState<"govnet" | "parichay">("govnet");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Jan Parichay National SSO state
  const [parichayId, setParichayId] = useState("");
  const [parichayRole, setParichayRole] = useState<NdmaRole>("DISTRICT_MAGISTRATE");
  const [otpSent, setOtpSent] = useState(false);
  const [otpValue, setOtpValue] = useState("");

  const authLogin = useAuthStore((s) => s.login);
  const navigate = useNavigate();
  const { t, lang } = useTranslation();
  const isHi = lang === "hi";

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const data = await login(username, password);
      const role: NdmaRole = username.toLowerCase().includes("superadmin")
        ? "DISTRICT_MAGISTRATE"
        : username.toLowerCase().includes("sdrf")
        ? "SDRF_COMMANDER"
        : "DEOC_OPERATOR";
      await authLogin(data.access, data.refresh, username, role);
      navigate(redirectUrl);
    } catch (err: any) {
      const apiMsg = err.response?.data?.detail || err.response?.data?.error;
      setError(
        apiMsg ||
        (lang === "hi"
          ? "अमान्य क्रेडेंशियल। कृपया आधिकारिक उपयोगकर्ता नाम और पासवर्ड जांचें।"
          : "Invalid credentials. Please verify your official credentials.")
      );
    } finally {
      setLoading(false);
    }
  }

  function handleSendParichayOtp(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setOtpSent(true);
    }, 500);
  }

  async function handleVerifyParichayOtp(e: React.FormEvent) {
    e.preventDefault();
    if (!otpValue || otpValue.length < 4) {
      setError(isHi ? "कृपया 6-अंकीय ओटीपी दर्ज करें।" : "Please enter valid 6-digit MeriPehchaan OTP.");
      return;
    }
    setError("");
    setLoading(true);
    setTimeout(async () => {
      try {
        await authLogin("parichay_jwt_mock_token_2026", "parichay_refresh_token_2026", parichayId, parichayRole);
        navigate(redirectUrl);
      } catch {
        setError(isHi ? "2FA सत्यापन विफल रहा।" : "2FA Verification failed.");
      } finally {
        setLoading(false);
      }
    }, 600);
  }

  return (
    <div id="main-content" className="min-h-screen flex flex-col bg-slate-50 dark:bg-[#0a0f1d] font-sans transition-colors">
      <GoiTopBar />

      <div className="flex-1 flex flex-col lg:flex-row">
        {/* Left panel — Official GIGW Mission Branding */}
        <div className="hidden lg:flex lg:w-1/2 flex-col justify-between p-8 xl:p-10 bg-gradient-to-br from-[#0B2545] via-[#103058] to-[#081930] text-white relative overflow-hidden select-none">
          {/* Subtle Ashoka Chakra watermark in background */}
          <div className="absolute -right-20 -bottom-20 w-96 h-96 opacity-10 pointer-events-none">
            <svg viewBox="0 0 100 100" className="w-full h-full fill-current text-amber-300">
              <circle cx="50" cy="50" r="46" fill="none" stroke="currentColor" strokeWidth="4" />
              <circle cx="50" cy="50" r="8" fill="currentColor" />
            </svg>
          </div>

          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-full overflow-hidden p-0.5 bg-gradient-to-tr from-blue-700 via-indigo-600 to-amber-500 shadow-lg flex-shrink-0">
                <img src="/riskos-logo.png" alt="RiskOS Emblem" className="w-full h-full object-cover rounded-full" />
              </div>
              <div>
                <span className="text-xl font-black font-serif tracking-tight text-white block">
                  RiskOS | रिस्क ओएस
                </span>
                <span className="text-[11px] text-amber-300 font-semibold uppercase tracking-wider">
                  SDMA Uttarakhand • NDMA GOI
                </span>
              </div>
            </div>

            <div className="mt-4 space-y-2.5 max-w-lg">
              <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-amber-400/20 text-amber-300 border border-amber-400/30">
                {t("GOVERNMENT OF INDIA • STATUTORY SDMA PORTAL")}
              </span>
              <h1 className="text-2xl font-extrabold leading-snug">
                {t("National Geospatial Decision Support System for Disaster Risk & Relocation")}
              </h1>
              <p className="text-xs text-slate-300 leading-relaxed">
                {t("Authoritative platform for state disaster management authorities to identify vulnerable mountain habitations, simulate multi-hazard impacts, and execute verified population relocations.")}
              </p>
            </div>
          </div>

          {/* Mission Features */}
          <div className="space-y-2 my-5">
            {[
              t("Real-time PostGIS GeoJSON acceleration for 13,967+ habitations"),
              t("Multi-hazard vulnerability scoring (Seismic Zone V, Flash Flood, Landslide)"),
              t("Automated capacity-matching to verified safe relocation shelters"),
              t("Audited chain-of-custody relocation planning under NDMA guidelines"),
            ].map((item, idx) => (
              <div key={idx} className="flex items-center gap-2.5 text-[11px] text-slate-200">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                <span>{item}</span>
              </div>
            ))}
          </div>

          <div className="text-[10px] text-slate-400 border-t border-blue-900/80 pt-3 flex items-center justify-between">
            <span>{t("Security Standard: GIGW 3.0 Compliant")}</span>
            <span>{t("Server: NIC GovNet Ready")}</span>
          </div>
        </div>

        {/* Right panel — Official Officer Authentication */}
        <div className="flex-1 flex flex-col justify-center items-center py-4 px-4 sm:px-6">
          <div className="w-full max-w-[430px] bg-white dark:bg-[#131e36] border border-slate-300 dark:border-slate-700/80 rounded-xl shadow-lg p-5 sm:p-6 space-y-3">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-blue-700 dark:text-blue-400" />
                <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                  {isHi ? "अधिकारी सुरक्षित लॉगिन" : "Official Officer Authentication"}
                </h2>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                {isHi
                  ? "एनआईसीएसआई / जन परिचय राष्ट्रीय एकल लॉगिन एवं अधिकृत क्रेडेंशियल।"
                  : "Authorized access via NIC GovNet or Jan Parichay National SSO (MeriPehchaan)."}
              </p>
            </div>

            {/* Authentication Protocol Tabs */}
            <div className="flex p-0.5 bg-slate-100 dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 text-xs font-semibold">
              <button
                type="button"
                onClick={() => { setLoginMode("govnet"); setError(""); }}
                className={`flex-1 py-1 px-2 rounded-md transition text-center text-[11px] ${
                  loginMode === "govnet"
                    ? "bg-white dark:bg-slate-800 text-blue-700 dark:text-blue-400 shadow-sm font-bold"
                    : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
                }`}
              >
                GovNet Direct
              </button>
              <button
                type="button"
                onClick={() => { setLoginMode("parichay"); setError(""); }}
                className={`flex-1 py-1 px-2 rounded-md transition text-center flex items-center justify-center gap-1.5 text-[11px] ${
                  loginMode === "parichay"
                    ? "bg-white dark:bg-slate-800 text-amber-600 dark:text-amber-400 shadow-sm font-bold"
                    : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
                }`}
              >
                <span>🇮🇳 {isHi ? "जन परिचय (SSO)" : "Jan Parichay (SSO)"}</span>
              </button>
            </div>

            {is2FARequired && !error && (
              <div className="p-2 bg-amber-50 dark:bg-amber-950/60 border border-amber-300 dark:border-amber-800/80 rounded-lg flex items-start gap-2 text-[11px] text-amber-800 dark:text-amber-300 animate-fade-in">
                <Shield className="w-3.5 h-3.5 flex-shrink-0 mt-0.5 text-amber-600 dark:text-amber-400" />
                <span>
                  {isHi
                    ? "2FA सुरक्षा प्रोटोकॉल: कमांड डैशबोर्ड हेतु अधिकृत अधिकारी सत्र अनिवार्य है।"
                    : "2-Factor Authentication Required: Official session validation required before accessing Command Dashboard."}
                </span>
              </div>
            )}

            {error && (
              <div className="p-2 bg-red-50 dark:bg-red-950/60 border border-red-200 dark:border-red-900/60 rounded-lg flex items-start gap-2 text-[11px] text-red-700 dark:text-red-400 animate-fade-in">
                <AlertCircle className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            {loginMode === "govnet" ? (
              <form onSubmit={handleSubmit} className="space-y-2.5">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    {isHi ? "उपयोगकर्ता नाम (Username)" : "Official Username"}
                  </label>
                  <div className="relative">
                    <User className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-slate-400 pointer-events-none" />
                    <input
                      type="text"
                      required
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      placeholder="e.g. official"
                      autoComplete="username"
                      className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    {isHi ? "पासवर्ड (Password)" : "Password"}
                  </label>
                  <div className="relative">
                    <Lock className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-slate-400 pointer-events-none" />
                    <input
                      type="password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••••••"
                      autoComplete="current-password"
                      className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-2 px-3 bg-[#0B2545] hover:bg-blue-900 dark:bg-blue-600 dark:hover:bg-blue-700 text-white font-bold text-xs rounded-lg shadow-sm transition-all flex items-center justify-center gap-1.5 disabled:opacity-50"
                >
                  {loading ? (
                    <>
                      <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>{t("Verifying Credentials...")}</span>
                    </>
                  ) : (
                    <>
                      <span>{t("Sign In to Command Center")}</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </>
                  )}
                </button>

                {/* Pre-configured Official Accounts Quick Fill Box */}
                <div className="p-2 bg-slate-50 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 rounded-lg space-y-1 mt-1">
                  <span className="text-[9px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
                    {isHi ? "पूर्व-कॉन्फ़िगर आधिकारिक खाते:" : "Pre-configured Official Accounts:"}
                  </span>
                  <div className="grid grid-cols-2 gap-1.5 text-[10px]">
                    <button
                      type="button"
                      onClick={() => {
                        setUsername("official");
                        setPassword("RiskSetu@2026");
                      }}
                      className="p-1.5 rounded bg-white dark:bg-[#131e36] border border-slate-300 dark:border-slate-700 text-left hover:border-blue-500 transition cursor-pointer"
                    >
                      <span className="font-bold text-blue-700 dark:text-blue-400 block truncate text-[10.5px]">State Officer</span>
                      <span className="text-[9px] font-mono text-slate-500 block truncate">official / RiskSetu@2026</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setUsername("superadmin");
                        setPassword("Admin@RS2026");
                      }}
                      className="p-1.5 rounded bg-white dark:bg-[#131e36] border border-slate-300 dark:border-slate-700 text-left hover:border-blue-500 transition cursor-pointer"
                    >
                      <span className="font-bold text-amber-700 dark:text-amber-400 block truncate text-[10.5px]">Super Admin</span>
                      <span className="text-[9px] font-mono text-slate-500 block truncate">superadmin / Admin@RS2026</span>
                    </button>
                  </div>
                </div>
              </form>
            ) : (
              /* Jan Parichay National Single Sign-On (MeriPehchaan) Flow */
              <div className="space-y-2.5">
                <div className="p-2 bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/60 rounded-lg text-xs space-y-0.5">
                  <span className="font-bold text-amber-800 dark:text-amber-300 block flex items-center gap-1.5 text-[11px]">
                    <span>MeriPehchaan • National SSO 2.0</span>
                  </span>
                  <p className="text-[10px] text-amber-700 dark:text-amber-400 leading-tight">
                    {isHi
                      ? "भारत सरकार का राष्ट्रीय सिंगल साइन-ऑन (2-चरणीय बायोमेट्रिक/ओटीपी सत्यापन)"
                      : "National Single Sign-On for Government Officers with statutory 2-Factor Authentication."}
                  </p>
                </div>

                {!otpSent ? (
                  <form onSubmit={handleSendParichayOtp} className="space-y-2.5">
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-0.5">
                        {isHi ? "एनडीएमए सांविधिक भूमिका" : "Statutory NDMA Clearance Role"}
                      </label>
                      <select
                        value={parichayRole}
                        onChange={(e) => setParichayRole(e.target.value as NdmaRole)}
                        className="w-full px-2.5 py-1.5 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-amber-500"
                      >
                        <option value="DISTRICT_MAGISTRATE">
                          {isHi ? "जिला मजिस्ट्रेट (District Magistrate)" : "District Magistrate (Executive IC)"}
                        </option>
                        <option value="DEOC_OPERATOR">
                          {isHi ? "डीईओसी / एसईओसी नियंत्रण कक्ष" : "DEOC / SEOC Console Operator"}
                        </option>
                        <option value="SDRF_COMMANDER">
                          {isHi ? "एसडीआरएफ / एनडीआरएफ फील्ड कमांडर" : "SDRF Field Operations Commander"}
                        </option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-0.5">
                        {isHi ? "परिचय आईडी / सरकारी ईमेल" : "Parichay Officer Email / Mobile"}
                      </label>
                      <div className="relative">
                        <User className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-slate-400 pointer-events-none" />
                        <input
                          type="text"
                          required
                          value={parichayId}
                          onChange={(e) => setParichayId(e.target.value)}
                          placeholder="e.g. dm.dehradun@gov.in"
                          className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-amber-500"
                        />
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full py-2 px-3 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs rounded-lg shadow-sm transition-all flex items-center justify-center gap-1.5 disabled:opacity-50"
                    >
                      {loading ? (
                        <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <>
                          <Smartphone className="w-3.5 h-3.5" />
                          <span>{isHi ? "2FA ओटीपी भेजें" : "Send Jan Parichay 2FA OTP"}</span>
                        </>
                      )}
                    </button>
                  </form>
                ) : (
                  <form onSubmit={handleVerifyParichayOtp} className="space-y-2.5">
                    <div className="p-2 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-lg text-[10.5px] text-emerald-800 dark:text-emerald-300 leading-tight">
                      <span>{isHi ? "ओटीपी पंजीकृत मोबाइल पर भेजा गया: +91 94120 •••••" : "OTP sent to registered mobile: +91 94120 •••••"}</span>
                      <div className="text-[9.5px] text-emerald-600 dark:text-emerald-400 font-mono mt-0.5">
                        {isHi ? "सैंडबॉक्स कोड: 739201" : "Sandbox Test OTP: 739201"}
                      </div>
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-0.5">
                        {isHi ? "6-अंकीय ओटीपी दर्ज करें" : "Enter 6-Digit 2FA Token"}
                      </label>
                      <div className="relative">
                        <KeyRound className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-slate-400 pointer-events-none" />
                        <input
                          type="text"
                          required
                          maxLength={6}
                          value={otpValue}
                          onChange={(e) => setOtpValue(e.target.value)}
                          placeholder="739201"
                          className="w-full pl-8 pr-3 py-1.5 text-xs font-mono tracking-widest bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-amber-500"
                        />
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => setOtpSent(false)}
                        className="px-2.5 py-1.5 bg-slate-100 dark:bg-slate-800 text-[11px] font-semibold rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 transition"
                      >
                        {isHi ? "वापस" : "Back"}
                      </button>
                      <button
                        type="submit"
                        disabled={loading}
                        className="flex-1 py-1.5 px-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-lg shadow-sm transition-all flex items-center justify-center gap-1.5 disabled:opacity-50"
                      >
                        {loading ? (
                          <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        ) : (
                          <>
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>{isHi ? "सत्यापित करें एवं खोलें" : "Verify & Enter Command Centre"}</span>
                          </>
                        )}
                      </button>
                    </div>
                  </form>
                )}
              </div>
            )}

            {/* Official Access Policy & Security Guidance */}
            <div className="p-2.5 bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-lg space-y-1 text-[11px]">
              <div className="flex items-center gap-1.5 text-slate-800 dark:text-slate-200 font-bold text-[11px]">
                <Shield className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400 flex-shrink-0" />
                <span>{isHi ? "सांविधिक सुरक्षा एवं पहुंच नियंत्रण" : "Statutory Access Control & Clearance"}</span>
              </div>
              <p className="text-[10px] text-slate-500 dark:text-slate-400 leading-tight">
                {isHi
                  ? "यह पोर्टल केवल राज्य व केंद्र के अधिकृत आपदा प्रबंधन कर्मियों हेतु सुरक्षित है।"
                  : "Access is strictly restricted to authorized Disaster Management officials & emergency response teams."}
              </p>
              <div className="pt-1 flex items-center justify-between text-[9px] text-slate-400 dark:text-slate-500 border-t border-slate-200 dark:border-slate-800 font-mono">
                <span>IT Act 2000 §§ 43/66</span>
                <span>CERT-In Audit Logging</span>
              </div>
            </div>

            <div className="text-center pt-1 space-y-1 text-[11px]">
              <div>
                <span className="text-slate-500">
                  {lang === "hi" ? "नया विभागीय अधिकारी या विश्लेषक?" : "Need official state clearance?"}{" "}
                  <Link to="/register" className="text-blue-700 dark:text-blue-400 font-bold hover:underline">
                    {lang === "hi" ? "विभागीय आईडी पंजीकृत करें" : "Register Department Account →"}
                  </Link>
                </span>
              </div>
              <div>
                <Link to="/" className="text-slate-600 dark:text-slate-400 hover:underline font-semibold text-[11px]">
                  ← {lang === "hi" ? "सार्वजनिक आपदा मानचित्र पर वापस जाएं" : "Return to Public Hazard Map"}
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      <GoiFooter />
    </div>
  );
}