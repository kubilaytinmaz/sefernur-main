import { UserModel } from "@/types/user";
import { create } from "zustand";
import { persist } from "zustand/middleware";

interface AuthState {
  user: UserModel | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  setUser: (user: UserModel | null) => void;
  setLoading: (loading: boolean) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isLoading: true,
      isAuthenticated: false,
      setUser: (user) =>
        set({
          user,
          isAuthenticated: !!user,
          isLoading: false,
        }),
      setLoading: (loading) => set({ isLoading: loading }),
      logout: () =>
        set({
          user: null,
          isAuthenticated: false,
          isLoading: false,
        }),
    }),
    {
      name: "auth-storage",
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    },
  ),
);
