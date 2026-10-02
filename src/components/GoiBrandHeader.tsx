import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Clock, User, LogOut, LogIn, ExternalLink } from "lucide-react";
import { useAuthStore } from "../store/authStore";
import { useTranslation } from "../i18n/translations";
import LogoutConfirmModal from "./LogoutConfirmModal";

interface GoiBrandHeaderProps {
  isPublic?: boolean;
}

export default function GoiBrandHeader({ isPublic = false }: GoiBrandHeaderProps) {
  const { accessToken, username, user, logout } = useAuthStore();
  const { t, lang } = useTranslation();
  const navigate = useNavigate();
  const [logoutModalOpen, setLogoutModalOpen] = useState(false);
  const [currentTime, setCurrentTime] = useState("");

  // Live IST Clock (DD Mon YYYY, HH:mm:ss IST)
  useEffect(() => {
    const updateClock = () => {
      const now = new Date();
      const options: Intl.DateTimeFormatOptions = {
        timeZone: "Asia/Kolkata",
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: false,
      };
      const formatter = new Intl.DateTimeFormat("en-IN", options);
      // Format e.g. "02 Oct 2026, 16:30:00 IST"
      setCurrentTime(formatter.format(now) + " IST");
    };

    updateClock();
    const interval = setInterval(updateClock, 1000);
    return () => clearInterval(interval);
  }, []);

  const displayName = user?.first_name
    ? `${user.first_name} ${user.last_name || ""}`.trim()
    : username || "State Officer";

  const handleConfirmLogout = () => {
    setLogoutModalOpen(false);
    logout();
    navigate("/login");
  };

  return (
    <>
      <header className="w-full flex-none bg-white dark:bg-[#0F172A] border-b border-slate-200 dark:border-slate-800 shadow-sm transition-colors z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-[60px] flex items-center justify-between gap-4">
          {/* Left: Official Circular RiskOS Emblem + Brand Typography */}
          <Link to="/" className="flex items-center gap-3 group select-none min-w-0">
            {/* Circular RiskOS Emblem */}
            <div className="h-11 w-11 flex-shrink-0 rounded-full overflow-hidden p-0.5 bg-gradient-to-tr from-blue-700 via-indigo-600 to-amber-500 shadow-md">
              <img
                src="/riskos-logo.png"
                alt="RiskOS Official Emblem"
                className="w-full h-full object-cover rounded-full"
                onError={(e) => {
                  // Fallback if image fails to load
                  (e.target as HTMLImageElement).src = "/favicon.ico";
                }}
              />
            </div>

            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-xl font-extrabold tracking-tight text-[#1E3A8A] dark:text-white font-serif leading-none">
                  RiskOS
                </span>
                <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider bg-blue-50 dark:bg-blue-950/80 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                  GOVERNMENT OF INDIA • STATUTORY SDMA PORTAL
                </span>
              </div>
              <p className="text-[11px] font-medium text-slate-600 dark:text-slate-300 leading-tight mt-0.5 truncate">
                <strong className="text-amber-700 dark:text-amber-400 font-semibold">
                  {lang === "hi" ? "जोखिम ओएस" : "जोखिम ओएस"}
                </strong>
                {" | "}
                <span>{lang === "hi" ? "राष्ट्रीय आपदा जोखिम एवं पुनर्वास निर्णय समर्थन प्रणाली (GIS-DSS)" : "National Disaster Risk & Relocation Decision Support System (GIS-DSS)"}</span>
              </p>
            </div>
          </Link>

          {/* Center: Standard GOI Ministry Endorsements (NDMA India, Digital India, SDMA Uttarakhand) */}
          <div className="hidden xl:flex items-center gap-3 px-3 py-1 bg-slate-50 dark:bg-slate-900/80 rounded-lg border border-slate-200 dark:border-slate-800/80">
            {/* NDMA India Crest */}
            <div className="flex items-center gap-1.5">
              <div className="w-5 h-5 rounded bg-blue-700 flex items-center justify-center text-[9px] font-black text-white">
                ND
              </div>
              <div className="leading-none text-left">
                <span className="text-[9px] font-bold text-slate-900 dark:text-white block">NDMA India</span>
                <span className="text-[8px] text-slate-500 dark:text-slate-400 block">Ministry of Home Affairs</span>
              </div>
            </div>

            <span className="text-slate-300 dark:text-slate-700">|</span>

            {/* Digital India Emblem */}
            <div className="flex items-center gap-1.5">
              <div className="w-5 h-5 rounded bg-emerald-600 flex items-center justify-center text-[9px] font-black text-white">
                DI
              </div>
              <div className="leading-none text-left">
                <span className="text-[9px] font-bold text-slate-900 dark:text-white block">Digital India</span>
                <span className="text-[8px] text-slate-500 dark:text-slate-400 block">MeitY • Geospatial</span>
              </div>
            </div>

            <span className="text-slate-300 dark:text-slate-700">|</span>

            {/* NDMA / SDMA Uttarakhand */}
            <div className="flex items-center gap-1.5">
              <div className="w-5 h-5 rounded bg-amber-600 flex items-center justify-center text-[9px] font-black text-white">
                DM
              </div>
              <div className="leading-none text-left">
                <span className="text-[9px] font-bold text-slate-900 dark:text-white block">SDMA Uttarakhand</span>
                <span className="text-[8px] text-slate-500 dark:text-slate-400 block">Disaster Relief Cell</span>
              </div>
            </div>
          </div>

          {/* Right: Live Clock, State Officer Profile Badge & Actions */}
          <div className="flex items-center gap-3 sm:gap-4 flex-shrink-0">
            {/* Live IST Clock */}
            <div className="hidden lg:flex flex-col items-end text-right border-r border-slate-200 dark:border-slate-800 pr-3">
              <div className="flex items-center gap-1.5 text-[11px] font-mono font-bold text-slate-800 dark:text-slate-200">
                <Clock className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                <span>{currentTime || "Loading IST..."}</span>
              </div>
              <span className="text-[10px] font-semibold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                {t("official_tag")}
              </span>
            </div>

            {/* User Session or Login */}
            {accessToken ? (
              <div className="flex items-center gap-2 sm:gap-3">
                {/* State Officer Profile Badge */}
                <div className="hidden sm:flex flex-col text-right">
                  <div className="flex items-center gap-1.5 justify-end">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 ring-2 ring-emerald-300 dark:ring-emerald-950" title="Authenticated Live Session" />
                    <User className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                    <span className="text-xs font-bold text-slate-900 dark:text-slate-100">
                      {displayName}
                    </span>
                  </div>
                  <span className="text-[10px] font-medium text-amber-700 dark:text-amber-400">
                    State Officer - Uttarakhand
                  </span>
                </div>

                {isPublic && (
                  <Link
                    to="/dashboard"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#1E3A8A] hover:bg-blue-900 text-white text-xs font-bold rounded-lg shadow-sm transition"
                  >
                    <span>{t("command_centre")}</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </Link>
                )}

                {/* Standard Red-accented Sign Out */}
                <button
                  onClick={() => setLogoutModalOpen(true)}
                  className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-red-700 dark:text-red-400 bg-red-50 dark:bg-red-950/50 hover:bg-red-100 dark:hover:bg-red-900/60 border border-red-200 dark:border-red-900 transition-colors"
                  title={t("sign_out")}
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">{t("sign_out")}</span>
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  to="/login"
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#1E3A8A] hover:bg-blue-900 text-white text-xs font-bold shadow-md transition"
                >
                  <LogIn className="w-3.5 h-3.5 text-amber-400" />
                  <span>{t("official_login")}</span>
                </Link>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Sign Out Confirmation Dialog */}
      <LogoutConfirmModal
        isOpen={logoutModalOpen}
        onClose={() => setLogoutModalOpen(false)}
        onConfirm={handleConfirmLogout}
        userName={displayName}
      />
    </>
  );
}
