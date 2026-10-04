import { create } from "zustand";
import type { UserProfile, NdmaRole, OfficialTier, AuthProvider } from "../types";
import { getCurrentUser } from "../api/auth";

interface AuthState {
  token: string | null;
  accessToken: string | null;
  refreshToken: string | null;
  username: string | null;
  user: UserProfile | null;
  isLoadingUser: boolean;
  clearanceRole: NdmaRole;
  officialTier: OfficialTier;
  authProvider: AuthProvider;
  is2FaVerified: boolean;
  is2FAVerified: boolean;
  isAuthenticated: boolean;
  setClearanceRole: (role: NdmaRole) => void;
  setOfficialTier: (tier: OfficialTier) => void;
  setAuthProvider: (provider: AuthProvider) => void;
  set2FaVerified: (verified: boolean) => void;
  login: (
    access: string,
    refresh: string,
    username: string,
    clearanceRole?: NdmaRole,
    tier?: OfficialTier,
    authProvider?: AuthProvider
  ) => Promise<void>;
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
    localStorage.removeItem("official_tier");
    localStorage.removeItem("auth_provider");
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
  officialTier:
    (typeof window !== "undefined" && (localStorage.getItem("official_tier") as OfficialTier)) ||
    "FIELD_RESPONDER",
  authProvider:
    (typeof window !== "undefined" && (localStorage.getItem("auth_provider") as AuthProvider)) ||
    "GOVNET",
  is2FaVerified: false,
  is2FAVerified: false,
  isAuthenticated: false,

  setClearanceRole: (role: NdmaRole) => {
    localStorage.setItem("clearance_role", role);
    set({ clearanceRole: role });
  },

  setOfficialTier: (tier: OfficialTier) => {
    localStorage.setItem("official_tier", tier);
    set({ officialTier: tier });
  },

  setAuthProvider: (provider: AuthProvider) => {
    localStorage.setItem("auth_provider", provider);
    set({ authProvider: provider });
  },

  set2FaVerified: (verified: boolean) => {
    localStorage.setItem("2fa_verified", verified ? "true" : "false");
    set({ is2FaVerified: verified, is2FAVerified: verified });
  },

  login: async (
    access: string,
    refresh: string,
    username: string,
    clearanceRole?: NdmaRole,
    tier?: OfficialTier,
    authProvider?: AuthProvider
  ) => {
    localStorage.setItem("access_token", access);
    localStorage.setItem("refresh_token", refresh);
    localStorage.setItem("username", username);

    const u = username.toLowerCase();
    const assignedRole: NdmaRole =
      clearanceRole ||
      (u.includes("superadmin")
        ? "DISTRICT_MAGISTRATE"
        : u.includes("sdrf")
        ? "SDRF_COMMANDER"
        : u.includes("official")
        ? "DEOC_OPERATOR"
        : "PUBLIC_CITIZEN");

    const assignedTier: OfficialTier =
      tier ||
      (u.includes("ndma")
        ? "NATIONAL_NDMA"
        : u.includes("official")
        ? "STATE_SDMA"
        : u.includes("superadmin")
        ? "DISTRICT_DEOC"
        : u.includes("sdrf")
        ? "FIELD_RESPONDER"
        : assignedRole === "DISTRICT_MAGISTRATE"
        ? "DISTRICT_DEOC"
        : assignedRole === "SDRF_COMMANDER"
        ? "FIELD_RESPONDER"
        : "STATE_SDMA");

    const assignedProvider: AuthProvider =
      authProvider ||
      (assignedTier === "NATIONAL_NDMA" || assignedTier === "STATE_SDMA" || u.includes("ndma") || u.includes("official")
        ? "PARICHAY"
        : "GOVNET");

    localStorage.setItem("clearance_role", assignedRole);
    localStorage.setItem("official_tier", assignedTier);
    localStorage.setItem("auth_provider", assignedProvider);
    localStorage.setItem("2fa_verified", "true");

    set({
      token: access,
      accessToken: access,
      refreshToken: refresh,
      username,
      clearanceRole: assignedRole,
      officialTier: assignedTier,
      authProvider: assignedProvider,
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
      const updates: Partial<AuthState> = { user: profile, isLoadingUser: false };
      if (profile.tier) {
        updates.officialTier = profile.tier;
        localStorage.setItem("official_tier", profile.tier);
      }
      if (profile.auth_provider) {
        updates.authProvider = profile.auth_provider;
        localStorage.setItem("auth_provider", profile.auth_provider);
      }
      set(updates);
    } catch {
      set({ isLoadingUser: false });
    }
  },

  logout: () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    localStorage.removeItem("username");
    localStorage.removeItem("clearance_role");
    localStorage.removeItem("official_tier");
    localStorage.removeItem("auth_provider");
    localStorage.removeItem("2fa_verified");
    set({
      token: null,
      accessToken: null,
      refreshToken: null,
      username: null,
      user: null,
      clearanceRole: "PUBLIC_CITIZEN",
      officialTier: "FIELD_RESPONDER",
      authProvider: "GOVNET",
      is2FaVerified: false,
      is2FAVerified: false,
      isAuthenticated: false,
    });
  },
}));