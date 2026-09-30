import { useState, useEffect } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createAlert } from "../api/relocation";
import type { AlertSeverity } from "../types";

interface CreateAlertModalProps {
  isOpen: boolean;
  onClose: () => void;
  preselectedHabitationId?: number | null;
}

export default function CreateAlertModal({
  isOpen,
  onClose,
  preselectedHabitationId,
}: CreateAlertModalProps) {
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [severity, setSeverity] = useState<AlertSeverity>("WARNING");
  const [habId, setHabId] = useState<string>(preselectedHabitationId?.toString() ?? "");

  const qc = useQueryClient();

  useEffect(() => {
    if (isOpen) {
      setTitle(""); setMessage(""); setSeverity("WARNING");
      setHabId(preselectedHabitationId?.toString() ?? "");
    }
  }, [isOpen, preselectedHabitationId]);

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
    CRITICAL: "border-red-700 bg-red-950/60 text-red-300",
    WARNING: "border-orange-700 bg-orange-950/60 text-orange-300",
    INFO: "border-blue-700 bg-blue-950/60 text-blue-300",
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 animate-fade-in" onClick={onClose}>
      <div
        className="w-full max-w-md bg-[#0a1220] border border-slate-800 rounded-xl shadow-2xl animate-slide-up"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800">
          <div>
            <h2 className="text-sm font-semibold text-slate-100">Broadcast alert</h2>
            <p className="text-xs text-slate-500 mt-0.5">Issue an official public advisory</p>
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
            <label className="label">Alert severity</label>
            <div className="grid grid-cols-3 gap-2">
              {(["CRITICAL", "WARNING", "INFO"] as const).map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setSeverity(s)}
                  className={`py-2 text-xs font-semibold rounded-md border transition-colors ${
                    severity === s ? severityStyles[s] : "border-slate-700 bg-transparent text-slate-500 hover:border-slate-600"
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="label">Alert title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="input"
              placeholder="e.g. Flood evacuation order — Rudraprayag"
            />
          </div>

          <div>
            <label className="label">Message</label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="input min-h-[100px] resize-none"
              placeholder="Full advisory text visible to field teams and the public hazard map..."
            />
          </div>

          {habId && (
            <div className="p-2.5 bg-slate-900 border border-slate-700 rounded text-xs text-slate-400 flex items-center gap-2">
              <svg className="w-3.5 h-3.5 text-slate-600 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
              </svg>
              Linked to settlement #{habId}
            </div>
          )}

          {create.isError && (
            <div className="p-3 bg-red-950/40 border border-red-900/50 rounded text-xs text-red-400">
              Failed to broadcast alert. Please try again.
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-2 px-5 py-4 border-t border-slate-800">
          <button onClick={onClose} className="btn-ghost text-sm">Cancel</button>
          <button
            onClick={() => create.mutate()}
            disabled={!title || !message || create.isPending}
            className="btn-danger text-sm"
          >
            {create.isPending ? (
              <>
                <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                </svg>
                Broadcasting...
              </>
            ) : "Broadcast alert"}
          </button>
        </div>
      </div>
    </div>
  );
}
