// lib/stores/ui-store.ts
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

interface UiState {
  sidebarOpen: boolean;
  currentWorkspaceId: string | null;
  /**
   * True once Zustand has re-hydrated from localStorage.
   * Use this as a gate before trusting `currentWorkspaceId`.
   * NOT persisted — it's always false on first render and flips
   * to true as soon as the storage read completes.
   */
  _hasHydrated: boolean;

  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;
  setCurrentWorkspaceId: (id: string | null) => void;
  setHasHydrated: (value: boolean) => void;
}

export const useUiStore = create<UiState>()(
  persist(
    (set) => ({
      sidebarOpen: true,
      currentWorkspaceId: null,
      _hasHydrated: false,

      toggleSidebar: () =>
        set((state) => ({ sidebarOpen: !state.sidebarOpen })),

      setSidebarOpen: (open) => set({ sidebarOpen: open }),

      setCurrentWorkspaceId: (id) => set({ currentWorkspaceId: id }),

      setHasHydrated: (value) => set({ _hasHydrated: value }),
    }),
    {
      name: "ui-storage",
      storage: createJSONStorage(() => localStorage),
      /**
       * Only persist the fields that should survive page reloads.
       * `_hasHydrated` is intentionally excluded — it's always
       * initialised to false and set to true after storage is read.
       */
      partialize: (state) => ({
        sidebarOpen: state.sidebarOpen,
        currentWorkspaceId: state.currentWorkspaceId,
      }),
      onRehydrateStorage: () => (state) => {
        // Called synchronously after localStorage is parsed.
        // Setting this flag signals all subscribers that
        // `currentWorkspaceId` now reflects the persisted value.
        state?.setHasHydrated(true);
      },
    },
  ),
);
