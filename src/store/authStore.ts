import { create } from "zustand";
import type { UserProfile, NdmaRole } from "../types";
import { getCurrentUser } from "../api/auth";

interface AuthState {
  token: string | null;
  accessToken: string | null;
  refreshToken: string | null;
  username: string | null;
  user: UserProfile | null;
  isLoadingUser: boolean;
  clearanceRole: NdmaRole;
  is2FaVerified: boolean;
  is2FAVerified: boolean;
  isAuthenticated: boolean;
  setClearanceRole: (role: NdmaRole) => void;
  set2FaVerified: (verified: boolean) => void;
  login: (access: string, refresh: string, username: string, clearanceRole?: NdmaRole) => Promise<void>;
  setUser: (user: UserProfile | null) => void;
  fetchProfile: () => Promise<void>;
  logout: () => void;
}

// Purge any residual mock tokens or partial unverified sessions
if (typeof window !== "undefined") {
  const stored = localStorage.getItem("access_token");
  if (!stored || stored.includes("mock") || localStorage.getItem("2fa_verified") !== "true") {
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    localStorage.removeItem("username");
    localStorage.removeItem("clearance_role");
    localStorage.removeItem("2fa_verified");
  }
}

export const useAuthStore = create<AuthState>((set, get) => ({
  token: null,
  accessToken: null,
  refreshToken: null,
  username: null,
  user: null,
  isLoadingUser: false,
  clearanceRole: "PUBLIC_CITIZEN",
  is2FaVerified: false,
  is2FAVerified: false,
  isAuthenticated: false,

  setClearanceRole: (role: NdmaRole) => {
    localStorage.setItem("clearance_role", role);
    set({ clearanceRole: role });
  },

  set2FaVerified: (verified: boolean) => {
    localStorage.setItem("2fa_verified", verified ? "true" : "false");
    set({ is2FaVerified: verified, is2FAVerified: verified });
  },

  login: async (access: string, refresh: string, username: string, clearanceRole?: NdmaRole) => {
    localStorage.setItem("access_token", access);
    localStorage.setItem("refresh_token", refresh);
    localStorage.setItem("username", username);
    const assignedRole: NdmaRole = clearanceRole || (username.toLowerCase().includes("superadmin") ? "DISTRICT_MAGISTRATE" : username.toLowerCase().includes("official") ? "DEOC_OPERATOR" : "PUBLIC_CITIZEN");
    localStorage.setItem("clearance_role", assignedRole);
    localStorage.setItem("2fa_verified", "true");
    set({
      token: access,
      accessToken: access,
      refreshToken: refresh,
      username,
      clearanceRole: assignedRole,
      is2FaVerified: true,
      is2FAVerified: true,
      isAuthenticated: true,
    });
    await get().fetchProfile();
  },

  setUser: (user) => set({ user }),

  fetchProfile: async () => {
    const token = get().accessToken;
    if (!token) return;
    set({ isLoadingUser: true });
    try {
      const profile = await getCurrentUser();
      set({ user: profile, isLoadingUser: false });
    } catch {
      set({ isLoadingUser: false });
    }
  },

  logout: () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    localStorage.removeItem("username");
    localStorage.removeItem("clearance_role");
    localStorage.removeItem("2fa_verified");
    set({
      token: null,
      accessToken: null,
      refreshToken: null,
      username: null,
      user: null,
      clearanceRole: "PUBLIC_CITIZEN",
      is2FaVerified: false,
      is2FAVerified: false,
      isAuthenticated: false,
    });
  },
}));