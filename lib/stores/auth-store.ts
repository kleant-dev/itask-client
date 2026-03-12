// lib/stores/auth-store.ts
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

export interface User {
  id: string;
  email: string;
  name: string;
}

interface AuthState {
  accessToken: string | null;
  refreshToken: string | null;
  user: User | null;
  _hasHydrated: boolean;

  setAuth: (accessToken: string, refreshToken: string, user?: User) => void;
  setUser: (user: User) => void;
  logout: () => void;
  isAuthenticated: () => boolean;
  setHasHydrated: (state: boolean) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      accessToken: null,
      refreshToken: null,
      user: null,
      _hasHydrated: false,

      setAuth: (accessToken, refreshToken, user) =>
        set({
          accessToken,
          refreshToken,
          ...(user && { user }),
        }),

      setUser: (user) => set({ user }),

      logout: () => set({ accessToken: null, refreshToken: null, user: null }),

      isAuthenticated: () => !!get().accessToken,

      setHasHydrated: (state) => set({ _hasHydrated: state }),
    }),
    {
      name: "auth-storage",
      storage: createJSONStorage(() => localStorage),
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    },
  ),
);
