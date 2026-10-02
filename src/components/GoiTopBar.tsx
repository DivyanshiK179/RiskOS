import { Sun, Moon, Globe, Eye } from "lucide-react";
import { useUIStore } from "../store/uiStore";
import { useTranslation } from "../i18n/translations";

export default function GoiTopBar() {
  const { theme, toggleTheme, lang, setLang, fontSizeLevel, setFontSizeLevel } = useUIStore();
  const { t } = useTranslation();

  return (
    <div className="w-full flex flex-col flex-none z-50">
      {/* Indian National Tricolor Accent Strip */}
      <div className="h-[3px] w-full flex">
        <div className="w-1/3 bg-[#FF9933]" title="Saffron" />
        <div className="w-1/3 bg-white" title="White" />
        <div className="w-1/3 bg-[#138808]" title="Green" />
      </div>

      {/* Top Utility Bar (32px height) */}
      <div className="bg-[#1E1B4B] dark:bg-[#0A0F1D] text-slate-100 text-[11px] px-3 sm:px-6 h-[32px] flex items-center justify-between border-b border-indigo-950/80 dark:border-slate-800 shadow-sm select-none transition-colors">
        {/* Left: Official Government of India breadcrumb */}
        <div className="flex items-center gap-2 sm:gap-2.5 truncate">
          <span className="font-bold tracking-wide text-amber-300">
            {lang === "hi" ? "भारत सरकार | Government of India" : "भारत सरकार | Government of India"}
          </span>
          <span className="text-indigo-400 dark:text-slate-600 hidden sm:inline">•</span>
          <span className="text-slate-200 font-medium hidden md:inline">
            Ministry of Electronics & IT (MeitY)
          </span>
          <span className="text-indigo-400 dark:text-slate-600 hidden lg:inline">•</span>
          <span className="text-emerald-300 text-[10px] uppercase font-bold tracking-wider hidden lg:inline">
            NDMA / SDMA Uttarakhand
          </span>
        </div>

        {/* Right Controls: Compact & Evenly Spaced */}
        <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
          {/* Skip to Main Content */}
          <a
            href="#main-content"
            className="sr-only focus:not-sr-only focus:absolute focus:z-50 focus:bg-amber-400 focus:text-slate-950 focus:px-3 focus:py-1 focus:font-bold focus:rounded shadow-lg"
            aria-label={t("skip_content")}
          >
            {t("skip_content")}
          </a>

          {/* Screen Reader Access */}
          <div className="hidden sm:flex items-center gap-1 text-slate-300 cursor-default" title={t("screen_reader")}>
            <Eye className="w-3.5 h-3.5 text-amber-300" />
            <span className="text-[10px] hidden xl:inline">{t("screen_reader")}</span>
          </div>

          <div className="h-3 w-[1px] bg-indigo-800 dark:bg-slate-700 hidden sm:block" />

          {/* Typography Resizing: A- | A | A+ */}
          <div className="flex items-center bg-indigo-950/80 dark:bg-slate-900 rounded border border-indigo-800/80 dark:border-slate-700 px-1 py-0.5" role="group" aria-label={t("text_size")}>
            <span className="text-[10px] text-slate-400 mr-1 hidden sm:inline">{t("text_size")}:</span>
            <button
              onClick={() => setFontSizeLevel(-1)}
              className={`px-1.5 py-0.2 text-[10px] font-bold rounded transition-colors ${
                fontSizeLevel === -1 ? "bg-amber-400 text-slate-950" : "text-slate-200 hover:text-white hover:bg-indigo-900 dark:hover:bg-slate-800"
              }`}
              title="Decrease text size (A-)"
              aria-label="Decrease text size"
            >
              A-
            </button>
            <button
              onClick={() => setFontSizeLevel(0)}
              className={`px-1.5 py-0.2 text-[10px] font-bold rounded transition-colors ${
                fontSizeLevel === 0 ? "bg-amber-400 text-slate-950" : "text-slate-200 hover:text-white hover:bg-indigo-900 dark:hover:bg-slate-800"
              }`}
              title="Reset text size (A)"
              aria-label="Normal text size"
            >
              A
            </button>
            <button
              onClick={() => setFontSizeLevel(1)}
              className={`px-1.5 py-0.2 text-[10px] font-bold rounded transition-colors ${
                fontSizeLevel === 1 ? "bg-amber-400 text-slate-950" : "text-slate-200 hover:text-white hover:bg-indigo-900 dark:hover:bg-slate-800"
              }`}
              title="Increase text size (A+)"
              aria-label="Increase text size"
            >
              A+
            </button>
          </div>

          <div className="h-3 w-[1px] bg-indigo-800 dark:bg-slate-700" />

          {/* Theme Switcher: Light / Dark */}
          <button
            onClick={toggleTheme}
            className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-indigo-950/80 dark:bg-slate-900 hover:bg-indigo-900 dark:hover:bg-slate-800 border border-indigo-800/80 dark:border-slate-700 text-amber-300 hover:text-amber-200 transition-colors text-[10px] font-semibold"
            title={t("theme_toggle")}
            aria-label={theme === "dark" ? "Switch to Light Mode" : "Switch to Dark Mode"}
          >
            {theme === "dark" ? (
              <>
                <Sun className="w-3 h-3 text-amber-400" />
                <span className="hidden md:inline">{t("light_mode")}</span>
              </>
            ) : (
              <>
                <Moon className="w-3 h-3 text-blue-300" />
                <span className="hidden md:inline">{t("dark_mode")}</span>
              </>
            )}
          </button>

          <div className="h-3 w-[1px] bg-indigo-800 dark:bg-slate-700" />

          {/* Bilingual Language Switcher */}
          <div className="flex items-center bg-indigo-950/80 dark:bg-slate-900 rounded border border-indigo-800/80 dark:border-slate-700 p-0.5">
            <Globe className="w-3 h-3 text-amber-300 ml-1 mr-1" />
            <button
              onClick={() => setLang("en")}
              className={`px-1.5 py-0.2 text-[10px] font-bold rounded transition-colors ${
                lang === "en" ? "bg-amber-400 text-slate-950 shadow-sm" : "text-slate-300 hover:text-white"
              }`}
              title="Switch to English"
            >
              English
            </button>
            <button
              onClick={() => setLang("hi")}
              className={`px-1.5 py-0.2 text-[10px] font-bold rounded transition-colors ${
                lang === "hi" ? "bg-amber-400 text-slate-950 shadow-sm" : "text-slate-300 hover:text-white"
              }`}
              title="हिन्दी में बदलें"
            >
              हिन्दी
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
