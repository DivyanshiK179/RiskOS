import { useState, useEffect } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createAlert } from "../api/relocation";
import type { AlertSeverity } from "../types";
import { useTranslation } from "../i18n/translations";

interface CreateAlertModalProps {
  isOpen: boolean;
  onClose: () => void;
  preselectedHabitationId?: number | null;
  initialTitle?: string;
  initialMessage?: string;
  initialSeverity?: AlertSeverity;
}

export default function CreateAlertModal({
  isOpen,
  onClose,
  preselectedHabitationId,
  initialTitle,
  initialMessage,
  initialSeverity,
}: CreateAlertModalProps) {
  const { t } = useTranslation();
  const [title, setTitle] = useState(initialTitle || "");
  const [message, setMessage] = useState(initialMessage || "");
  const [severity, setSeverity] = useState<AlertSeverity>(initialSeverity || "WARNING");
  const [habId, setHabId] = useState<string>(preselectedHabitationId?.toString() ?? "");

  const qc = useQueryClient();

  useEffect(() => {
    if (isOpen) {
      setTitle(initialTitle || "");
      setMessage(initialMessage || "");
      setSeverity(initialSeverity || "WARNING");
      setHabId(preselectedHabitationId?.toString() ?? "");
    }
  }, [isOpen, preselectedHabitationId, initialTitle, initialMessage, initialSeverity]);

  const create = useMutation({
    mutationFn: () =>
      createAlert({
        title,
        message,
        severity,
        habitation: habId ? parseInt(habId) : undefined,
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["alerts"] });
      qc.invalidateQueries({ queryKey: ["alerts-public"] });
      onClose();
    },
  });

  if (!isOpen) return null;

  const severityStyles: Record<string, string> = {
    CRITICAL: "border-red-300 dark:border-red-700 bg-red-100 dark:bg-red-950/60 text-red-700 dark:text-red-300",
    WARNING: "border-orange-300 dark:border-orange-700 bg-orange-100 dark:bg-orange-950/60 text-orange-700 dark:text-orange-300",
    INFO: "border-blue-300 dark:border-blue-700 bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300",
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 animate-fade-in" onClick={onClose}>
      <div
        className="w-full max-w-md bg-white dark:bg-[#0a1220] border border-slate-200 dark:border-slate-800 rounded-xl shadow-2xl animate-slide-up"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200 dark:border-slate-800">
          <div>
            <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-100">{t("Broadcast Early Warning Alert")}</h2>
            <p className="text-xs text-slate-500 dark:text-slate-500 mt-0.5">{t("Broadcast emergency advisories to field teams and the public map")}</p>
          </div>
          <button onClick={onClose} className="btn-ghost p-1.5">
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>

        {/* Body */}
        <div className="p-5 space-y-4">
          {/* Severity selector */}
          <div>
            <label className="label">{t("Alert Severity")}</label>
            <div className="grid grid-cols-3 gap-2">
              {(["CRITICAL", "WARNING", "INFO"] as const).map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setSeverity(s)}
                  className={`py-2 text-xs font-semibold rounded-md border transition-colors ${
                    severity === s ? severityStyles[s] : "border-slate-300 dark:border-slate-700 bg-transparent text-slate-500 dark:text-slate-500 hover:border-slate-600"
                  }`}
                >
                  {t(s)}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="label">{t("Alert Headline")}</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="input"
              placeholder="..."
            />
          </div>

          <div>
            <label className="label">{t("Detailed Emergency Message")}</label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="input min-h-[100px] resize-none"
              placeholder="..."
            />
          </div>

          {habId && (
            <div className="p-2.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded text-xs text-slate-600 dark:text-slate-400 flex items-center gap-2">
              <svg className="w-3.5 h-3.5 text-slate-600 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
              </svg>
              {t("Linked to settlement")} #{habId}
            </div>
          )}

          {create.isError && (
            <div className="p-3 bg-red-100 dark:bg-red-950/40 border border-red-300 dark:border-red-900/50 rounded text-xs text-red-700 dark:text-red-400">
              {t("Failed to broadcast alert. Please try again.")}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-2 px-5 py-4 border-t border-slate-200 dark:border-slate-800">
          <button onClick={onClose} className="btn-ghost text-sm">{t("cancel")}</button>
          <button
            onClick={() => create.mutate()}
            disabled={!title || !message || create.isPending}
            className="btn-danger text-sm"
          >
            {create.isPending ? t("Broadcasting...") : t("Broadcast Alert")}
          </button>
        </div>
      </div>
    </div>
  );
}
