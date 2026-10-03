import { Link, useNavigate } from "react-router-dom";
import { LogIn, LogOut, User, Layers, Terminal, Sun, Moon, Globe } from "lucide-react";
import { useAuthStore } from "../store/authStore";
import { useUIStore } from "../store/uiStore";
import { useTranslation } from "../i18n/translations";

interface NavbarProps {
  activeTab?: string;
  onSelectTab?: (tab: string) => void;
  isDashboard?: boolean;
}

export default function Navbar({ activeTab, onSelectTab, isDashboard = false }: NavbarProps) {
  const { accessToken, username, user, logout, is2FAVerified } = useAuthStore();
  const { theme, setTheme, lang, setLang } = useUIStore();
  const { t } = useTranslation();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <header className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 z-30 sticky top-0 shadow-lg transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand */}
          <div className="flex items-center space-x-3">
            <Link to="/" className="flex items-center space-x-2 group">
              <div className="w-10 h-10 rounded-full overflow-hidden p-0.5 bg-gradient-to-tr from-blue-700 via-indigo-600 to-amber-500 shadow-md flex-shrink-0">
                <img src="/riskos-logo.png" alt="RiskOS" className="w-full h-full object-cover rounded-full" />
              </div>
              <div>
                <div className="flex items-center space-x-1.5">
                  <span className="font-extrabold tracking-tight text-lg bg-clip-text text-transparent bg-gradient-to-r from-blue-700 to-indigo-700 dark:from-white dark:via-slate-100 dark:to-slate-400">
                    RiskOS
                  </span>
                  <span className="text-[10px] font-semibold uppercase px-1.5 py-0.5 rounded bg-rose-100 dark:bg-rose-500/20 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-500/30">
                    GIS DSS
                  </span>
                </div>
                <p className="text-[10px] text-slate-500 dark:text-slate-400 hidden sm:block">
                  Disaster Risk Reduction & Safe Relocation Decision Platform
                </p>
              </div>
            </Link>
          </div>

          {/* Navigation Links (If on Dashboard) */}
          {isDashboard && onSelectTab && (
            <nav className="hidden md:flex items-center space-x-1 bg-slate-100 dark:bg-slate-950/60 p-1 rounded-xl border border-slate-200 dark:border-slate-800/80">
              <button
                onClick={() => onSelectTab("map")}
                className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors flex items-center space-x-1.5 ${
                  activeTab === "map"
                    ? "bg-indigo-600 text-white shadow-sm"
                    : "text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-800/60"
                }`}
              >
                <Layers className="w-3.5 h-3.5" />
                <span>{t("Risk Map")}</span>
              </button>
              <button
                onClick={() => onSelectTab("plans")}
                className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                  activeTab === "plans"
                    ? "bg-indigo-600 text-white shadow-sm"
                    : "text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-800/60"
                }`}
              >
                {t("Relocation Plans")}
              </button>
              <button
                onClick={() => onSelectTab("safesites")}
                className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                  activeTab === "safesites"
                    ? "bg-indigo-600 text-white shadow-sm"
                    : "text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-800/60"
                }`}
              >
                {t("Safe Sites")}
              </button>
              <button
                onClick={() => onSelectTab("alerts")}
                className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                  activeTab === "alerts"
                    ? "bg-indigo-600 text-white shadow-sm"
                    : "text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-800/60"
                }`}
              >
                {t("Alerts")}
              </button>
              <button
                onClick={() => onSelectTab("analytics")}
                className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                  activeTab === "analytics"
                    ? "bg-indigo-600 text-white shadow-sm"
                    : "text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-800/60"
                }`}
              >
                {t("Analytics")}
              </button>
            </nav>
          )}

          {/* Right Action Area */}
          <div className="flex items-center space-x-3">
            {/* UI Controls */}
            <div className="flex items-center space-x-1 mr-2 border-r border-slate-200 dark:border-slate-800 pr-3">
              <button
                onClick={() => setLang(lang === "en" ? "hi" : "en")}
                className="flex items-center space-x-1 p-1.5 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-md transition-colors"
                title="Toggle Language"
              >
                <Globe className="w-4 h-4" />
                <span className="text-xs font-bold">{lang.toUpperCase()}</span>
              </button>
              <button
                onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                className="p-1.5 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-md transition-colors"
                title="Toggle Theme"
              >
                {theme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
              </button>
            </div>

            <a
              href="http://localhost:8000/system-console/"
              target="_blank"
              rel="noopener noreferrer"
              title="Django Developer Admin Console"
              className="hidden lg:flex items-center space-x-1.5 text-xs text-slate-600 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 bg-slate-50 dark:bg-slate-950/70 border border-slate-200 dark:border-slate-800 px-2.5 py-1.5 rounded-lg transition"
            >
              <Terminal className="w-3.5 h-3.5 text-indigo-500 dark:text-indigo-400" />
              <span>{t("Dev Console")}</span>
            </a>

            {accessToken ? (
              <div className="flex items-center space-x-3">
                <div className="hidden sm:flex flex-col text-right">
                  <div className="flex items-center space-x-1.5 justify-end">
                    <User className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                    <span className="text-xs font-semibold text-slate-900 dark:text-slate-200">
                      {user?.first_name ? `${user.first_name} ${user.last_name || ""}` : username || "Official"}
                    </span>
                  </div>
                  <span className="text-[10px] text-slate-500 dark:text-slate-400">
                    {user?.department || "Disaster Mgmt Authority"} {user?.district ? `— ${user.district}` : ""}
                  </span>
                </div>

                {!isDashboard ? (
                  <button
                    onClick={() => {
                      if (accessToken && is2FAVerified) {
                        navigate("/dashboard");
                      } else {
                        navigate("/login?redirect=/dashboard");
                      }
                    }}
                    className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium px-3 py-1.5 rounded-lg shadow-sm transition"
                  >
                    {t("Open Command Center")}
                  </button>
                ) : null}

                <button
                  onClick={handleLogout}
                  className="flex items-center space-x-1 bg-white dark:bg-slate-800 hover:bg-rose-50 dark:hover:bg-rose-900/60 hover:text-rose-600 dark:hover:text-rose-200 text-slate-700 dark:text-slate-300 px-3 py-1.5 rounded-lg text-xs font-medium border border-slate-200 dark:border-slate-700 transition"
                  title="Logout"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">{t("Logout")}</span>
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Link
                  to="/login"
                  className="flex items-center space-x-1.5 bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 text-white px-4 py-2 rounded-lg text-xs font-semibold shadow-md transition"
                >
                  <LogIn className="w-3.5 h-3.5" />
                  <span>{t("Official Login")}</span>
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
