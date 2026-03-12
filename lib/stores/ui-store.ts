import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

interface UiState {
  sidebarOpen: boolean;
  currentWorkspaceId: string | null;

  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;
  setCurrentWorkspaceId: (id: string | null) => void;
}

export const useUiStore = create<UiState>()(
  persist(
    (set) => ({
      sidebarOpen: true,
      currentWorkspaceId: null,

      toggleSidebar: () =>
        set((state) => ({ sidebarOpen: !state.sidebarOpen })),

      setSidebarOpen: (open) => set({ sidebarOpen: open }),

      setCurrentWorkspaceId: (id) => set({ currentWorkspaceId: id }),
    }),
    {
      name: "ui-storage",
      storage: createJSONStorage(() => localStorage),
    },
  ),
);

