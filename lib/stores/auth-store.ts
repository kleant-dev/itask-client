// lib/stores/auth-store.ts
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import Cookies from "js-cookie";
import { stopConnection } from "../services/chat-hub";

export interface User {
  id: string;
  email: string;
  name: string;
}

interface AuthState {
  accessToken: string | null;
  refreshToken: string | null;
  user: User | null;
  isAuthenticated: boolean;
  _hasHydrated: boolean;

  setAuth: (accessToken: string, refreshToken: string, user?: User) => void;
  setUser: (user: User) => void;
  logout: () => void;
  setHasHydrated: (state: boolean) => void;
}

const COOKIE_OPTIONS: Cookies.CookieAttributes = {
  sameSite: "strict",
  secure: process.env.NODE_ENV === "production",
  expires: 7, // matches refresh token lifetime
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      accessToken: null,
      refreshToken: null,
      user: null,
      isAuthenticated: false,
      _hasHydrated: false,

      setAuth: (accessToken, refreshToken, user) => {
        Cookies.set("session", "1", COOKIE_OPTIONS);
        set({
          accessToken,
          refreshToken,
          isAuthenticated: true,
          ...(user && { user }),
        });
      },

      setUser: (user) => set({ user }),

      logout: () => {
        stopConnection().catch((err) =>
          console.error("[logout] SignalR stop failed:", err),
        );

        Cookies.remove("session");
        set({
          accessToken: null,
          refreshToken: null,
          user: null,
          isAuthenticated: false,
        });
      },

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
