"use client";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useAuth } from "@/lib/hooks/use-auth";
import { useAuthStore } from "@/lib/stores/auth-store";
import {
  Activity,
  ArrowLeftRight,
  HelpCircle,
  Keyboard,
  LogOut,
  Settings,
  User,
} from "lucide-react";

interface ProfileDropdownProps {
  onClose: () => void;
}

const accountItems = [
  { label: "Switch Account", icon: ArrowLeftRight },
  { label: "Manage Account", icon: User },
];

const menuItems = [
  { label: "Activity", icon: Activity },
  { label: "Settings", icon: Settings },
  { label: "Help", icon: HelpCircle },
  { label: "Shortcuts", icon: Keyboard },
];

export function ProfileDropdown({ onClose }: ProfileDropdownProps) {
  const user = useAuthStore((s) => s.user);
  const { logout } = useAuth();

  return (
    <div className="fixed inset-0 z-50" onClick={onClose}>
      <div
        className="absolute right-4 top-14 w-75 overflow-hidden rounded-xl border border-neutral-200 bg-white shadow-lg"
        onClick={(e) => e.stopPropagation()}
      >
        {/* ── ACCOUNT SECTION ── */}
        <div className="px-6 pt-5 pb-4">
          {/* Label */}
          <p className="mb-3 text-[10px] uppercase tracking-widest text-[#596881]">
            account
          </p>

          {/* Profile */}
          <div className="flex items-center gap-3 mb-4">
            <Avatar className="h-12 w-12">
              <AvatarFallback className="bg-primary-500 text-white text-sm font-medium">
                {user?.name?.charAt(0).toUpperCase() || "U"}
              </AvatarFallback>
            </Avatar>
            <div className="flex flex-col">
              <span className="text-p-small font-semibold text-[#111625]">
                {user?.name || "Jonas Khanwald"}
              </span>
              <span className="text-label-xsmall text-[#8796af]">
                {user?.email || "jonas@mail.com"}
              </span>
            </div>
          </div>

          {/* Account items */}
          <div className="flex flex-col">
            {accountItems.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.label}
                  className="flex h-8 items-center gap-3 rounded-lg px-2 text-p-small text-[#111625] hover:bg-neutral-50 transition-colors text-left"
                >
                  <Icon
                    className="h-4 w-4 text-neutral-400"
                    strokeWidth={1.5}
                  />
                  {item.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* ── DIVIDER ── */}
        <div className="mx-6 border-t border-neutral-100" />

        {/* ── MENU SECTION ── */}
        <div className="px-6 py-4">
          <p className="mb-2 text-[10px] uppercase tracking-widest text-[#596881]">
            menu
          </p>
          <div className="flex flex-col">
            {menuItems.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.label}
                  className="flex h-8 items-center gap-3 rounded-lg px-2 text-p-small text-[#111625] hover:bg-neutral-50 transition-colors text-left"
                >
                  <Icon
                    className="h-4 w-4 text-neutral-400"
                    strokeWidth={1.5}
                  />
                  {item.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* ── DIVIDER ── */}
        <div className="mx-6 border-t border-neutral-100" />

        {/* ── LOG OUT ── */}
        <div className="px-6 py-4">
          <button
            onClick={logout}
            className="flex h-8 w-full items-center gap-3 rounded-lg px-2 text-p-small text-[#df1c41] hover:bg-red-50 transition-colors"
          >
            <LogOut className="h-4 w-4" strokeWidth={1.5} />
            Log out
          </button>
        </div>
      </div>
    </div>
  );
}
