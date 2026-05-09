// lib/hooks/use-workspaces.ts
//
// Architectural change (Task 1 — Workspace Persistence):
//
// BEFORE: The `useEffect` that auto-selects the first workspace would fire on
// every render where `currentWorkspaceId` was null — including the brief window
// between the initial SSR render and the moment Zustand re-hydrates from
// localStorage. This caused a race: the persisted workspace ID was briefly
// overwritten by `workspaces[0]` before the stored value was loaded, which
// then triggered unnecessary re-fetches and visible UI flicker.
//
// AFTER: We gate the auto-selection behind `_hasHydrated`. The effect is a
// no-op until Zustand signals that localStorage has been parsed. Once
// `_hasHydrated` is true, `currentWorkspaceId` is guaranteed to reflect the
// last persisted value, so we only fall back to `workspaces[0]` when the user
// genuinely has no saved preference (first-time login or cleared storage).

import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { workspacesApi } from "@/lib/api/workspaces";
import type { WorkspaceModel } from "@/types/models";
import type { PagedResponse } from "@/types/api";
import { useUiStore } from "@/lib/stores/ui-store";

export function useWorkspaces() {
  const currentWorkspaceId = useUiStore((s) => s.currentWorkspaceId);
  const setCurrentWorkspaceId = useUiStore((s) => s.setCurrentWorkspaceId);
  const hasHydrated = useUiStore((s) => s._hasHydrated);

  const query = useQuery<PagedResponse<WorkspaceModel>>({
    queryKey: ["workspaces"],
    queryFn: () =>
      workspacesApi.getMyWorkspaces({
        pageNumber: 1,
        pageSize: 20,
        sort: "createdAtUtc:desc",
      }),
  });

  const workspaces = query.data?.items ?? [];

  // The "active" workspace is whichever workspace was last selected (persisted
  // in localStorage via ui-store). If none is persisted, default to the first
  // workspace returned by the API.
  const activeWorkspace =
    workspaces.find((w) => w.id === currentWorkspaceId) ?? workspaces[0];

  useEffect(() => {
    // ⚠️ Guard: do not auto-select until the store has been re-hydrated.
    // Without this, we'd overwrite a valid persisted workspace ID with
    // `workspaces[0]` during the brief render before localStorage is read.
    if (!hasHydrated) return;

    if (!currentWorkspaceId && activeWorkspace) {
      setCurrentWorkspaceId(activeWorkspace.id);
    }
  }, [hasHydrated, currentWorkspaceId, activeWorkspace, setCurrentWorkspaceId]);

  return {
    ...query,
    workspaces,
    activeWorkspace,
    currentWorkspaceId,
    setCurrentWorkspaceId,
  };
}
