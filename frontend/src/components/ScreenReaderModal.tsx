import React, { useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { Link } from "react-router-dom";
import { X, Eye, Keyboard, Monitor, ExternalLink, ArrowRight, CheckCircle2 } from "lucide-react";
import { useTranslation } from "../i18n/translations";

interface ScreenReaderModalProps {
  isOpen: boolean;
  onClose: () => void;
  triggerRef?: React.RefObject<HTMLElement | null>;
}

export default function ScreenReaderModal({ isOpen, onClose, triggerRef }: ScreenReaderModalProps) {
  const { lang } = useTranslation();
  const modalRef = useRef<HTMLDivElement>(null);
  const closeBtnRef = useRef<HTMLButtonElement>(null);

  // Focus trap & Escape key listener
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
        return;
      }

      if (e.key === "Tab") {
        if (!modalRef.current) return;
        const focusableElements = modalRef.current.querySelectorAll<HTMLElement>(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        const focusable = Array.from(focusableElements).filter(
          (el) => !el.hasAttribute("disabled") && el.offsetParent !== null
        );

        if (focusable.length === 0) return;

        const firstElement = focusable[0];
        const lastElement = focusable[focusable.length - 1];

        if (e.shiftKey) {
          if (document.activeElement === firstElement) {
            e.preventDefault();
            lastElement.focus();
          }
        } else {
          if (document.activeElement === lastElement) {
            e.preventDefault();
            firstElement.focus();
          }
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    // Initial focus onto close button or primary action
    const timer = setTimeout(() => {
      closeBtnRef.current?.focus();
    }, 50);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      clearTimeout(timer);
      if (triggerRef?.current) {
        triggerRef.current.focus();
      }
    };
  }, [isOpen, onClose, triggerRef]);

  if (!isOpen) return null;

  const handleSkipToMain = () => {
    onClose();
    setTimeout(() => {
      // Try to find main content or search bar
      const searchInput = document.querySelector<HTMLElement>('input[type="text"], input[type="search"]');
      const mainContent = document.getElementById("main-content");
      if (searchInput) {
        searchInput.focus();
        searchInput.scrollIntoView({ behavior: "smooth", block: "center" });
      } else if (mainContent) {
        mainContent.setAttribute("tabindex", "-1");
        mainContent.focus();
        mainContent.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    }, 100);
  };

  const modalContent = (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-6 bg-slate-950/70 backdrop-blur-sm animate-fade-in"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
      role="presentation"
    >
      <div
        ref={modalRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="sr-modal-title"
        aria-describedby="sr-modal-desc"
        className="w-full max-w-4xl max-h-[90vh] overflow-y-auto bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 rounded-xl shadow-2xl transition-all flex flex-col"
      >
        {/* Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 flex items-center justify-center flex-shrink-0">
              <Eye className="w-5 h-5" />
            </div>
            <div>
              <h2 id="sr-modal-title" className="text-base sm:text-lg font-bold text-slate-900 dark:text-white leading-snug">
                {lang === "hi"
                  ? "स्क्रीन रीडर एक्सेस एवं सहायक प्रौद्योगिकी सूचना"
                  : "Screen Reader Access & Assistive Technologies Information"}
              </h2>
              <p id="sr-modal-desc" className="text-xs text-slate-500 dark:text-slate-400">
                {lang === "hi"
                  ? "भारत सरकार सुगम्यता मानक (GIGW 3.0 / WCAG 2.1 AA Compliance)"
                  : "Statutory GIGW 3.0 / WCAG 2.1 AA Accessibility Standards (NIC / MeitY)"}
              </p>
            </div>
          </div>
          <button
            ref={closeBtnRef}
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors focus:outline-none focus:ring-2 focus:ring-amber-500"
            aria-label={lang === "hi" ? "डायलॉग बंद करें" : "Close dialogue"}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body Content */}
        <div className="px-6 py-5 space-y-6 overflow-y-auto text-xs sm:text-sm">
          {/* Statutory Statement */}
          <div className="p-3.5 rounded-lg bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900/50 text-blue-900 dark:text-blue-200 leading-relaxed text-xs">
            <p className="font-semibold mb-1 flex items-center gap-1.5 text-blue-700 dark:text-blue-300">
              <CheckCircle2 className="w-4 h-4" />
              {lang === "hi" ? "वैधानिक सुगम्यता अनुपालन" : "Statutory Accessibility Assurance"}
            </p>
            {lang === "hi"
              ? "यह पोर्टल भारत सरकार की वेबसाइटों हेतु दिशानिर्देश (GIGW 3.0) एवं वर्ल्ड वाइड वेब कंसोर्टियम (W3C) के वेब कंटेंट एक्सेसिबिलिटी दिशानिर्देश (WCAG 2.1 AA) का पूर्णतः अनुपालन करता है। दृष्टिबाधित एवं दिव्यांग नागरिक विभिन्न सहायक तकनीकों का उपयोग कर इस पोर्टल की आपदा सूचनाओं को सुगमता से पढ़ सकते हैं।"
              : "RiskOS strictly adheres to the Guidelines for Indian Government Websites (GIGW 3.0) and World Wide Web Consortium (W3C) Web Content Accessibility Guidelines (WCAG 2.1 Level AA). Citizens and emergency personnel with visual or physical impairments can access geospatial hazard analytics using common assistive technologies."}
          </div>

          {/* Compatible Screen Readers Table */}
          <section aria-labelledby="screen-reader-table-title" className="space-y-3">
            <h3 id="screen-reader-table-title" className="text-sm font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">
              <Monitor className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              {lang === "hi" ? "संगत स्क्रीन रीडर सॉफ्टवेयर (Compatible Screen Readers)" : "Compatible Screen Readers & Assistive Software"}
            </h3>
            <div className="overflow-x-auto rounded-lg border border-slate-200 dark:border-slate-800">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-100 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 font-semibold border-b border-slate-200 dark:border-slate-800">
                    <th scope="col" className="p-2.5 sm:p-3">{lang === "hi" ? "स्क्रीन रीडर" : "Screen Reader"}</th>
                    <th scope="col" className="p-2.5 sm:p-3">{lang === "hi" ? "प्रकार / प्रदाता" : "Type / Provider"}</th>
                    <th scope="col" className="p-2.5 sm:p-3">{lang === "hi" ? "ऑपरेटिंग सिस्टम" : "Operating System"}</th>
                    <th scope="col" className="p-2.5 sm:p-3">{lang === "hi" ? "अनुपालन स्थिति" : "Access Level"}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-slate-800 text-slate-600 dark:text-slate-300">
                  <tr className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                    <td className="p-2.5 sm:p-3 font-semibold text-slate-900 dark:text-slate-100">
                      <div className="flex items-center gap-1.5">
                        <span>NVDA (NonVisual Desktop Access)</span>
                        <a
                          href="https://www.nvaccess.org/"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 dark:text-blue-400 hover:underline inline-flex items-center"
                          title="Visit NV Access Official Website (External Link)"
                        >
                          <ExternalLink className="w-3 h-3 ml-0.5" />
                        </a>
                      </div>
                    </td>
                    <td className="p-2.5 sm:p-3">NV Access (Free / Open Source)</td>
                    <td className="p-2.5 sm:p-3">Windows 10 / 11</td>
                    <td className="p-2.5 sm:p-3 text-emerald-600 dark:text-emerald-400 font-semibold">
                      {lang === "hi" ? "पूर्ण अनुपालन (अनुशंसित)" : "Full Support (Recommended)"}
                    </td>
                  </tr>
                  <tr className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                    <td className="p-2.5 sm:p-3 font-semibold text-slate-900 dark:text-slate-100">
                      <div className="flex items-center gap-1.5">
                        <span>JAWS (Job Access With Speech)</span>
                        <a
                          href="https://www.freedomscientific.com/products/software/jaws/"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 dark:text-blue-400 hover:underline inline-flex items-center"
                          title="Visit Freedom Scientific JAWS (External Link)"
                        >
                          <ExternalLink className="w-3 h-3 ml-0.5" />
                        </a>
                      </div>
                    </td>
                    <td className="p-2.5 sm:p-3">Freedom Scientific (Commercial)</td>
                    <td className="p-2.5 sm:p-3">Windows</td>
                    <td className="p-2.5 sm:p-3 text-emerald-600 dark:text-emerald-400 font-semibold">
                      {lang === "hi" ? "पूर्ण अनुपालन" : "Full Support"}
                    </td>
                  </tr>
                  <tr className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                    <td className="p-2.5 sm:p-3 font-semibold text-slate-900 dark:text-slate-100">
                      VoiceOver
                    </td>
                    <td className="p-2.5 sm:p-3">Apple Inc. (Integrated natively)</td>
                    <td className="p-2.5 sm:p-3">macOS / iOS / iPadOS</td>
                    <td className="p-2.5 sm:p-3 text-emerald-600 dark:text-emerald-400 font-semibold">
                      {lang === "hi" ? "देशी समर्थन (Native)" : "Native System Support"}
                    </td>
                  </tr>
                  <tr className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                    <td className="p-2.5 sm:p-3 font-semibold text-slate-900 dark:text-slate-100">
                      TalkBack
                    </td>
                    <td className="p-2.5 sm:p-3">Google LLC (Integrated natively)</td>
                    <td className="p-2.5 sm:p-3">Android</td>
                    <td className="p-2.5 sm:p-3 text-emerald-600 dark:text-emerald-400 font-semibold">
                      {lang === "hi" ? "देशी मोबाइल समर्थन" : "Native Mobile Support"}
                    </td>
                  </tr>
                  <tr className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                    <td className="p-2.5 sm:p-3 font-semibold text-slate-900 dark:text-slate-100">
                      Narrator
                    </td>
                    <td className="p-2.5 sm:p-3">Microsoft Corp (Integrated natively)</td>
                    <td className="p-2.5 sm:p-3">Windows 10 / 11</td>
                    <td className="p-2.5 sm:p-3 text-emerald-600 dark:text-emerald-400 font-semibold">
                      {lang === "hi" ? "देशी ओएस समर्थन" : "Native OS Support"}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          {/* Keyboard Navigation & Access Keys Guide */}
          <section aria-labelledby="keyboard-guide-title" className="space-y-3">
            <h3 id="keyboard-guide-title" className="text-sm font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">
              <Keyboard className="w-4 h-4 text-amber-500" />
              {lang === "hi" ? "कीबोर्ड नेविगेशन एवं एक्सेस कुंजी गाइड" : "Keyboard Navigation & Access Keys Guide"}
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
              <div className="p-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-850/60 flex items-start gap-2.5">
                <kbd className="px-2 py-1 rounded bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 font-mono text-slate-800 dark:text-slate-200 font-bold shadow-sm flex-shrink-0">
                  Tab
                </kbd>
                <div>
                  <span className="font-semibold text-slate-900 dark:text-slate-100 block">
                    {lang === "hi" ? "अगले लिंक या बटन पर जाएं" : "Sequential Navigation"}
                  </span>
                  <p className="text-slate-500 dark:text-slate-400 text-[11px]">
                    {lang === "hi"
                      ? "Tab दबाकर आगे तथा Shift + Tab दबाकर पिछले इंटरैक्टिव तत्व पर लौटें।"
                      : "Navigate forward sequentially; press Shift + Tab to navigate backwards."}
                  </p>
                </div>
              </div>

              <div className="p-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-850/60 flex items-start gap-2.5">
                <kbd className="px-2 py-1 rounded bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 font-mono text-slate-800 dark:text-slate-200 font-bold shadow-sm flex-shrink-0">
                  Enter / Space
                </kbd>
                <div>
                  <span className="font-semibold text-slate-900 dark:text-slate-100 block">
                    {lang === "hi" ? "चयन एवं सक्रियण" : "Activate & Select"}
                  </span>
                  <p className="text-slate-500 dark:text-slate-400 text-[11px]">
                    {lang === "hi"
                      ? "बटन क्लिक करने, लिंक खोलने या अकॉर्डियन को विस्तारित करने हेतु उपयोग करें।"
                      : "Activate buttons, open links, and toggle filter accordions."}
                  </p>
                </div>
              </div>

              <div className="p-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-850/60 flex items-start gap-2.5">
                <kbd className="px-2 py-1 rounded bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 font-mono text-slate-800 dark:text-slate-200 font-bold shadow-sm flex-shrink-0">
                  Alt + 1 / Alt + S
                </kbd>
                <div>
                  <span className="font-semibold text-slate-900 dark:text-slate-100 block">
                    {lang === "hi" ? "मुख्य खोज / मानचित्र पर जाएं" : "Skip to Main Search / GIS Canvas"}
                  </span>
                  <p className="text-slate-500 dark:text-slate-400 text-[11px]">
                    {lang === "hi"
                      ? "सीधे मुख्य खोज बार अथवा जीआईएस मानचित्र कैनवास पर फोकस करें।"
                      : "Direct keyboard shortcut to jump straight to primary search or GIS canvas."}
                  </p>
                </div>
              </div>

              <div className="p-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-850/60 flex items-start gap-2.5">
                <kbd className="px-2 py-1 rounded bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 font-mono text-slate-800 dark:text-slate-200 font-bold shadow-sm flex-shrink-0">
                  Alt + 2
                </kbd>
                <div>
                  <span className="font-semibold text-slate-900 dark:text-slate-100 block">
                    {lang === "hi" ? "मुख्य नेविगेशन मेन्यू" : "Main Navigation Bar"}
                  </span>
                  <p className="text-slate-500 dark:text-slate-400 text-[11px]">
                    {lang === "hi"
                      ? "पोर्टल के प्राथमिक नेविगेशन मेन्यू लिंक पर त्वरित फोकस करें।"
                      : "Directly moves keyboard focus to the main portal navigation links."}
                  </p>
                </div>
              </div>

              <div className="p-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-850/60 flex items-start gap-2.5 sm:col-span-2">
                <kbd className="px-2 py-1 rounded bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 font-mono text-slate-800 dark:text-slate-200 font-bold shadow-sm flex-shrink-0">
                  Esc
                </kbd>
                <div>
                  <span className="font-semibold text-slate-900 dark:text-slate-100 block">
                    {lang === "hi" ? "डायलॉग / बफ़र बंद करें" : "Dismiss Modals & Drawers"}
                  </span>
                  <p className="text-slate-500 dark:text-slate-400 text-[11px]">
                    {lang === "hi"
                      ? "खुले हुए मोडल डायलॉग, साइडबार ड्रॉवर या सक्रिय आपदा रेडियल बफ़र को निरस्त करें।"
                      : "Close any active modal dialogs, flyout drawers, or hazard target buffers."}
                  </p>
                </div>
              </div>
            </div>
          </section>
        </div>

        {/* Footer Actions */}
        <div className="sticky bottom-0 z-10 flex flex-col sm:flex-row items-center justify-between gap-3 px-6 py-3.5 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/95 backdrop-blur-md">
          <div className="flex flex-col sm:flex-row items-center gap-2.5 w-full sm:w-auto">
            <button
              type="button"
              onClick={handleSkipToMain}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs transition-colors shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <span>{lang === "hi" ? "सीधे मुख्य सामग्री पर जाएं" : "Skip Directly to Main Content"}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>

            <Link
              to="/accessibility-grievance"
              onClick={onClose}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 font-semibold text-xs transition shadow-sm"
            >
              <span>{lang === "hi" ? "सुलभता शिकायत (Grievance)" : "Report Accessibility Barrier"}</span>
              <ExternalLink className="w-3.5 h-3.5 text-blue-500" />
            </Link>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-full sm:w-auto px-4 py-2 rounded-lg bg-slate-200 hover:bg-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-semibold text-xs transition-colors focus:outline-none focus:ring-2 focus:ring-slate-400"
          >
            {lang === "hi" ? "बंद करें" : "Close"}
          </button>
        </div>
      </div>
    </div>
  );

  return typeof document !== "undefined" ? createPortal(modalContent, document.body) : null;
}
