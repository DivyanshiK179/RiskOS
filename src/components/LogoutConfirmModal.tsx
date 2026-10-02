import { useEffect } from "react";
import { AlertTriangle, LogOut, X } from "lucide-react";
import { useTranslation } from "../i18n/translations";

interface LogoutConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  userName?: string;
}

export default function LogoutConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  userName = "Officer",
}: LogoutConfirmModalProps) {
  const { t } = useTranslation();

  // Escape key closes modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fade-in"
      role="dialog"
      aria-modal="true"
      aria-labelledby="logout-dialog-title"
    >
      <div className="bg-white dark:bg-[#131e36] border border-slate-300 dark:border-slate-700/80 rounded-xl shadow-2xl max-w-md w-full p-6 text-slate-800 dark:text-slate-100 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
          aria-label={t("cancel")}
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-start gap-4">
          <div className="w-11 h-11 rounded-full bg-red-100 dark:bg-red-950/80 border border-red-300 dark:border-red-800 flex items-center justify-center flex-shrink-0 text-red-600 dark:text-red-400">
            <AlertTriangle className="w-6 h-6" />
          </div>

          <div className="space-y-2">
            <h3 id="logout-dialog-title" className="text-base font-bold text-slate-900 dark:text-white">
              {t("sign_out_confirm_title")}
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              {t("sign_out_confirm_desc")}
            </p>
            <div className="p-2 rounded bg-slate-100 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 text-[11px] text-slate-600 dark:text-slate-400">
              Active Session: <span className="font-semibold text-slate-900 dark:text-slate-200">{userName}</span> (State Officer - Uttarakhand SDMA)
            </div>
          </div>
        </div>

        <div className="mt-6 flex items-center justify-end gap-3 pt-4 border-t border-slate-200 dark:border-slate-800">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg text-xs font-semibold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-300 dark:border-slate-700 transition-colors"
          >
            {t("cancel")}
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 rounded-lg text-xs font-semibold text-white bg-red-600 hover:bg-red-700 shadow-md transition-colors flex items-center gap-1.5 focus:ring-2 focus:ring-red-400"
          >
            <LogOut className="w-4 h-4" />
            <span>{t("confirm_sign_out_btn")}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
