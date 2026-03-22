"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { Bell, Settings, ChevronDown, Search, Folder } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/lib/stores/auth-store";
import { NotificationPopup } from "@/components/notifications/notification-popup";
import { ProfileDropdown } from "@/components/layout/profile-dropdown";
import { SearchModal } from "@/components/search/search-modal";

export function AppHeader() {
  const pathname = usePathname();
  const user = useAuthStore((s) => s.user);

  const headerLabel =
    pathname === "/projects" || pathname?.startsWith("/projects/")
      ? "Projects"
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

  // Close others when one opens
  function openNotifications() {
    setProfileOpen(false);
    setNotificationsOpen((v) => !v);
  }

  function openProfile() {
    setNotificationsOpen(false);
    setProfileOpen((v) => !v);
  }

  return (
    <>
      <header className="flex h-14 items-center justify-between rounded-lg bg-white px-6">
        {/* Left — page label */}
        <div className="flex items-center gap-2">
          {isProjects ? (
            <Folder className="h-5 w-5 text-[#596881]" strokeWidth={1.5} />
          ) : (
            <svg
              className="h-5 w-5 text-[#596881]"
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

        {/* Right */}
        <div className="flex items-center gap-2">
          {/* Search trigger */}
          <button
            onClick={() => setSearchOpen(true)}
            className="flex h-8 w-75 items-center gap-2 rounded-[10px] border border-neutral-200 bg-white px-3 text-left hover:border-neutral-300 transition-colors"
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

          {/* Bell */}
          <div className="relative">
            <button
              onClick={openNotifications}
              className={cn(
                "relative flex h-8 w-8 items-center justify-center rounded-lg transition-colors",
                notificationsOpen ? "bg-[#f7f9fb]" : "hover:bg-neutral-50",
              )}
            >
              <Bell className="h-4 w-4 text-[#596881]" strokeWidth={1.5} />
              {/* Unread indicator */}
              <span className="absolute right-1.5 top-1.5 h-1.5 w-1.5 rounded-full bg-[#df1c41]" />
            </button>

            {notificationsOpen && (
              <NotificationPopup onClose={() => setNotificationsOpen(false)} />
            )}
          </div>

          {/* Settings */}
          <button className="flex h-8 w-8 items-center justify-center rounded-lg hover:bg-neutral-50 transition-colors">
            <Settings className="h-4 w-4 text-[#596881]" strokeWidth={1.5} />
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
                <AvatarFallback className="bg-[#266df0] text-xs font-semibold text-white">
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

      {/* Search modal — rendered outside header so it can be full-screen */}
      <SearchModal open={searchOpen} onOpenChange={setSearchOpen} />
    </>
  );
}
