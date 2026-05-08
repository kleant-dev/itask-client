// components/layout/app-header.tsx
"use client";

import { useState, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import {
  Bell,
  Settings,
  ChevronDown,
  Search,
  Folder,
  PanelLeftClose,
  PanelLeftOpen,
} from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/lib/stores/auth-store";
import { NotificationPopup } from "@/components/notifications/notification-popup";
import { ProfileDropdown } from "@/components/layout/profile-dropdown";
import { SearchModal } from "@/components/search/search-modal";
import { useUiStore } from "@/lib/stores/ui-store";

// Unread count — in a real app this would come from an API/store
const UNREAD_COUNT = 3;

export function AppHeader() {
  const pathname = usePathname();
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const sidebarOpen = useUiStore((s) => s.sidebarOpen);
  const toggleSidebar = useUiStore((s) => s.toggleSidebar);

  const headerLabel =
    pathname === "/projects" || pathname?.startsWith("/projects/")
      ? "Projects"
      : pathname === "/messages"
        ? "Messages"
        : pathname === "/notifications"
          ? "Notifications"
          : "Home";

  const isProjects = headerLabel === "Projects";

  const [searchOpen, setSearchOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  // ⌘K / Ctrl+K to open search
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setSearchOpen(true);
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  function openNotifications() {
    setProfileOpen(false);
    // On small screens / preference: navigate to the full page
    // Toggle popup on desktop
    setNotificationsOpen((v) => !v);
  }

  function openProfile() {
    setNotificationsOpen(false);
    setProfileOpen((v) => !v);
  }

  const PageIcon = isProjects ? Folder : null;

  return (
    <>
      <header className="flex h-14 shrink-0 items-center justify-between rounded-lg bg-white px-4">
        {/* Left — sidebar toggle + page label */}
        <div className="flex items-center gap-2">
          {/* Sidebar toggle button */}
          <button
            onClick={toggleSidebar}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-neutral-400 hover:bg-neutral-100 hover:text-neutral-700 transition-colors"
            aria-label={sidebarOpen ? "Close sidebar" : "Open sidebar"}
          >
            {sidebarOpen ? (
              <PanelLeftClose className="h-4 w-4" strokeWidth={1.5} />
            ) : (
              <PanelLeftOpen className="h-4 w-4" strokeWidth={1.5} />
            )}
          </button>

          <div className="flex items-center gap-2">
            {isProjects ? (
              <Folder className="h-4 w-4 text-neutral-400" strokeWidth={1.5} />
            ) : (
              <svg
                className="h-4 w-4 text-neutral-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                />
              </svg>
            )}
            <span className="text-[14px] font-medium text-[#111625]">
              {headerLabel}
            </span>
          </div>
        </div>

        {/* Right */}
        <div className="flex items-center gap-2">
          {/* Search trigger */}
          <button
            onClick={() => setSearchOpen(true)}
            className="flex h-8 w-64 items-center gap-2 rounded-[10px] border border-neutral-200 bg-white px-3 text-left hover:border-neutral-300 transition-colors"
          >
            <Search
              className="h-3.5 w-3.5 shrink-0 text-[#8796af]"
              strokeWidth={1.5}
            />
            <span className="flex-1 text-[13px] text-[#8796af]">Search</span>
            <kbd className="inline-flex h-5 select-none items-center rounded border border-neutral-200 bg-[#f7f9fb] px-1.5 font-mono text-[10px] text-[#596881] pointer-events-none">
              ⌘K
            </kbd>
          </button>

          {/* Bell — popup + full-page link */}
          <div className="relative">
            <button
              onClick={openNotifications}
              className={cn(
                "relative flex h-8 w-8 items-center justify-center rounded-lg transition-colors",
                notificationsOpen
                  ? "bg-[#ebefff] text-[#375dfb]"
                  : "text-[#596881] hover:bg-neutral-100",
              )}
              aria-label="Notifications"
            >
              <Bell className="h-4 w-4" strokeWidth={1.5} />
              {UNREAD_COUNT > 0 && (
                <span className="absolute right-1.5 top-1.5 flex h-[7px] w-[7px] items-center justify-center rounded-full bg-[#df1c41]" />
              )}
            </button>

            {notificationsOpen && (
              <NotificationPopup
                onClose={() => setNotificationsOpen(false)}
                onViewAll={() => {
                  setNotificationsOpen(false);
                  router.push("/notifications");
                }}
              />
            )}
          </div>

          {/* Settings */}
          <button className="flex h-8 w-8 items-center justify-center rounded-lg text-[#596881] hover:bg-neutral-100 transition-colors">
            <Settings className="h-4 w-4" strokeWidth={1.5} />
          </button>

          {/* Divider */}
          <div className="h-5 w-px bg-neutral-200" />

          {/* Profile */}
          <div className="relative">
            <button
              onClick={openProfile}
              className="flex items-center gap-1.5 rounded-lg p-1 hover:bg-neutral-50 transition-colors"
            >
              <Avatar className="h-8 w-8">
                <AvatarFallback className="bg-[#375dfb] text-xs font-semibold text-white">
                  {user?.name?.charAt(0).toUpperCase() ?? "U"}
                </AvatarFallback>
              </Avatar>
              <ChevronDown
                className={cn(
                  "h-3.5 w-3.5 text-[#596881] transition-transform duration-150",
                  profileOpen && "rotate-180",
                )}
              />
            </button>

            {profileOpen && (
              <ProfileDropdown onClose={() => setProfileOpen(false)} />
            )}
          </div>
        </div>
      </header>

      {/* Search modal */}
      <SearchModal open={searchOpen} onOpenChange={setSearchOpen} />
    </>
  );
}
