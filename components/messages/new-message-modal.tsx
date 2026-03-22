// components/messages/new-message-modal.tsx
"use client";
import { useState } from "react";
import { Search } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useGetOrCreateDm } from "@/lib/hooks/use-channels";
import type { UserModel } from "@/types/models";

interface NewMessageModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  workspaceMembers: UserModel[];
  onChannelCreated: (channelId: string, otherUser: UserModel) => void;
}

function getInitials(name: string) {
  return name
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

export function NewMessageModal({
  open,
  onOpenChange,
  workspaceMembers,
  onChannelCreated,
}: NewMessageModalProps) {
  const [search, setSearch] = useState("");
  const { mutateAsync: getOrCreateDm, isPending } = useGetOrCreateDm();

  const filtered = workspaceMembers.filter(
    (u) =>
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase()),
  );

  async function handleSelect(user: UserModel) {
    const channel = await getOrCreateDm(user.id);
    onOpenChange(false);
    setSearch("");
    onChannelCreated(channel.id, user);
  }

  if (!open) return null;

  return (
    // Full-screen backdrop
    <div
      className="fixed inset-0 z-50 flex items-start justify-center"
      style={{ paddingTop: 100 }}
      onClick={() => onOpenChange(false)}
    >
      {/* Dim overlay */}
      <div className="absolute inset-0 bg-black/20" />

      {/*
        Figma: "new-message-popup" — 300×416, white, r16, padding 16
        Title: "New Message" 16px/500
        Search: 32px tall, r10, placeholder "Search name or email"
        List: 7 members × 32px rows, avatar 32px + name 12px/500
      */}
      <div
        className="relative flex flex-col bg-white"
        style={{
          width: 300,
          borderRadius: 16,
          padding: 16,
          boxShadow: "0 8px 32px rgba(0,0,0,0.12)",
          maxHeight: 416,
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Title */}
        <p
          className="font-medium text-[#111625] mb-3"
          style={{ fontSize: 16, lineHeight: "24px" }}
        >
          New Message
        </p>

        {/* Search */}
        <div className="relative mb-3">
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8796af]"
            style={{ width: 14, height: 14 }}
            strokeWidth={1.5}
          />
          <input
            autoFocus
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search name or email"
            className="w-full rounded-[10px] border bg-white pl-8 pr-10 text-[12px] text-[#111625] placeholder:text-[#8796af] focus:border-[#266df0] focus:outline-none focus:ring-2 focus:ring-[#266df0]/10"
            style={{ height: 32, borderColor: "#dde3ee" }}
          />
          {/* ⌘+K badge */}
          <span
            className="absolute right-2 top-1/2 -translate-y-1/2 select-none text-[11px] text-[#596881]"
            style={{
              backgroundColor: "#f7f9fb",
              borderRadius: 6,
              padding: "2px 5px",
            }}
          >
            ⌘+K
          </span>
        </div>

        {/* Member list */}
        <div
          className="flex flex-col overflow-y-auto"
          style={{ maxHeight: 296 }}
        >
          {filtered.length === 0 ? (
            <p className="py-6 text-center text-[12px] text-[#8796af]">
              No members found.
            </p>
          ) : (
            filtered.map((user) => (
              <button
                key={user.id}
                onClick={() => handleSelect(user)}
                disabled={isPending}
                className="flex items-center gap-3 rounded-lg px-2 text-left transition-colors hover:bg-[#f7f9fb] disabled:opacity-50"
                style={{ height: 32 }}
              >
                <Avatar style={{ width: 32, height: 32, flexShrink: 0 }}>
                  <AvatarImage src={user.avatarUrl ?? undefined} />
                  <AvatarFallback
                    className="text-[11px] font-medium text-white"
                    style={{ backgroundColor: user.avatarColor ?? "#266df0" }}
                  >
                    {getInitials(user.name)}
                  </AvatarFallback>
                </Avatar>
                <span
                  className="truncate font-medium"
                  style={{ fontSize: 12, color: "#111625" }}
                >
                  {isPending ? "Opening…" : user.name}
                </span>
              </button>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
