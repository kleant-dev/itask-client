"use client";

import { cn } from "@/lib/utils";

const STATUSES = [
  { id: "todo", label: "To Do", bg: "bg-[#eff3f8]", text: "text-[#8796af]" },
  {
    id: "archived",
    label: "Archived",
    bg: "bg-[#f7f9fb]",
    text: "text-[#111625]",
  },
  {
    id: "on-progress",
    label: "On Progress",
    bg: "bg-[#ebefff]",
    text: "text-[#375dfb]",
  },
  { id: "review", label: "Review", bg: "bg-[#fef7ec]", text: "text-[#ac7c2d]" },
  { id: "done", label: "Done", bg: "bg-[#ebf9f4]", text: "text-[#38c793]" },
  {
    id: "overdue",
    label: "Overdue",
    bg: "bg-[#fce8ec]",
    text: "text-[#df1c41]",
  },
];

interface StatusPickerPopupProps {
  selected: string[];
  onChange: (ids: string[]) => void;
  onDone: () => void;
}

export function StatusPickerPopup({
  selected,
  onChange,
  onDone,
}: StatusPickerPopupProps) {
  function toggle(id: string) {
    onChange(
      selected.includes(id)
        ? selected.filter((s) => s !== id)
        : [...selected, id],
    );
  }

  return (
    <div
      className="absolute right-0 top-full z-20 mt-1.5 w-75 overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-xl"
      onClick={(e) => e.stopPropagation()}
    >
      <div className="flex flex-col gap-2 p-3">
        <div className="flex flex-col gap-0.5">
          {STATUSES.map((status) => {
            const checked = selected.includes(status.id);
            return (
              <button
                key={status.id}
                onClick={() => toggle(status.id)}
                className="flex h-9 w-full items-center gap-3 rounded-lg px-2 hover:bg-neutral-50 transition-colors text-left"
              >
                <div
                  className={cn(
                    "flex h-4 w-4 shrink-0 items-center justify-center rounded border-[1.5px] transition-colors",
                    checked
                      ? "border-[#266df0] bg-[#266df0]"
                      : "border-[#dee4ee] bg-white",
                  )}
                >
                  {checked && (
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
                <span
                  className={cn(
                    "inline-flex items-center rounded px-2 py-0.5 text-[12px] font-medium",
                    status.bg,
                    status.text,
                  )}
                >
                  {status.label}
                </span>
              </button>
            );
          })}
        </div>
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
