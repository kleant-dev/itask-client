// components/messages/new-message-modal.tsx
"use client";

import { useState } from "react";
import { Search, X } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useGetOrCreateDm } from "@/lib/hooks/use-channels";
import type { UserModel } from "@/types/models";

interface NewMessageModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  workspaceMembers: UserModel[];
  onChannelCreated: (channelId: string, otherUser: UserModel) => void;
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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[500px] max-w-[calc(100vw-48px)] gap-0 rounded-2xl p-0">
        <DialogHeader className="border-b border-neutral-100 px-6 py-5">
          <DialogTitle className="text-[18px] font-semibold text-neutral-900">
            New Message
          </DialogTitle>
          <DialogDescription className="text-[13px] text-neutral-500">
            Search for a workspace member to start a conversation.
          </DialogDescription>
        </DialogHeader>

        {/* Search */}
        <div className="border-b border-neutral-100 px-6 py-4">
          <div className="relative">
            <Search
              className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400"
              strokeWidth={1.5}
            />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search members…"
              autoFocus
              className="h-10 w-full rounded-lg border border-neutral-200 bg-neutral-50 pl-9 pr-3 text-[14px] text-neutral-900 placeholder:text-neutral-400 focus:border-[#266df0] focus:outline-none focus:ring-2 focus:ring-[#266df0]/10"
            />
          </div>
        </div>

        {/* Members list */}
        <div className="max-h-[320px] overflow-y-auto py-2">
          {filtered.length === 0 ? (
            <p className="px-6 py-6 text-center text-[13px] text-neutral-500">
              No members found.
            </p>
          ) : (
            filtered.map((user) => (
              <button
                key={user.id}
                onClick={() => handleSelect(user)}
                disabled={isPending}
                className="flex w-full items-center gap-3 px-6 py-3 text-left hover:bg-neutral-50 transition-colors disabled:opacity-50"
              >
                <Avatar className="h-9 w-9">
                  <AvatarFallback
                    className="text-[13px] font-medium text-white"
                    style={{ backgroundColor: user.avatarColor ?? "#266df0" }}
                  >
                    {user.name.slice(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-[14px] font-medium text-neutral-900">
                    {user.name}
                  </p>
                  <p className="text-[12px] text-neutral-500">{user.email}</p>
                </div>
              </button>
            ))
          )}
        </div>

        <div className="border-t border-neutral-100 px-6 py-4">
          <Button
            variant="outline"
            className="w-full"
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
