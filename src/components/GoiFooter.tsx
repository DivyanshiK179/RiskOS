import React, { useState, useRef } from "react";
import { useTranslation } from "../i18n/translations";
import PolicyModal, { type PolicyKey } from "./PolicyModal";

export default function GoiFooter() {
  const { t } = useTranslation();
  const [activePolicy, setActivePolicy] = useState<PolicyKey | null>(null);
  const triggerRef = useRef<HTMLButtonElement | null>(null);

  const openPolicy = (key: PolicyKey, e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    triggerRef.current = e.currentTarget;
    setActivePolicy(key);
  };

  return (
    <footer className="w-full flex-none bg-[#0B2545] text-slate-300 text-xs border-t border-blue-900 mt-auto select-none">
      {/* Tricolor top border strip */}
      <div className="h-[2px] w-full flex">
        <div className="w-1/3 bg-[#FF9933]" />
        <div className="w-1/3 bg-white" />
        <div className="w-1/3 bg-[#138808]" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5">
        {/* Compliance & Attributions Top Row */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 pb-4 border-b border-blue-900/60 text-center md:text-left">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded bg-blue-900/80 border border-amber-500/40 flex items-center justify-center text-amber-400 font-bold text-xs flex-shrink-0">
              GOI
            </div>
            <div>
              <p className="font-semibold text-slate-100">
                {t("footer_portal_credit")}
              </p>
              <p className="text-[11px] text-amber-300">
                {t("footer_compliance")}
              </p>
            </div>
          </div>

          <div className="text-[11px] text-slate-300 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            <span>{t("National Disaster Management Cloud Infrastructure")}</span>
          </div>
        </div>

        {/* Standard GIGW Policy Links */}
        <div className="py-3 flex flex-wrap items-center justify-center md:justify-start gap-x-6 gap-y-2 text-[11px] text-slate-300">
          <button
            type="button"
            onClick={(e) => openPolicy("terms", e)}
            className="hover:text-amber-300 transition-colors cursor-pointer bg-transparent border-0 p-0 text-inherit font-inherit"
          >
            {t("footer_terms")}
          </button>
          <span className="text-blue-800 hidden sm:inline">|</span>
          <button
            type="button"
            onClick={(e) => openPolicy("privacy", e)}
            className="hover:text-amber-300 transition-colors cursor-pointer bg-transparent border-0 p-0 text-inherit font-inherit"
          >
            {t("footer_privacy")}
          </button>
          <span className="text-blue-800 hidden sm:inline">|</span>
          <button
            type="button"
            onClick={(e) => openPolicy("hyperlink", e)}
            className="hover:text-amber-300 transition-colors cursor-pointer bg-transparent border-0 p-0 text-inherit font-inherit"
          >
            {t("footer_hyperlink")}
          </button>
          <span className="text-blue-800 hidden sm:inline">|</span>
          <button
            type="button"
            onClick={(e) => openPolicy("copyright", e)}
            className="hover:text-amber-300 transition-colors cursor-pointer bg-transparent border-0 p-0 text-inherit font-inherit"
          >
            {t("footer_copyright")}
          </button>
          <span className="text-blue-800 hidden sm:inline">|</span>
          <button
            type="button"
            onClick={(e) => openPolicy("accessibility", e)}
            className="hover:text-amber-300 transition-colors cursor-pointer bg-transparent border-0 p-0 text-inherit font-inherit"
          >
            {t("footer_accessibility")}
          </button>
          <span className="text-blue-800 hidden sm:inline">|</span>
          <button
            type="button"
            onClick={(e) => openPolicy("disclaimer", e)}
            className="hover:text-amber-300 transition-colors cursor-pointer bg-transparent border-0 p-0 text-inherit font-inherit"
          >
            {t("footer_disclaimer")}
          </button>
        </div>

        {/* Bottom copyright & last updated row */}
        <div className="pt-3 border-t border-blue-900/40 flex flex-col sm:flex-row items-center justify-between gap-2 text-[10px] text-slate-400">
          <p>{t("footer_copyright_text")}</p>
          <div className="flex items-center gap-4">
            <span className="text-amber-400 font-medium">{t("footer_last_updated")}</span>
            <span>{t("Version")}: 3.2-PROD-STABLE</span>
          </div>
        </div>
      </div>

      {/* Accessible GIGW 3.0 Policy Dialog */}
      {activePolicy && (
        <PolicyModal
          policyKey={activePolicy}
          onClose={() => setActivePolicy(null)}
          triggerRef={triggerRef}
        />
      )}
    </footer>
  );
}
