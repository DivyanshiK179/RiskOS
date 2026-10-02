import { create } from "zustand";
import type { UserProfile } from "../types";
import { getCurrentUser } from "../api/auth";

interface AuthState {
  accessToken: string | null;
  refreshToken: string | null;
  username: string | null;
  user: UserProfile | null;
  isLoadingUser: boolean;
  login: (access: string, refresh: string, username: string) => Promise<void>;
  setUser: (user: UserProfile | null) => void;
  fetchProfile: () => Promise<void>;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  accessToken: localStorage.getItem("access_token"),
  refreshToken: localStorage.getItem("refresh_token"),
  username: localStorage.getItem("username"),
  user: null,
  isLoadingUser: false,

  login: async (access: string, refresh: string, username: string) => {
    localStorage.setItem("access_token", access);
    localStorage.setItem("refresh_token", refresh);
    localStorage.setItem("username", username);
    set({ accessToken: access, refreshToken: refresh, username });
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
    set({ accessToken: null, refreshToken: null, username: null, user: null });
  },
}));