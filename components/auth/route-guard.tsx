// components/route-guard.tsx
"use client";

import { useAuthStore } from "@/lib/stores/auth-store";

export function RouteGuard({ children }: { children: React.ReactNode }) {
  const hasHydrated = useAuthStore((s) => s._hasHydrated);

  // Still needed: prevents flash of stale Zustand state
  // while localStorage rehydrates on the client.
  // Middleware already handled the redirect — this is just
  // a loading gate, not a security boundary.
  if (!hasHydrated) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  return <>{children}</>;
}
