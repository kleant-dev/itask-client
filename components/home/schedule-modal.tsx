"use client";

import { useState } from "react";
import { CalendarDays, Clock, Plus, X, Info, ChevronDown } from "lucide-react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";

interface AddScheduleModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const SCHEDULE_TYPES = ["Meeting", "Task", "Review", "Event", "Reminder"];

const MEMBERS = [
  { id: "1", initials: "DS", color: "bg-pink-400" },
  { id: "2", initials: "AK", color: "bg-green-400" },
  { id: "3", initials: "BL", color: "bg-teal-400" },
  { id: "4", initials: "YT", color: "bg-purple-400" },
];

export function AddScheduleModal({
  open,
  onOpenChange,
}: AddScheduleModalProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [scheduleType, setScheduleType] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [assignees, setAssignees] = useState<string[]>([]);

  function handleSubmit() {
    // TODO: wire to API
    onOpenChange(false);
    setTitle("");
    setDescription("");
    setScheduleType("");
    setDate("");
    setTime("");
    setAssignees([]);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[500px] max-w-[calc(100vw-48px)] max-h-[min(722px,calc(100vh-96px))] rounded-3xl p-0 gap-0 overflow-hidden flex flex-col [&>button]:hidden">
        <DialogTitle className="sr-only">Add Schedule</DialogTitle>

        {/* Header — 72px */}
        <div className="flex h-[72px] items-center justify-between px-6 shrink-0">
          <div className="flex items-center gap-2">
            <CalendarDays
              className="h-5 w-5 text-[#596881]"
              strokeWidth={1.5}
            />
            <span className="text-[16px] font-semibold text-[#111625]">
              Add Schedule
            </span>
          </div>
          <button
            onClick={() => onOpenChange(false)}
            className="flex h-7 w-7 items-center justify-center rounded-lg text-[#8796af] hover:bg-neutral-100 hover:text-neutral-600 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="h-px bg-neutral-100 shrink-0" />

        {/* Content - ADDED: flex-1 min-h-0 to enable proper scrolling */}
        <div className="flex flex-1 min-h-0 flex-col gap-5 overflow-y-auto px-6 py-5">
          {/* Title */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[13px] text-[#8796af]">Title</label>
            <div className="flex h-10 items-center gap-2 rounded-[10px] border border-neutral-200 bg-white px-3 focus-within:border-[#266df0] focus-within:ring-2 focus-within:ring-[#266df0]/10 transition-all">
              <Plus
                className="h-4 w-4 shrink-0 text-[#8796af]"
                strokeWidth={1.5}
              />
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Add a title"
                className="flex-1 bg-transparent text-[14px] text-[#111625] placeholder:text-[#8796af] outline-none"
              />
            </div>
            <p className="flex items-center gap-1 text-[12px] text-[#8796af]">
              <Info className="h-3.5 w-3.5 shrink-0" strokeWidth={1.5} />
              Give your schedule a clear, descriptive title.
            </p>
          </div>

          {/* Description */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[13px] text-[#8796af]">Descriptions</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Add a descriptions"
              rows={4}
              className="w-full resize-none rounded-[10px] border border-neutral-200 bg-white px-3 py-2.5 text-[14px] text-[#111625] placeholder:text-[#8796af] outline-none focus:border-[#266df0] focus:ring-2 focus:ring-[#266df0]/10 transition-all"
            />
            <p className="flex items-center gap-1 text-[12px] text-[#8796af]">
              <Info className="h-3.5 w-3.5 shrink-0" strokeWidth={1.5} />
              Provide details about the schedule.
            </p>
          </div>

          {/* Schedule Type */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[13px] text-[#8796af]">Schedule Type</label>
            <div className="relative">
              <select
                value={scheduleType}
                onChange={(e) => setScheduleType(e.target.value)}
                className="w-full appearance-none rounded-[10px] border border-neutral-200 bg-white px-3 py-0 h-10 text-[14px] text-[#111625] outline-none focus:border-[#266df0] focus:ring-2 focus:ring-[#266df0]/10 transition-all"
              >
                <option value="" disabled>
                  Select
                </option>
                {SCHEDULE_TYPES.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
              <ChevronDown
                className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#8796af]"
                strokeWidth={1.5}
              />
            </div>
            <p className="flex items-center gap-1 text-[12px] text-[#8796af]">
              <Info className="h-3.5 w-3.5 shrink-0" strokeWidth={1.5} />
              Choose the type that best describes this schedule.
            </p>
          </div>

          {/* Date + Time row */}
          <div className="grid grid-cols-2 gap-4">
            {/* Date */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[13px] text-[#8796af]">Date</label>
              <div className="flex h-10 items-center gap-2 rounded-[10px] border border-neutral-200 bg-white px-3 focus-within:border-[#266df0] focus-within:ring-2 focus-within:ring-[#266df0]/10 transition-all">
                <CalendarDays
                  className="h-4 w-4 shrink-0 text-[#8796af]"
                  strokeWidth={1.5}
                />
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="flex-1 bg-transparent text-[14px] text-[#111625] placeholder:text-[#8796af] outline-none"
                />
              </div>
            </div>

            {/* Time */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[13px] text-[#8796af]">Time</label>
              <div className="flex h-10 items-center gap-2 rounded-[10px] border border-neutral-200 bg-white px-3 focus-within:border-[#266df0] focus-within:ring-2 focus-within:ring-[#266df0]/10 transition-all">
                <Clock
                  className="h-4 w-4 shrink-0 text-[#8796af]"
                  strokeWidth={1.5}
                />
                <input
                  type="time"
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                  className="flex-1 bg-transparent text-[14px] text-[#111625] placeholder:text-[#8796af] outline-none"
                />
              </div>
            </div>
          </div>

          {/* Assignee */}
          <div className="flex flex-col gap-2">
            <label className="text-[13px] text-[#8796af]">Assignee</label>
            <div className="flex items-center gap-2 flex-wrap">
              {/* Selected avatars */}
              {assignees.map((id) => {
                const m = MEMBERS.find((m) => m.id === id)!;
                return (
                  <button
                    key={id}
                    onClick={() =>
                      setAssignees((prev) => prev.filter((a) => a !== id))
                    }
                    className={`flex h-8 w-8 items-center justify-center rounded-full text-[11px] font-semibold text-white ${m.color} hover:opacity-80 transition-opacity`}
                    title="Remove"
                  >
                    {m.initials}
                  </button>
                );
              })}

              {/* Add people button */}
              <button
                onClick={() => {
                  const next = MEMBERS.find((m) => !assignees.includes(m.id));
                  if (next) setAssignees((prev) => [...prev, next.id]);
                }}
                className="flex h-8 items-center gap-1.5 rounded-full border border-neutral-200 bg-white px-3 text-[13px] text-[#8796af] hover:bg-neutral-50 transition-colors"
              >
                <Plus className="h-4 w-4" strokeWidth={1.5} />
                Add people
              </button>
            </div>
          </div>
        </div>

        <div className="h-px bg-neutral-100 shrink-0" />

        {/* Actions — 84px */}
        <div className="flex h-[84px] shrink-0 items-center justify-end gap-3 px-6">
          <button
            onClick={() => onOpenChange(false)}
            className="flex h-9 items-center rounded-lg border border-neutral-200 px-4 text-[13px] text-[#111625] hover:bg-neutral-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={!title.trim()}
            className="flex h-9 items-center rounded-lg bg-[#266df0] px-4 text-[13px] font-medium text-white hover:bg-[#1a5dd4] disabled:opacity-50 transition-colors"
          >
            Add Schedule
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
