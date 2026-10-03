import { useState } from "react";
import {
  User,
  BadgeCheck,
  CheckCircle2,
  Smartphone,
  LogOut,
  Hash
} from "lucide-react";
import { useAuthStore } from "../store/authStore";
import { updateCurrentUser } from "../api/auth";
import { useTranslation } from "../i18n/translations";

export default function ProfileSecurityPanel() {
  const { user, username, clearanceRole, is2FaVerified, set2FaVerified, logout } = useAuthStore();
  const { lang } = useTranslation();
  const isHi = lang === "hi";

  const [phone, setPhone] = useState(user?.phone_number || "");
  const [designation, setDesignation] = useState(user?.designation || "");
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSaveSuccess(false);
    try {
      await updateCurrentUser({
        phone_number: phone,
        designation: designation,
      });
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch {
      alert("Failed to update profile details.");
    } finally {
      setSaving(false);
    }
  };

  const getTierLabel = () => {
    if (clearanceRole === "DISTRICT_MAGISTRATE" || user?.role === "SUPERADMIN") {
      return { tier: "Tier 1: Nodal Head / Disaster Manager", color: "bg-amber-100 text-amber-800 border-amber-300 dark:bg-amber-950 dark:text-amber-300 dark:border-amber-700" };
    }
    if (clearanceRole === "DEOC_OPERATOR" || clearanceRole === "SDRF_COMMANDER" || user?.role === "OFFICIAL") {
      return { tier: "Tier 2: Department Field Officer / Analyst", color: "bg-blue-100 text-blue-800 border-blue-300 dark:bg-blue-950 dark:text-blue-300 dark:border-blue-700" };
    }
    return { tier: "Tier 3: Public Citizen / Guest", color: "bg-slate-100 text-slate-800 border-slate-300 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700" };
  };

  const tierInfo = getTierLabel();

  return (
    <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 bg-slate-50 dark:bg-[#070D18]">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header Ribbon */}
        <div className="pb-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-400">
                <User className="w-5 h-5" />
              </span>
              <h1 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white">
                {isHi ? "अधिकारी प्रोफ़ाइल एवं सुरक्षा क्रेडेंशियल्स" : "Officer Profile & Security Clearances"}
              </h1>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              {isHi
                ? "राष्ट्रीय सूचना विज्ञान केंद्र (NIC) एवं राज्य आपदा प्रबंधन प्राधिकरण सुरक्षा मानक"
                : "National Informatics Centre (NIC) and USDMA Statutory Security Parameters"}
            </p>
          </div>

          <button
            onClick={logout}
            className="px-3.5 py-1.5 rounded-lg bg-red-50 hover:bg-red-100 dark:bg-red-950/60 dark:hover:bg-red-900/80 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-800 text-xs font-bold flex items-center gap-1.5 transition"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>{isHi ? "सत्र समाप्त करें" : "Sign Out"}</span>
          </button>
        </div>

        {/* Identity & RBAC Clearance Card */}
        <div className="p-6 rounded-2xl bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100 dark:divide-slate-800 dark:border-slate-800">
            <div className="flex items-center gap-3">
              <div className="w-14 h-14 rounded-full bg-[#0B2545] text-white flex items-center justify-center font-bold text-lg font-serif shadow">
                {(username || "O").slice(0, 2).toUpperCase()}
              </div>
              <div>
                <div className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <span>{user?.first_name || user?.last_name ? `${user?.first_name || ""} ${user?.last_name || ""}`.trim() : username}</span>
                  <BadgeCheck className="w-4 h-4 text-blue-500" />
                </div>
                <div className="text-xs text-slate-500 font-mono">
                  @{username} • {user?.email || "officer@usdma.gov.in"}
                </div>
              </div>
            </div>

            <span className={`px-3 py-1 rounded-full text-xs font-bold border ${tierInfo.color}`}>
              {tierInfo.tier}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs pt-1">
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
              <div className="text-slate-400 text-[10px] uppercase font-bold mb-0.5">Department</div>
              <div className="font-bold text-slate-800 dark:text-slate-200">{user?.department || "State Disaster Management (USDMA)"}</div>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
              <div className="text-slate-400 text-[10px] uppercase font-bold mb-0.5">Assigned District</div>
              <div className="font-bold text-slate-800 dark:text-slate-200">{user?.district || "Dehradun (Statewide)"}</div>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
              <div className="text-slate-400 text-[10px] uppercase font-bold mb-0.5">Service ID</div>
              <div className="font-bold font-mono text-slate-800 dark:text-slate-200">{user?.employee_id || "UK-DMA-2026-HQ"}</div>
            </div>
          </div>
        </div>

        {/* 2FA & Security Simulation Card */}
        <div className="p-6 rounded-2xl bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2">
              <Smartphone className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  {isHi ? "मेरी पहचान / जन परिचय 2FA प्रमाणीकरण" : "Jan Parichay National Single Sign-On (2FA)"}
                </h3>
                <p className="text-[11px] text-slate-500">
                  MeitY National e-Governance Division (NeGD) Two-Factor Verification
                </p>
              </div>
            </div>

            <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${
              is2FaVerified
                ? "bg-emerald-100 text-emerald-800 border-emerald-300 dark:bg-emerald-950 dark:text-emerald-300"
                : "bg-amber-100 text-amber-800 border-amber-300 dark:bg-amber-950 dark:text-amber-300"
            }`}>
              {is2FaVerified ? "2FA ACTIVE" : "2FA INACTIVE"}
            </span>
          </div>

          <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs">
            <div>
              <div className="font-bold text-slate-800 dark:text-slate-200">
                {isHi ? "हार्डवेयर / ओटीपी 2FA स्थिति टॉगल करें" : "Simulated 2FA Protection State"}
              </div>
              <div className="text-[11px] text-slate-500">
                Enforces time-based one-time password on critical IAP actions
              </div>
            </div>

            <button
              onClick={() => set2FaVerified(!is2FaVerified)}
              className={`px-3 py-1.5 rounded-lg font-bold text-xs shadow-xs transition ${
                is2FaVerified
                  ? "bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-300"
                  : "bg-emerald-600 text-white hover:bg-emerald-700"
              }`}
            >
              {is2FaVerified ? "Deactivate" : "Activate 2FA"}
            </button>
          </div>

          {/* Cryptographic Ledger Token */}
          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs space-y-1">
            <div className="flex items-center justify-between text-[11px] font-bold text-slate-500">
              <span className="flex items-center gap-1">
                <Hash className="w-3.5 h-3.5" />
                <span>CERT-In Immutable Session Ledger Token</span>
              </span>
              <span className="text-emerald-600 font-mono">CHAIN VALID</span>
            </div>
            <div className="font-mono text-[11px] text-blue-600 dark:text-blue-400 break-all select-all">
              0x8f9c1b72e450a893d624c90e18237e1b54a72d098e71cb4659f13d8091ab23
            </div>
          </div>
        </div>

        {/* Update Contact Details Form */}
        <div className="p-6 rounded-2xl bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white pb-2 border-b border-slate-100 dark:border-slate-800">
            {isHi ? "विभागीय संपर्क विवरण अद्यतन करें" : "Update Department Contact Details"}
          </h3>

          {saveSuccess && (
            <div className="p-3 rounded-lg bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4" />
              <span>{isHi ? "विवरण सफलतापूर्वक अद्यतन किए गए।" : "Details updated successfully."}</span>
            </div>
          )}

          <form onSubmit={handleSaveProfile} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  {isHi ? "पदनाम / उत्तरदायित्व" : "Designation"}
                </label>
                <input
                  type="text"
                  value={designation}
                  onChange={(e) => setDesignation(e.target.value)}
                  placeholder="e.g. Field GIS Analyst"
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  {isHi ? "आपातकालीन संपर्क मोबाइल" : "Emergency Contact Phone"}
                </label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="9876543210"
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-1 focus:ring-blue-500 font-mono"
                />
              </div>
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={saving}
                className="px-4 py-2 bg-[#0B2545] hover:bg-[#103058] text-white font-bold text-xs rounded-lg shadow transition disabled:opacity-50"
              >
                {saving ? "Saving..." : (isHi ? "परिवर्तन सहेजें" : "Save Changes")}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
