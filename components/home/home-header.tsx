"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { AddTeammateModal } from "./add-teammate-modal";
import { MembersPopup } from "./members-popup";

const TEAM_MEMBERS = [
  { initials: "DS", color: "bg-pink-400" },
  { initials: "YT", color: "bg-purple-400" },
  { initials: "SK", color: "bg-blue-400" },
  { initials: "AK", color: "bg-green-400" },
];

export function HomeHeader() {
  const [inviteOpen, setInviteOpen] = useState(false);
  const [membersOpen, setMembersOpen] = useState(false);

  return (
    <>
      <div className="flex items-start justify-between">
        {/* Greeting */}
        <div>
          <h1 className="text-[26px] font-semibold text-[#111625] leading-tight">
            Good Morning, Jonas! 🙌
          </h1>
          <p className="mt-1 text-[14px] text-[#596881]">
            Let&apos;s kick off the day and get all your stuff done!
          </p>
        </div>

        {/* Right: avatars + invite */}
        <div className="flex items-center gap-3">
          {/* Avatar group — click opens members list */}
          <button
            onClick={() => setMembersOpen(!membersOpen)}
            className="flex items-center hover:opacity-80 transition-opacity"
          >
            <div className="flex -space-x-2">
              {TEAM_MEMBERS.map((m, i) => (
                <Avatar key={i} className="h-8 w-8 border-2 border-white">
                  <AvatarFallback
                    className={`text-xs font-semibold text-white ${m.color}`}
                  >
                    {m.initials}
                  </AvatarFallback>
                </Avatar>
              ))}
            </div>
            <span className="ml-1.5 text-[11px] font-medium text-[#596881]">
              +3
            </span>
          </button>

          {/* Invite button */}
          <Button
            size="sm"
            onClick={() => setInviteOpen(true)}
            className="h-8 gap-1.5 rounded-lg bg-[#266df0] px-3 text-[13px] hover:bg-[#1a5dd4]"
          >
            <Plus className="h-4 w-4" />
            Invite Teammate
          </Button>
        </div>
      </div>

      {/* Members popup (not a Dialog — it's a small tooltip-style panel) */}
      {membersOpen && <MembersPopup onClose={() => setMembersOpen(false)} />}

      {/* Invite modal — uses Dialog */}
      <AddTeammateModal open={inviteOpen} onOpenChange={setInviteOpen} />
    </>
  );
}
