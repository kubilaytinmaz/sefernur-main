import { create } from "zustand";

interface UIState {
  theme: "light" | "dark";
  isSidebarOpen: boolean;
  isLoading: boolean;
  toggleTheme: () => void;
  toggleSidebar: () => void;
  setLoading: (loading: boolean) => void;
}

export const useUIStore = create<UIState>((set) => ({
  theme: "light",
  isSidebarOpen: false,
  isLoading: false,
  toggleTheme: () =>
    set((state) => ({
      theme: state.theme === "light" ? "dark" : "light",
    })),
  toggleSidebar: () =>
    set((state) => ({
      isSidebarOpen: !state.isSidebarOpen,
    })),
  setLoading: (loading) => set({ isLoading: loading }),
}));
