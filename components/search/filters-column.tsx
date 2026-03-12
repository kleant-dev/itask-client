"use client";

import { useState } from "react";
import {
  Users,
  PenLine,
  Loader,
  Archive,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { MemberPickerPopup } from "./member-picker-popup";
import { StatusPickerPopup } from "./status-picker-popup";

type OpenPicker = "assignedTo" | "createdBy" | "status" | null;

const MEMBERS: Record<string, { initials: string; color: string }> = {
  "1": { initials: "DS", color: "bg-pink-400" },
  "2": { initials: "AK", color: "bg-green-400" },
  "3": { initials: "BL", color: "bg-teal-400" },
  "4": { initials: "YT", color: "bg-purple-400" },
  "5": { initials: "SK", color: "bg-blue-400" },
  "6": { initials: "ZL", color: "bg-orange-400" },
  "7": { initials: "PD", color: "bg-red-400" },
};

const STATUS_LABELS: Record<string, string> = {
  todo: "To Do",
  archived: "Archived",
  "on-progress": "On Progress",
  review: "Review",
  done: "Done",
  overdue: "Overdue",
};

function MemberDisplay({ ids }: { ids: string[] }) {
  if (ids.length === 0)
    return <span className="text-[13px] text-[#596881]">Anyone</span>;
  const visible = ids.slice(0, 4);
  const extra = ids.length - visible.length;
  return (
    <div className="flex items-center gap-1">
      <div className="flex -space-x-1.5">
        {visible.map((id) => (
          <Avatar key={id} className="h-5 w-5 border border-white">
            <AvatarFallback
              className={`text-[9px] font-semibold text-white ${MEMBERS[id].color}`}
            >
              {MEMBERS[id].initials}
            </AvatarFallback>
          </Avatar>
        ))}
      </div>
      {extra > 0 && (
        <span className="text-[12px] text-[#596881]">+{extra}</span>
      )}
    </div>
  );
}

function StatusDisplay({ ids }: { ids: string[] }) {
  if (ids.length === 0)
    return <span className="text-[13px] text-[#596881]">Any</span>;
  return (
    <span className="truncate text-[13px] text-[#111625] max-w-[80px]">
      {ids.map((id) => STATUS_LABELS[id]).join(", ")}
    </span>
  );
}

export function FiltersColumn() {
  const [openPicker, setOpenPicker] = useState<OpenPicker>(null);
  const [assignedTo, setAssignedTo] = useState<string[]>([]);
  const [createdBy, setCreatedBy] = useState<string[]>([]);
  const [statuses, setStatuses] = useState<string[]>([]);
  const [archived, setArchived] = useState(false);

  function togglePicker(key: OpenPicker) {
    setOpenPicker((prev) => (prev === key ? null : key));
  }

  const hasFilters =
    assignedTo.length > 0 ||
    createdBy.length > 0 ||
    statuses.length > 0 ||
    archived;

  return (
    <div className="flex min-w-0 flex-[4] shrink-0 flex-col px-7 py-8 overflow-y-auto">
      <p className="mb-6 text-[12px] font-medium uppercase tracking-widest text-[#8796af]">
        Quick Filters
      </p>

      <div className="flex flex-col gap-5">
        {/* ASSIGNED TO */}
        <div className="relative flex items-center justify-between">
          <div className="flex items-center gap-2 text-[14px] text-[#111625]">
            <Users
              className="h-[18px] w-[18px] text-[#596881]"
              strokeWidth={1.5}
            />
            Assigned to
          </div>
          <button
            onClick={() => togglePicker("assignedTo")}
            className={cn(
              "flex h-8 min-w-[103px] items-center justify-between gap-2 rounded-lg px-2.5 transition-colors",
              openPicker === "assignedTo"
                ? "bg-[#f7f9fb]"
                : "hover:bg-neutral-50",
            )}
          >
            <MemberDisplay ids={assignedTo} />
            {openPicker === "assignedTo" ? (
              <ChevronUp
                className="h-4 w-4 shrink-0 text-[#596881]"
                strokeWidth={1.5}
              />
            ) : (
              <ChevronDown
                className="h-4 w-4 shrink-0 text-[#596881]"
                strokeWidth={1.5}
              />
            )}
          </button>
          {openPicker === "assignedTo" && (
            <MemberPickerPopup
              selected={assignedTo}
              onChange={setAssignedTo}
              onDone={() => setOpenPicker(null)}
            />
          )}
        </div>

        {/* CREATED BY */}
        <div className="relative flex items-center justify-between">
          <div className="flex items-center gap-2 text-[14px] text-[#111625]">
            <PenLine
              className="h-[18px] w-[18px] text-[#596881]"
              strokeWidth={1.5}
            />
            Created by
          </div>
          <button
            onClick={() => togglePicker("createdBy")}
            className={cn(
              "flex h-8 min-w-[103px] items-center justify-between gap-2 rounded-lg px-2.5 transition-colors",
              openPicker === "createdBy"
                ? "bg-[#f7f9fb]"
                : "hover:bg-neutral-50",
            )}
          >
            <MemberDisplay ids={createdBy} />
            {openPicker === "createdBy" ? (
              <ChevronUp
                className="h-4 w-4 shrink-0 text-[#596881]"
                strokeWidth={1.5}
              />
            ) : (
              <ChevronDown
                className="h-4 w-4 shrink-0 text-[#596881]"
                strokeWidth={1.5}
              />
            )}
          </button>
          {openPicker === "createdBy" && (
            <MemberPickerPopup
              selected={createdBy}
              onChange={setCreatedBy}
              onDone={() => setOpenPicker(null)}
            />
          )}
        </div>

        {/* STATUS */}
        <div className="relative flex items-center justify-between">
          <div className="flex items-center gap-2 text-[14px] text-[#111625]">
            <Loader
              className="h-[18px] w-[18px] text-[#596881]"
              strokeWidth={1.5}
            />
            Status
          </div>
          <button
            onClick={() => togglePicker("status")}
            className={cn(
              "flex h-8 min-w-[78px] items-center justify-between gap-2 rounded-lg px-2.5 transition-colors",
              openPicker === "status" ? "bg-[#f7f9fb]" : "hover:bg-neutral-50",
            )}
          >
            <StatusDisplay ids={statuses} />
            {openPicker === "status" ? (
              <ChevronUp
                className="h-4 w-4 shrink-0 text-[#596881]"
                strokeWidth={1.5}
              />
            ) : (
              <ChevronDown
                className="h-4 w-4 shrink-0 text-[#596881]"
                strokeWidth={1.5}
              />
            )}
          </button>
          {openPicker === "status" && (
            <StatusPickerPopup
              selected={statuses}
              onChange={setStatuses}
              onDone={() => setOpenPicker(null)}
            />
          )}
        </div>

        {/* ARCHIVED TOGGLE */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-[14px] text-[#111625]">
            <Archive
              className="h-[18px] w-[18px] text-[#596881]"
              strokeWidth={1.5}
            />
            Archived
          </div>
          <button
            role="switch"
            aria-checked={archived}
            onClick={() => setArchived(!archived)}
            className={cn(
              "relative flex h-5 w-8 items-center rounded-full transition-colors duration-200",
              archived ? "bg-[#266df0]" : "bg-[#dee4ee]",
            )}
          >
            <span
              className={cn(
                "absolute h-4 w-4 rounded-full bg-white shadow-sm transition-transform duration-200",
                archived ? "translate-x-[14px]" : "translate-x-[2px]",
              )}
            />
          </button>
        </div>

        {/* Reset */}
        {hasFilters && (
          <>
            <div className="border-t border-neutral-100" />
            <button
              onClick={() => {
                setAssignedTo([]);
                setCreatedBy([]);
                setStatuses([]);
                setArchived(false);
              }}
              className="self-start text-[13px] text-[#266df0] hover:underline transition-colors"
            >
              Reset filters
            </button>
          </>
        )}
      </div>
    </div>
  );
}
