"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

const DAY_LABELS = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];
const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

function getDaysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfMonth(year: number, month: number) {
  return new Date(year, month, 1).getDay();
}

interface CalendarDatePickerProps {
  onCancel: () => void;
  onApply: (start: Date, end?: Date) => void;
}

export function CalendarDatePicker({
  onCancel,
  onApply,
}: CalendarDatePickerProps) {
  const today = new Date();
  const [viewYear, setViewYear] = useState(today.getFullYear());
  const [viewMonth, setViewMonth] = useState(today.getMonth());
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [endEnabled, setEndEnabled] = useState(false);
  const [pickingEnd, setPickingEnd] = useState(false);

  function prevMonth() {
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear((y) => y - 1);
    } else setViewMonth((m) => m - 1);
  }
  function nextMonth() {
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear((y) => y + 1);
    } else setViewMonth((m) => m + 1);
  }

  function selectDay(day: number) {
    const d = new Date(viewYear, viewMonth, day);
    if (!endEnabled || !startDate) {
      setStartDate(d);
      setEndDate(null);
      setPickingEnd(false);
    } else if (!pickingEnd) {
      setPickingEnd(true);
      setStartDate(d);
      setEndDate(null);
    } else {
      if (d < startDate!) {
        setEndDate(startDate);
        setStartDate(d);
      } else setEndDate(d);
      setPickingEnd(false);
    }
  }

  function isSelected(day: number) {
    const d = new Date(viewYear, viewMonth, day);
    return (
      (startDate && d.toDateString() === startDate.toDateString()) ||
      (endDate && d.toDateString() === endDate.toDateString()) ||
      false
    );
  }

  function isInRange(day: number) {
    if (!startDate || !endDate) return false;
    const d = new Date(viewYear, viewMonth, day);
    return d > startDate && d < endDate;
  }

  function isToday(day: number) {
    return (
      new Date(viewYear, viewMonth, day).toDateString() === today.toDateString()
    );
  }

  // Build grid cells
  const daysInMonth = getDaysInMonth(viewYear, viewMonth);
  const firstDay = getFirstDayOfMonth(viewYear, viewMonth);
  const prevDays = getDaysInMonth(
    viewYear,
    viewMonth === 0 ? 11 : viewMonth - 1,
  );

  const cells: { day: number; current: boolean }[] = [];
  for (let i = 0; i < firstDay; i++)
    cells.push({ day: prevDays - firstDay + i + 1, current: false });
  for (let d = 1; d <= daysInMonth; d++) cells.push({ day: d, current: true });
  const trailing = cells.length % 7 === 0 ? 0 : 7 - (cells.length % 7);
  for (let d = 1; d <= trailing; d++) cells.push({ day: d, current: false });

  const rows: (typeof cells)[] = [];
  for (let i = 0; i < cells.length; i += 7) rows.push(cells.slice(i, i + 7));

  const selectedLabel = startDate
    ? startDate.toLocaleDateString("en-GB", {
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    : "Select a date";

  return (
    <div className="w-[340px] overflow-hidden rounded-xl border border-neutral-200 bg-white shadow-xl">
      {/* Month / year nav */}
      <div className="flex items-center justify-between px-4 pt-4 pb-2">
        <button
          onClick={prevMonth}
          className="flex h-7 w-7 items-center justify-center rounded-lg hover:bg-neutral-100 transition-colors"
        >
          <ChevronLeft className="h-4 w-4 text-[#596881]" strokeWidth={1.5} />
        </button>
        <span className="text-[14px] font-semibold text-[#111625]">
          {MONTHS[viewMonth]} {viewYear}
        </span>
        <button
          onClick={nextMonth}
          className="flex h-7 w-7 items-center justify-center rounded-lg hover:bg-neutral-100 transition-colors"
        >
          <ChevronRight className="h-4 w-4 text-[#596881]" strokeWidth={1.5} />
        </button>
      </div>

      {/* Selected date display + Today shortcut */}
      <div className="flex items-center justify-between gap-2 px-4 pb-3">
        <div className="flex h-8 min-w-0 flex-1 items-center truncate rounded-lg bg-[#f7f9fb] px-3 text-[12px] font-medium text-[#111625]">
          {selectedLabel}
          {endDate &&
            ` → ${endDate.toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })}`}
        </div>
        <button
          onClick={() => {
            setViewYear(today.getFullYear());
            setViewMonth(today.getMonth());
          }}
          className="flex h-8 shrink-0 items-center rounded-lg border border-neutral-200 px-3 text-[12px] text-[#111625] hover:bg-neutral-50 transition-colors"
        >
          Today
        </button>
      </div>

      {/* Day labels */}
      <div className="grid grid-cols-7 border-t border-neutral-100 px-3">
        {DAY_LABELS.map((d) => (
          <div key={d} className="flex h-8 items-center justify-center">
            <span className="text-[10px] font-semibold text-[#596881]">
              {d}
            </span>
          </div>
        ))}
      </div>

      {/* Date grid */}
      <div className="px-3 pb-2">
        {rows.map((row, ri) => (
          <div key={ri} className="grid grid-cols-7">
            {row.map((cell, ci) => {
              const sel = cell.current && isSelected(cell.day);
              const range = cell.current && isInRange(cell.day);
              const tod = cell.current && isToday(cell.day) && !sel;
              return (
                <button
                  key={ci}
                  onClick={() => cell.current && selectDay(cell.day)}
                  disabled={!cell.current}
                  className={cn(
                    "relative flex h-10 w-full items-center justify-center text-[13px] transition-colors",
                    !cell.current && "cursor-default",
                    cell.current &&
                      !sel &&
                      !range &&
                      "rounded-full hover:bg-neutral-100",
                    range && "bg-[#e9f0fe]",
                    !cell.current
                      ? "text-[#c5cfdd]"
                      : sel
                        ? "text-white"
                        : tod
                          ? "font-semibold text-[#266df0]"
                          : "text-[#111625]",
                  )}
                >
                  {sel && (
                    <span className="absolute inset-0 m-auto h-9 w-9 rounded-full bg-[#266df0]" />
                  )}
                  <span className="relative z-10">{cell.day}</span>
                </button>
              );
            })}
          </div>
        ))}
      </div>

      {/* End date toggle */}
      <div className="flex items-center justify-between border-t border-neutral-100 px-4 py-3">
        <span className="text-[13px] text-[#111625]">End date</span>
        <button
          role="switch"
          aria-checked={endEnabled}
          onClick={() => {
            setEndEnabled(!endEnabled);
            setEndDate(null);
            setPickingEnd(false);
          }}
          className={cn(
            "relative flex h-5 w-8 items-center rounded-full transition-colors duration-200",
            endEnabled ? "bg-[#266df0]" : "bg-[#dee4ee]",
          )}
        >
          <span
            className={cn(
              "absolute h-4 w-4 rounded-full bg-white shadow-sm transition-transform duration-200",
              endEnabled ? "translate-x-[14px]" : "translate-x-[2px]",
            )}
          />
        </button>
      </div>

      {/* Cancel / Apply */}
      <div className="flex items-center gap-3 border-t border-neutral-100 px-4 py-3">
        <button
          onClick={onCancel}
          className="flex h-8 flex-1 items-center justify-center rounded-lg border border-neutral-200 text-[13px] text-[#111625] hover:bg-neutral-50 transition-colors"
        >
          Cancel
        </button>
        <button
          onClick={() => startDate && onApply(startDate, endDate ?? undefined)}
          disabled={!startDate}
          className="flex h-8 flex-1 items-center justify-center rounded-lg bg-[#266df0] text-[13px] font-medium text-white hover:bg-[#1a5dd4] disabled:opacity-40 transition-colors"
        >
          Apply
        </button>
      </div>
    </div>
  );
}
