import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Users,
  ShieldAlert,
  Clock,
  CheckCircle2,
  MapPin,
  Search,
  Filter
} from "lucide-react";
import { getUsersList, updateUserApproval } from "../api/auth";
import { useAuthStore } from "../store/authStore";
import { useTranslation } from "../i18n/translations";

export default function UserManagementView() {
  const queryClient = useQueryClient();
  const { user: currentUser } = useAuthStore();
  const { lang } = useTranslation();
  const isHi = lang === "hi";

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [actionFeedback, setActionFeedback] = useState<string | null>(null);

  const { data: users = [], isLoading } = useQuery({
    queryKey: ["users-list"],
    queryFn: getUsersList,
  });

  const approvalMutation = useMutation({
    mutationFn: ({ userId, action, role }: { userId: number; action: "APPROVE" | "REJECT" | "UPDATE_ROLE"; role?: string }) =>
      updateUserApproval(userId, action, role),
    onSuccess: (res) => {
      setActionFeedback(res.message);
      queryClient.invalidateQueries({ queryKey: ["users-list"] });
      setTimeout(() => setActionFeedback(null), 4000);
    },
    onError: () => {
      setActionFeedback(isHi ? "कार्रवाई विफल रही।" : "Action execution failed.");
      setTimeout(() => setActionFeedback(null), 4000);
    },
  });

  const pendingCount = users.filter((u) => u.approval_status === "PENDING").length;
  const approvedCount = users.filter((u) => u.approval_status === "APPROVED" || !u.approval_status).length;

  const filteredUsers = users.filter((u) => {
    const q = searchTerm.toLowerCase().trim();
    const matchesSearch =
      !q ||
      u.username.toLowerCase().includes(q) ||
      (u.first_name || "").toLowerCase().includes(q) ||
      (u.last_name || "").toLowerCase().includes(q) ||
      (u.email || "").toLowerCase().includes(q) ||
      (u.department || "").toLowerCase().includes(q) ||
      (u.district || "").toLowerCase().includes(q);

    const matchesStatus =
      statusFilter === "ALL" ||
      (statusFilter === "PENDING" && u.approval_status === "PENDING") ||
      (statusFilter === "APPROVED" && (u.approval_status === "APPROVED" || !u.approval_status)) ||
      (statusFilter === "REJECTED" && u.approval_status === "REJECTED");

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 bg-slate-50 dark:bg-[#070D18]">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header Ribbon */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-400">
                <Users className="w-5 h-5" />
              </span>
              <h1 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white">
                {isHi ? "विभागीय कार्मिक एवं आरबीएसी प्रबंधन" : "Personnel Directory & Multi-Tier RBAC Management"}
              </h1>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              {isHi
                ? "राज्य नोडल प्रमुख / डिजास्टर मैनेजर पोर्टल - नए कार्मिक आवेदनों का सत्यापन एवं अनुमति प्रबंधन"
                : "Disaster Manager Governance — Credential approval gating, role reassignment & security auditing."}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-950 text-[#0B2545] dark:text-blue-300 text-xs font-bold border border-blue-200 dark:border-blue-800">
              Tier 1 Authority: {currentUser?.username || "Disaster Manager"}
            </span>
          </div>
        </div>

        {/* Live Metrics Row */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-4 rounded-xl bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-slate-800 shadow-xs">
            <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
              {isHi ? "कुल पंजीकृत कार्मिक" : "Total Registered Personnel"}
            </div>
            <div className="text-2xl font-black font-mono text-slate-900 dark:text-white">
              {users.length}
            </div>
            <div className="text-[11px] text-slate-400 mt-1">
              {isHi ? "13 जनपदों एवं राज्य मुख्यालय में" : "Across 13 districts & State HQ"}
            </div>
          </div>

          <div className="p-4 rounded-xl bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-slate-800 shadow-xs">
            <div className="text-xs font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider mb-1 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5" />
              <span>{isHi ? "सत्यापन लंबित आवेदन" : "Pending Verification"}</span>
            </div>
            <div className="text-2xl font-black font-mono text-amber-600 dark:text-amber-400">
              {pendingCount}
            </div>
            <div className="text-[11px] text-slate-400 mt-1">
              {isHi ? "अनुमोदन हेतु प्रतीक्षारत" : "Awaiting Disaster Manager sign-off"}
            </div>
          </div>

          <div className="p-4 rounded-xl bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-slate-800 shadow-xs">
            <div className="text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider mb-1 flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>{isHi ? "सत्यापित सक्रिय अधिकारी" : "Active Verified Officers"}</span>
            </div>
            <div className="text-2xl font-black font-mono text-emerald-600 dark:text-emerald-400">
              {approvedCount}
            </div>
            <div className="text-[11px] text-slate-400 mt-1">
              {isHi ? "पूर्ण कमांड एक्सेस अधिकृत" : "Cleared for incident command execution"}
            </div>
          </div>
        </div>

        {/* Feedback Alert */}
        {actionFeedback && (
          <div className="p-3.5 rounded-xl bg-blue-50 dark:bg-blue-950/80 border border-blue-300 dark:border-blue-800 text-blue-900 dark:text-blue-200 text-xs font-semibold flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
            <span>{actionFeedback}</span>
          </div>
        )}

        {/* Search & Filter Bar */}
        <div className="p-3.5 rounded-xl bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-xs">
          <div className="relative w-full sm:w-80">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3 pointer-events-none" />
            <input
              type="text"
              placeholder={isHi ? "नाम, ईमेल, विभाग या ज़िला खोजें..." : "Search name, username, department, district..."}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 focus:outline-none focus:ring-1 focus:ring-blue-500 text-slate-900 dark:text-white"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1">
              <Filter className="w-3.5 h-3.5" />
              <span>Status:</span>
            </span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="text-xs py-1.5 px-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 focus:outline-none"
            >
              <option value="ALL">{isHi ? "सभी कार्मिक" : "All Personnel"}</option>
              <option value="PENDING">{isHi ? "केवल लंबित (Pending)" : "Pending Approval Only"}</option>
              <option value="APPROVED">{isHi ? "केवल स्वीकृत (Approved)" : "Approved Only"}</option>
              <option value="REJECTED">{isHi ? "केवल अस्वीकृत (Rejected)" : "Rejected Only"}</option>
            </select>
          </div>
        </div>

        {/* Directory Table */}
        <div className="rounded-xl bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-slate-800 overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse min-w-[700px]">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 text-[11px] font-bold text-slate-500 uppercase tracking-wider bg-slate-50/70 dark:bg-slate-900/40">
                  <th className="px-4 py-3">{isHi ? "कार्मिक विवरण" : "Officer / Principal"}</th>
                  <th className="px-4 py-3">{isHi ? "विभाग एवं पद" : "Department & Designation"}</th>
                  <th className="px-4 py-3">{isHi ? "ज़िला / अधिकार क्षेत्र" : "Jurisdiction"}</th>
                  <th className="px-4 py-3">{isHi ? "आरबीएसी स्तर" : "Clearance Tier"}</th>
                  <th className="px-4 py-3">{isHi ? "स्थिति" : "Status"}</th>
                  <th className="px-4 py-3 text-right">{isHi ? "नोडल कार्रवाई" : "Manager Action"}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {isLoading ? (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-slate-400">
                      <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                      <span>{isHi ? "कार्मिक निर्देशिका लोड हो रही है..." : "Loading personnel directory..."}</span>
                    </td>
                  </tr>
                ) : filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-slate-400">
                      {isHi ? "कोई कार्मिक रिकॉर्ड नहीं मिला।" : "No personnel records matching criteria."}
                    </td>
                  </tr>
                ) : (
                  filteredUsers.map((u) => {
                    const isPending = u.approval_status === "PENDING";
                    const isApproved = u.approval_status === "APPROVED" || !u.approval_status;
                    const isRejected = u.approval_status === "REJECTED";

                    return (
                      <tr key={u.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition">
                        <td className="px-4 py-3">
                          <div className="font-bold text-slate-900 dark:text-slate-100">
                            {u.first_name || u.last_name
                              ? `${u.first_name || ""} ${u.last_name || ""}`.trim()
                              : u.username}
                          </div>
                          <div className="text-[11px] font-mono text-slate-500">{u.username} • {u.email}</div>
                          {u.employee_id && (
                            <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                              ID: {u.employee_id}
                            </div>
                          )}
                        </td>

                        <td className="px-4 py-3">
                          <div className="text-slate-800 dark:text-slate-200 font-medium">
                            {u.department || "USDMA Field Operations"}
                          </div>
                          <div className="text-[11px] text-slate-500">
                            {u.designation || "State Officer"}
                          </div>
                        </td>

                        <td className="px-4 py-3 text-slate-600 dark:text-slate-400">
                          <div className="flex items-center gap-1">
                            <MapPin className="w-3 h-3 text-slate-400" />
                            <span>{u.district || "State Wide"}</span>
                          </div>
                        </td>

                        <td className="px-4 py-3">
                          <select
                            value={u.role}
                            onChange={(e) =>
                              approvalMutation.mutate({
                                userId: u.id,
                                action: "UPDATE_ROLE",
                                role: e.target.value,
                              })
                            }
                            className="text-[11px] font-semibold py-1 px-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200"
                          >
                            <option value="SUPERADMIN">Tier 1: Disaster Manager</option>
                            <option value="OFFICIAL">Tier 2: Field Officer</option>
                            <option value="PUBLIC">Tier 3: Public Citizen</option>
                          </select>
                        </td>

                        <td className="px-4 py-3">
                          {isPending && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300 font-bold text-[10px] border border-amber-300 dark:border-amber-700">
                              <Clock className="w-3 h-3" />
                              <span>PENDING</span>
                            </span>
                          )}
                          {isApproved && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-400 font-bold text-[10px] border border-emerald-300 dark:border-emerald-700">
                              <CheckCircle2 className="w-3 h-3" />
                              <span>APPROVED</span>
                            </span>
                          )}
                          {isRejected && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-red-100 dark:bg-red-950/80 text-red-700 dark:text-red-400 font-bold text-[10px] border border-red-300 dark:border-red-700">
                              <ShieldAlert className="w-3 h-3" />
                              <span>REJECTED</span>
                            </span>
                          )}
                        </td>

                        <td className="px-4 py-3 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            {isPending && (
                              <>
                                <button
                                  onClick={() =>
                                    approvalMutation.mutate({
                                      userId: u.id,
                                      action: "APPROVE",
                                    })
                                  }
                                  className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded font-bold text-[11px] shadow transition"
                                  title="Approve Officer Clearance"
                                >
                                  {isHi ? "स्वीकृत करें" : "Approve"}
                                </button>
                                <button
                                  onClick={() =>
                                    approvalMutation.mutate({
                                      userId: u.id,
                                      action: "REJECT",
                                    })
                                  }
                                  className="px-2.5 py-1 bg-red-600 hover:bg-red-700 text-white rounded font-bold text-[11px] shadow transition"
                                  title="Reject Application"
                                >
                                  {isHi ? "अस्वीकृत" : "Reject"}
                                </button>
                              </>
                            )}
                            {!isPending && (
                              <button
                                onClick={() =>
                                  approvalMutation.mutate({
                                    userId: u.id,
                                    action: isApproved ? "REJECT" : "APPROVE",
                                  })
                                }
                                className="px-2 py-1 text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 text-[10px] font-semibold underline"
                              >
                                {isApproved ? (isHi ? "निलंबित करें" : "Revoke") : (isHi ? "पुनर्स्थापित" : "Re-Approve")}
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
