import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useQueryClient, useMutation } from "@tanstack/react-query";
import { getHabitations } from "../api/habitations";
import { getSafeSites } from "../api/safesites";
import { createRelocationPlan } from "../api/relocation";
import type { PriorityLevel, SafeSiteGeoJSON } from "../types";
import { useTranslation } from "../i18n/translations";

interface CreatePlanModalProps {
  isOpen: boolean;
  onClose: () => void;
  preselectedHabitationId?: number | null;
  preselectedSafeSiteId?: number | null;
  defaultPopulation?: number;
}

export default function CreatePlanModal({
  isOpen,
  onClose,
  preselectedHabitationId,
  preselectedSafeSiteId,
  defaultPopulation = 0,
}: CreatePlanModalProps) {
  const { t } = useTranslation();
  const [habitationId, setHabitationId] = useState<string>(preselectedHabitationId?.toString() ?? "");
  const [safeSiteId, setSafeSiteId] = useState<string>(preselectedSafeSiteId?.toString() ?? "");
  const [population, setPopulation] = useState<string>(defaultPopulation?.toString() ?? "");
  const [priority, setPriority] = useState<PriorityLevel>("SHORT_TERM");
  const [notes, setNotes] = useState("");

  const qc = useQueryClient();

  useEffect(() => {
    if (isOpen) {
      setHabitationId(preselectedHabitationId?.toString() ?? "");
      setSafeSiteId(preselectedSafeSiteId?.toString() ?? "");
      setPopulation(defaultPopulation?.toString() ?? "");
      setNotes("");
    }
  }, [isOpen, preselectedHabitationId, preselectedSafeSiteId, defaultPopulation]);

  const { data: habsData } = useQuery({
    queryKey: ["habitations-all"],
    queryFn: () => getHabitations({}),
    enabled: isOpen,
  });
  const { data: sitesData } = useQuery<SafeSiteGeoJSON>({
    queryKey: ["safe-sites"],
    queryFn: () => getSafeSites(),
    enabled: isOpen,
  });

  const create = useMutation({
    mutationFn: () =>
      createRelocationPlan({
        habitation: parseInt(habitationId),
        safe_site: parseInt(safeSiteId),
        population_to_relocate: parseInt(population),
        priority,
        notes,
        status: "PROPOSED",
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["relocation-plans"] });
      onClose();
    },
  });

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 animate-fade-in" onClick={onClose}>
      <div
        className="w-full max-w-md bg-white dark:bg-[#0a1220] border border-slate-200 dark:border-slate-800 rounded-xl shadow-2xl animate-slide-up"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200 dark:border-slate-800">
          <div>
            <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-100">{t("Create Relocation Plan")}</h2>
            <p className="text-xs text-slate-500 dark:text-slate-500 mt-0.5">{t("Manage evacuation and rehabilitation operations")}</p>
          </div>
          <button onClick={onClose} className="btn-ghost p-1.5">
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>

        {/* Body */}
        <div className="p-5 space-y-4">
          <div>
            <label className="label">{t("Target Habitation")}</label>
            <select value={habitationId} onChange={(e) => setHabitationId(e.target.value)} className="select">
              <option value="">{t("search_placeholder")}</option>
              {habsData?.features.map((f) => (
                <option key={f.id} value={f.id}>
                  {f.properties.name} — {t(f.properties.district)}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="label">{t("Assigned Safe Site")}</label>
            <select value={safeSiteId} onChange={(e) => setSafeSiteId(e.target.value)} className="select">
              <option value="">{t("search_placeholder")}</option>
              {sitesData?.features?.map((f: any) => (
                <option key={f.id} value={f.id}>
                  {f.properties.name} — {t("Capacity:")} {(f.properties.remaining_capacity ?? f.properties.estimated_capacity).toLocaleString()}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">{t("Population to Relocate")}</label>
              <input
                type="number"
                min="1"
                value={population}
                onChange={(e) => setPopulation(e.target.value)}
                className="input"
                placeholder="250"
              />
            </div>
            <div>
              <label className="label">{t("Priority Level")}</label>
              <select value={priority} onChange={(e) => setPriority(e.target.value as PriorityLevel)} className="select">
                <option value="IMMEDIATE">{t("IMMEDIATE")}</option>
                <option value="SHORT_TERM">{t("URGENT")}</option>
                <option value="MEDIUM_TERM">{t("ROUTINE")}</option>
              </select>
            </div>
          </div>

          <div>
            <label className="label">{t("Operational Notes")}</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="input min-h-[80px] resize-none"
              placeholder="..."
            />
          </div>

          {create.isError && (
            <div className="p-3 bg-red-100 dark:bg-red-950/40 border border-red-300 dark:border-red-900/50 rounded text-xs text-red-700 dark:text-red-400">
              {t("Failed to create plan. Please check all fields and try again.")}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-2 px-5 py-4 border-t border-slate-200 dark:border-slate-800">
          <button onClick={onClose} className="btn-ghost text-sm">{t("cancel")}</button>
          <button
            onClick={() => create.mutate()}
            disabled={!habitationId || !safeSiteId || !population || create.isPending}
            className="btn-primary text-sm"
          >
            {create.isPending ? t("Creating...") : t("Create Relocation Plan")}
          </button>
        </div>
      </div>
    </div>
  );
}
