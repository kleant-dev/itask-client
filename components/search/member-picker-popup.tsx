"use client";

import { useState } from "react";
import { Search } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

interface Member {
  id: string;
  name: string;
  initials: string;
  color: string;
}

const MEMBERS: Member[] = [
  { id: "1", name: "Diana Sayu", initials: "DS", color: "bg-pink-400" },
  { id: "2", name: "Adrian Kurt", initials: "AK", color: "bg-green-400" },
  { id: "3", name: "Bianca Lofre", initials: "BL", color: "bg-teal-400" },
  { id: "4", name: "Yuki Tanaka", initials: "YT", color: "bg-purple-400" },
  { id: "5", name: "Sam Kohler", initials: "SK", color: "bg-blue-400" },
  { id: "6", name: "Zender Lowre", initials: "ZL", color: "bg-orange-400" },
  { id: "7", name: "Palmer Dian", initials: "PD", color: "bg-red-400" },
];

interface MemberPickerPopupProps {
  selected: string[];
  onChange: (ids: string[]) => void;
  onDone: () => void;
}

export function MemberPickerPopup({
  selected,
  onChange,
  onDone,
}: MemberPickerPopupProps) {
  const [search, setSearch] = useState("");

  const filtered = MEMBERS.filter((m) =>
    m.name.toLowerCase().includes(search.toLowerCase()),
  );

  function toggle(id: string) {
    onChange(
      selected.includes(id)
        ? selected.filter((s) => s !== id)
        : [...selected, id],
    );
  }

  return (
    // Positioned absolutely relative to its filter row container
    <div
      className="absolute right-0 top-full z-20 mt-1.5 w-75 overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-xl"
      onClick={(e) => e.stopPropagation()}
    >
      <div className="flex flex-col gap-2 p-3">
        {/* Search input */}
        <div className="flex h-8 items-center gap-2 rounded-[10px] border border-neutral-200 bg-white px-3">
          <Search
            className="h-3.5 w-3.5 shrink-0 text-[#8796af]"
            strokeWidth={1.5}
          />
          <input
            autoFocus
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search members..."
            className="flex-1 bg-transparent text-[13px] text-[#111625] placeholder:text-[#8796af] outline-none"
          />
        </div>

        {/* Member list */}
        <div className="flex max-h-60 flex-col gap-0.5 overflow-y-auto">
          {filtered.map((member) => {
            const isChecked = selected.includes(member.id);
            return (
              <button
                key={member.id}
                onClick={() => toggle(member.id)}
                className="flex h-9 w-full items-center gap-2.5 rounded-lg px-2 hover:bg-neutral-50 transition-colors text-left"
              >
                {/* Checkbox */}
                <div
                  className={cn(
                    "flex h-4 w-4 shrink-0 items-center justify-center rounded border-[1.5px] transition-colors",
                    isChecked
                      ? "border-[#266df0] bg-[#266df0]"
                      : "border-[#dee4ee] bg-white",
                  )}
                >
                  {isChecked && (
                    <svg
                      className="h-2.5 w-2.5 text-white"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      strokeWidth={3}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  )}
                </div>

                {/* Avatar */}
                <Avatar className="h-6 w-6 shrink-0">
                  <AvatarFallback
                    className={`text-[9px] font-semibold text-white ${member.color}`}
                  >
                    {member.initials}
                  </AvatarFallback>
                </Avatar>

                {/* Name */}
                <span className="flex-1 text-[13px] text-[#111625] truncate">
                  {member.name}
                </span>
              </button>
            );
          })}

          {filtered.length === 0 && (
            <p className="py-4 text-center text-[12px] text-[#8796af]">
              No members found
            </p>
          )}
        </div>

        {/* Done button */}
        <button
          onClick={onDone}
          className="flex h-8 w-full items-center justify-center rounded-lg bg-[#266df0] text-[13px] font-medium text-white hover:bg-[#1a5dd4] transition-colors"
        >
          Done
        </button>
      </div>
    </div>
  );
}
