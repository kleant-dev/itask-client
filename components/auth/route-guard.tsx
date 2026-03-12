// components/auth/route-guard.tsx
"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/lib/stores/auth-store";

interface RouteGuardProps {
  children: React.ReactNode;
  type: "auth" | "guest"; // 'auth' = protected, 'guest' = public only
}

export function RouteGuard({ children, type }: RouteGuardProps) {
  const router = useRouter();
  const hasHydrated = useAuthStore((state) => state._hasHydrated);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated());

  useEffect(() => {
    // Only redirect after hydration is complete
    if (!hasHydrated) return;

    if (type === "auth" && !isAuthenticated) {
      router.push("/login");
    }

    if (type === "guest" && isAuthenticated) {
      router.push("/home");
    }
  }, [type, hasHydrated, isAuthenticated, router]);

  // Wait for hydration to complete
  if (!hasHydrated) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  // Show loading while redirecting
  const shouldRedirect =
    (type === "auth" && !isAuthenticated) ||
    (type === "guest" && isAuthenticated);

  if (shouldRedirect) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  return <>{children}</>;
}
