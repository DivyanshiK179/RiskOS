import { create } from "zustand";
import { persist } from "zustand/middleware";

interface UIState {
  theme: "dark" | "light";
  lang: "en" | "hi";
  fontSizeLevel: number; // -1 for A-, 0 for A, 1 for A+
  sidebarCollapsed: boolean;
  inspectorCollapsed: boolean;
  layersCollapsed: boolean;
  zenMode: boolean;
  resizeTrigger: number;
  setTheme: (theme: "dark" | "light") => void;
  toggleTheme: () => void;
  setLang: (lang: "en" | "hi") => void;
  setFontSizeLevel: (level: number) => void;
  setSidebarCollapsed: (collapsed: boolean) => void;
  toggleSidebar: () => void;
  setInspectorCollapsed: (collapsed: boolean) => void;
  toggleInspector: () => void;
  setLayersCollapsed: (collapsed: boolean) => void;
  toggleLayers: () => void;
  setZenMode: (zen: boolean) => void;
  toggleZenMode: () => void;
  triggerMapResize: () => void;
}

export const useUIStore = create<UIState>()(
  persist(
    (set, get) => ({
      theme: "light",
      lang: "en",
      fontSizeLevel: 0,
      sidebarCollapsed: false,
      inspectorCollapsed: false,
      layersCollapsed: false,
      zenMode: false,
      resizeTrigger: 0,
      setTheme: (theme) => set({ theme }),
      toggleTheme: () => set({ theme: get().theme === "dark" ? "light" : "dark" }),
      setLang: (lang) => set({ lang }),
      setFontSizeLevel: (level) => set({ fontSizeLevel: Math.max(-1, Math.min(1, level)) }),
      setSidebarCollapsed: (collapsed) =>
        set({ sidebarCollapsed: collapsed, resizeTrigger: get().resizeTrigger + 1 }),
      toggleSidebar: () =>
        set({ sidebarCollapsed: !get().sidebarCollapsed, resizeTrigger: get().resizeTrigger + 1 }),
      setInspectorCollapsed: (collapsed) =>
        set({ inspectorCollapsed: collapsed, resizeTrigger: get().resizeTrigger + 1 }),
      toggleInspector: () =>
        set({ inspectorCollapsed: !get().inspectorCollapsed, resizeTrigger: get().resizeTrigger + 1 }),
      setLayersCollapsed: (collapsed) =>
        set({ layersCollapsed: collapsed, resizeTrigger: get().resizeTrigger + 1 }),
      toggleLayers: () =>
        set({ layersCollapsed: !get().layersCollapsed, resizeTrigger: get().resizeTrigger + 1 }),
      setZenMode: (zen) =>
        set({
          zenMode: zen,
          sidebarCollapsed: zen,
          inspectorCollapsed: zen,
          layersCollapsed: zen,
          resizeTrigger: get().resizeTrigger + 1,
        }),
      toggleZenMode: () => {
        const next = !get().zenMode;
        set({
          zenMode: next,
          sidebarCollapsed: next,
          inspectorCollapsed: next,
          layersCollapsed: next,
          resizeTrigger: get().resizeTrigger + 1,
        });
      },
      triggerMapResize: () => set({ resizeTrigger: get().resizeTrigger + 1 }),
    }),
    {
      name: "riskos-ui-pref-v1",
    }
  )
);
