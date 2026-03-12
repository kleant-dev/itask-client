// components/home/members-popup.tsx
"use client";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";

interface Member {
  name: string;
  email: string;
  color: string;
  initials: string;
}

const members: Member[] = [
  {
    name: "Diana Sayu",
    email: "diana@sprintly.com",
    initials: "DS",
    color: "bg-pink-400",
  },
  {
    name: "Adrian Kurt",
    email: "adrian@sprintly.com",
    initials: "AK",
    color: "bg-green-400",
  },
  {
    name: "Bianca Lofre",
    email: "bianca@sprintly.com",
    initials: "BL",
    color: "bg-teal-400",
  },
  {
    name: "Yuki Tanaka",
    email: "yuki@sprintly.com",
    initials: "YT",
    color: "bg-purple-400",
  },
  {
    name: "Sam Kohler",
    email: "sam@sprintly.com",
    initials: "SK",
    color: "bg-blue-400",
  },
  {
    name: "Zender Lowre",
    email: "zender@sprintly.com",
    initials: "ZL",
    color: "bg-orange-400",
  },
  {
    name: "Palmer Dian",
    email: "palmer@sprintly.com",
    initials: "PD",
    color: "bg-red-400",
  },
];

interface MembersPopupProps {
  onClose: () => void;
  anchorRef?: React.RefObject<HTMLElement>;
}

export function MembersPopup({ onClose }: MembersPopupProps) {
  return (
    <div className="fixed inset-0 z-50" onClick={onClose}>
      {/* Popup - 300x424, positioned near avatar group */}
      <div
        className="absolute right-60 top-35 w-75 rounded-xl border border-neutral-200 bg-white shadow-lg"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-6 py-5">
          {/* Label */}
          <p className="mb-3 text-[10px] uppercase tracking-widest text-[#596881]">
            Members
          </p>

          {/* Member list */}
          <div className="flex flex-col gap-1">
            {members.map((member) => (
              <div
                key={member.email}
                className="flex h-9 items-center gap-3 rounded-lg px-1 hover:bg-neutral-50 transition-colors cursor-pointer"
              >
                <Avatar className="h-8 w-8 shrink-0">
                  <AvatarFallback
                    className={`text-xs font-medium text-white ${member.color}`}
                  >
                    {member.initials}
                  </AvatarFallback>
                </Avatar>
                <div className="flex flex-col min-w-0">
                  <span className="text-label-small font-medium text-[#111625] truncate">
                    {member.name}
                  </span>
                  <span className="text-label-xsmall text-[#596881] truncate">
                    {member.email}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
