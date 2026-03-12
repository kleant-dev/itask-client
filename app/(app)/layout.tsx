// app/(app)/layout.tsx
import { RouteGuard } from "@/components/auth/route-guard";
import { AppSidebar } from "@/components/layout/app-sidebar";
import { AppHeader } from "@/components/layout/app-header";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <RouteGuard type="auth">
      {/* Background color: #F7F9FB from Figma */}
      <div className="flex h-screen bg-[#F7F9FB]">
        {/* Sidebar: 260px width */}
        <AppSidebar />

        {/* Main content area with 12px spacing */}
        <div className="flex flex-1 flex-col gap-3 p-3">
          {/* Header: 56px height, white bg */}
          <AppHeader />

          {/* Content: white bg, rounded corners */}
          <main className="flex-1 overflow-y-auto rounded-lg bg-white p-6">
            {children}
          </main>
        </div>
      </div>
    </RouteGuard>
  );
}
