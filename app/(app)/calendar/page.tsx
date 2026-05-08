// app/(app)/calendar/page.tsx
"use client";

import { useState, useMemo } from "react";
import { ChevronLeft, ChevronRight, Plus, CalendarDays } from "lucide-react";
import { cn } from "@/lib/utils";

type CalendarView = "Month" | "Week" | "Day";

interface CalendarEvent {
  id: string;
  title: string;
  time: string;
  colorBg: string;
  colorText: string;
}

interface CalendarDay {
  date: Date;
  dayNum: number;
  isCurrentMonth: boolean;
  isToday: boolean;
  events: CalendarEvent[];
}

// ── DESIGN TOKENS (from Figma) ────────────────────────────────────────────────
// Cell bg: white for current month, #F7F9FB for adjacent months
// Grid inner bg: #F7F9FB, cornerRadius 20px
// Outer container: white, cornerRadius 24px
// Cell cornerRadius: 16px
// Day header text: #596881, 12px uppercase
// Month title: #111625, 24px semibold

// ── MOCK DATA ─────────────────────────────────────────────────────────────────

function makeKey(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

// Build relative to today so the calendar always looks populated
function buildMockEvents(): Record<string, CalendarEvent[]> {
  const today = new Date();
  const y = today.getFullYear();
  const m = today.getMonth();

  const d = (day: number) => makeKey(new Date(y, m, day));

  return {
    [d(3)]: [
      {
        id: "e1",
        title: "Team Standup",
        time: "09:00",
        colorBg: "#ebf9f4",
        colorText: "#38c793",
      },
    ],
    [d(7)]: [
      {
        id: "e2",
        title: "Design Review",
        time: "10:00",
        colorBg: "#ebefff",
        colorText: "#375dfb",
      },
      {
        id: "e3",
        title: "Sprint Planning",
        time: "14:00",
        colorBg: "#fef7ec",
        colorText: "#f2ae40",
      },
    ],
    [d(10)]: [
      {
        id: "e4",
        title: "Meeting with Eventora",
        time: "09:10",
        colorBg: "#ebefff",
        colorText: "#375dfb",
      },
      {
        id: "e5",
        title: "Client Demo",
        time: "15:00",
        colorBg: "#fce8ec",
        colorText: "#df1c41",
      },
    ],
    [d(13)]: [
      {
        id: "e6",
        title: "Wireframe Feedback",
        time: "11:00",
        colorBg: "#fef7ec",
        colorText: "#f2ae40",
      },
    ],
    [d(today.getDate())]: [
      {
        id: "e7",
        title: "Product Sync",
        time: "10:30",
        colorBg: "#ebefff",
        colorText: "#375dfb",
      },
      {
        id: "e8",
        title: "Lunch with Adrian",
        time: "12:00",
        colorBg: "#ebf9f4",
        colorText: "#38c793",
      },
      {
        id: "e9",
        title: "UX Review",
        time: "15:00",
        colorBg: "#fce8ec",
        colorText: "#df1c41",
      },
    ],
    [d(today.getDate() + 2)]: [
      {
        id: "e10",
        title: "Quarterly Review",
        time: "09:00",
        colorBg: "#fce8ec",
        colorText: "#df1c41",
      },
      {
        id: "e11",
        title: "Team Retrospective",
        time: "14:00",
        colorBg: "#ebefff",
        colorText: "#375dfb",
      },
    ],
    [d(today.getDate() + 5)]: [
      {
        id: "e12",
        title: "Board Meeting",
        time: "10:00",
        colorBg: "#fef7ec",
        colorText: "#f2ae40",
      },
    ],
    [d(today.getDate() + 8)]: [
      {
        id: "e13",
        title: "Design Sprint",
        time: "09:00",
        colorBg: "#ebf9f4",
        colorText: "#38c793",
      },
      {
        id: "e14",
        title: "Luminos Launch",
        time: "16:00",
        colorBg: "#ebefff",
        colorText: "#375dfb",
      },
    ],
    [d(today.getDate() + 12)]: [
      {
        id: "e15",
        title: "1:1 with PD",
        time: "11:00",
        colorBg: "#fce8ec",
        colorText: "#df1c41",
      },
    ],
  };
}

// ── CALENDAR LOGIC ────────────────────────────────────────────────────────────

function generateMonthGrid(
  year: number,
  month: number,
  mockEvents: Record<string, CalendarEvent[]>,
): CalendarDay[] {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);

  // Start from the Sunday before (or on) the 1st
  const start = new Date(firstDay);
  start.setDate(start.getDate() - start.getDay());

  // End on the Saturday after (or on) the last day — always 6 rows
  const end = new Date(lastDay);
  const daysUntilSat = (6 - end.getDay() + 7) % 7;
  end.setDate(end.getDate() + daysUntilSat);
  // Ensure exactly 6 weeks (42 days)
  const totalDays =
    Math.round((end.getTime() - start.getTime()) / 86400000) + 1;
  if (totalDays < 42) end.setDate(end.getDate() + (42 - totalDays));

  const days: CalendarDay[] = [];
  const cur = new Date(start);

  while (cur <= end) {
    const copy = new Date(cur);
    copy.setHours(0, 0, 0, 0);
    const key = makeKey(cur);
    days.push({
      date: new Date(cur),
      dayNum: cur.getDate(),
      isCurrentMonth: cur.getMonth() === month,
      isToday: copy.getTime() === today.getTime(),
      events: mockEvents[key] ?? [],
    });
    cur.setDate(cur.getDate() + 1);
  }

  return days;
}

// ── CONSTANTS ─────────────────────────────────────────────────────────────────

const MONTH_NAMES = [
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

const DAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const VIEW_OPTIONS: CalendarView[] = ["Month", "Week", "Day"];
const MAX_VISIBLE_EVENTS = 2; // show 2, then "+N more"

// ── SUB-COMPONENTS ────────────────────────────────────────────────────────────

interface EventPillProps {
  event: CalendarEvent;
}

function EventPill({ event }: EventPillProps) {
  return (
    <div
      className="flex w-full items-center gap-1.5 truncate rounded-[5px] px-1.5 py-0.5"
      style={{ backgroundColor: event.colorBg }}
    >
      <span
        className="h-1.5 w-1.5 shrink-0 rounded-full"
        style={{ backgroundColor: event.colorText }}
      />
      <span
        className="truncate text-[11px] font-medium leading-4"
        style={{ color: event.colorText }}
      >
        {event.title}
      </span>
      <span
        className="ml-auto shrink-0 text-[10px] leading-4 opacity-70"
        style={{ color: event.colorText }}
      >
        {event.time}
      </span>
    </div>
  );
}

interface CalendarCellProps {
  day: CalendarDay;
  isSelected: boolean;
  onClick: (date: Date) => void;
}

function CalendarCell({ day, isSelected, onClick }: CalendarCellProps) {
  const visibleEvents = day.events.slice(0, MAX_VISIBLE_EVENTS);
  const overflow = day.events.length - MAX_VISIBLE_EVENTS;

  return (
    <div
      onClick={() => onClick(day.date)}
      className={cn(
        // Figma: cornerRadius 16px, padding 12px, vertical layout, gap 8px
        "flex min-h-[144px] cursor-pointer flex-col gap-2 rounded-2xl p-3 transition-colors",
        // Current month = white; adjacent months = F7F9FB
        day.isCurrentMonth
          ? "bg-white hover:bg-neutral-50"
          : "bg-[#f7f9fb] hover:bg-[#eff3f8]",
        // Selected: subtle blue ring
        isSelected && "ring-2 ring-[#375dfb]",
      )}
    >
      {/* Day number */}
      <div className="flex justify-end">
        {day.isToday ? (
          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#375dfb] text-[13px] font-semibold text-white">
            {day.dayNum}
          </span>
        ) : (
          <span
            className={cn(
              "flex h-6 w-6 items-center justify-center rounded-full text-[13px] font-medium",
              day.isCurrentMonth ? "text-[#111625]" : "text-[#596881]",
            )}
          >
            {day.dayNum}
          </span>
        )}
      </div>

      {/* Events */}
      <div className="flex flex-col gap-1">
        {visibleEvents.map((event) => (
          <EventPill key={event.id} event={event} />
        ))}
        {overflow > 0 && (
          <p className="pl-1 text-[11px] font-medium text-[#596881]">
            +{overflow} more event{overflow > 1 ? "s" : ""}
          </p>
        )}
      </div>
    </div>
  );
}

// ── WEEK VIEW (simplified) ────────────────────────────────────────────────────

interface WeekViewProps {
  year: number;
  month: number;
  mockEvents: Record<string, CalendarEvent[]>;
}

function WeekView({ year, month, mockEvents }: WeekViewProps) {
  const today = new Date();
  // Start of this week (Sunday)
  const start = new Date(today);
  start.setDate(today.getDate() - today.getDay());

  const weekDays = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    const key = makeKey(d);
    return {
      date: d,
      dayNum: d.getDate(),
      label: DAY_LABELS[i],
      isToday: d.toDateString() === today.toDateString(),
      events: mockEvents[key] ?? [],
    };
  });

  const hours = Array.from({ length: 12 }, (_, i) => i + 7); // 7 AM – 6 PM

  return (
    <div className="flex flex-1 flex-col overflow-hidden rounded-2xl bg-white">
      {/* Day header row */}
      <div className="grid grid-cols-8 border-b border-[#eff3f8]">
        <div className="py-3" /> {/* time gutter */}
        {weekDays.map((d) => (
          <div key={d.dayNum} className="flex flex-col items-center py-3">
            <span className="text-[11px] uppercase tracking-wide text-[#596881]">
              {d.label}
            </span>
            <span
              className={cn(
                "mt-1 flex h-7 w-7 items-center justify-center rounded-full text-[15px] font-semibold",
                d.isToday ? "bg-[#375dfb] text-white" : "text-[#111625]",
              )}
            >
              {d.dayNum}
            </span>
          </div>
        ))}
      </div>

      {/* Time grid */}
      <div className="flex flex-1 overflow-y-auto">
        <div className="flex flex-1 flex-col">
          {hours.map((h) => (
            <div
              key={h}
              className="grid min-h-[52px] grid-cols-8 border-b border-[#f7f9fb]"
            >
              <div className="px-3 py-1 text-[11px] text-[#8796af]">
                {h}:00 {h < 12 ? "AM" : "PM"}
              </div>
              {weekDays.map((d) => {
                const slotEvents = d.events.filter(
                  (e) => parseInt(e.time.split(":")[0]) === h,
                );
                return (
                  <div
                    key={d.dayNum}
                    className={cn(
                      "border-l border-[#eff3f8] px-1 py-1",
                      d.isToday && "bg-[#ebefff]/20",
                    )}
                  >
                    {slotEvents.map((e) => (
                      <div
                        key={e.id}
                        className="mb-0.5 truncate rounded px-1.5 py-0.5 text-[10px] font-medium"
                        style={{
                          backgroundColor: e.colorBg,
                          color: e.colorText,
                        }}
                      >
                        {e.title}
                      </div>
                    ))}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── DAY VIEW (simplified) ─────────────────────────────────────────────────────

interface DayViewProps {
  mockEvents: Record<string, CalendarEvent[]>;
}

function DayView({ mockEvents }: DayViewProps) {
  const today = new Date();
  const key = makeKey(today);
  const events = mockEvents[key] ?? [];
  const hours = Array.from({ length: 13 }, (_, i) => i + 7);

  return (
    <div className="flex flex-1 flex-col overflow-hidden rounded-2xl bg-white">
      {/* Header */}
      <div className="flex items-center gap-3 border-b border-[#eff3f8] px-6 py-3">
        <span className="text-[11px] uppercase tracking-wide text-[#596881]">
          {today.toLocaleDateString("en-US", { weekday: "long" })}
        </span>
        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#375dfb] text-[15px] font-semibold text-white">
          {today.getDate()}
        </span>
        <span className="text-[13px] text-[#596881]">
          {today.toLocaleDateString("en-US", {
            month: "long",
            year: "numeric",
          })}
        </span>
      </div>

      {/* Hour rows */}
      <div className="flex flex-1 overflow-y-auto">
        <div className="flex flex-1 flex-col">
          {hours.map((h) => {
            const slotEvents = events.filter(
              (e) => parseInt(e.time.split(":")[0]) === h,
            );
            return (
              <div
                key={h}
                className="flex min-h-[56px] border-b border-[#f7f9fb]"
              >
                <div className="w-20 shrink-0 px-3 py-2 text-[11px] text-[#8796af]">
                  {h}:00 {h < 12 ? "AM" : "PM"}
                </div>
                <div className="flex flex-1 flex-col gap-1 border-l border-[#eff3f8] px-2 py-1">
                  {slotEvents.map((e) => (
                    <div
                      key={e.id}
                      className="flex items-center gap-2 rounded-lg px-3 py-1.5"
                      style={{ backgroundColor: e.colorBg }}
                    >
                      <span
                        className="h-2 w-2 shrink-0 rounded-full"
                        style={{ backgroundColor: e.colorText }}
                      />
                      <span
                        className="text-[12px] font-medium"
                        style={{ color: e.colorText }}
                      >
                        {e.title}
                      </span>
                      <span
                        className="ml-auto text-[11px] opacity-70"
                        style={{ color: e.colorText }}
                      >
                        {e.time}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ── MAIN PAGE ─────────────────────────────────────────────────────────────────

export default function CalendarPage() {
  const today = new Date();
  const [currentYear, setCurrentYear] = useState(today.getFullYear());
  const [currentMonth, setCurrentMonth] = useState(today.getMonth());
  const [view, setView] = useState<CalendarView>("Month");
  const [selectedDate, setSelectedDate] = useState<Date | null>(today);

  // Build mock events once (stable across renders)
  const mockEvents = useMemo(() => buildMockEvents(), []);

  const days = useMemo(
    () => generateMonthGrid(currentYear, currentMonth, mockEvents),
    [currentYear, currentMonth, mockEvents],
  );

  // Split days into 6 weeks (42 days)
  const weeks = useMemo(() => {
    const ws: CalendarDay[][] = [];
    for (let i = 0; i < days.length; i += 7) {
      ws.push(days.slice(i, i + 7));
    }
    return ws;
  }, [days]);

  function prevMonth() {
    if (currentMonth === 0) {
      setCurrentYear((y) => y - 1);
      setCurrentMonth(11);
    } else {
      setCurrentMonth((m) => m - 1);
    }
  }

  function nextMonth() {
    if (currentMonth === 11) {
      setCurrentYear((y) => y + 1);
      setCurrentMonth(0);
    } else {
      setCurrentMonth((m) => m + 1);
    }
  }

  function goToday() {
    setCurrentYear(today.getFullYear());
    setCurrentMonth(today.getMonth());
    setSelectedDate(today);
  }

  const totalEventsThisMonth = days
    .filter((d) => d.isCurrentMonth)
    .reduce((sum, d) => sum + d.events.length, 0);

  return (
    // Figma: outer flex col, gap between header section and calendar body
    <div className="flex h-full flex-col gap-5">
      {/* ── Page Header ───────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-[22px] font-semibold leading-tight text-[#111625]">
            Calendar
          </h1>
          <p className="mt-0.5 text-[13px] text-neutral-500">
            {totalEventsThisMonth} event{totalEventsThisMonth !== 1 ? "s" : ""}{" "}
            this month
          </p>
        </div>

        {/* Add event button */}
        <button className="flex items-center gap-2 rounded-xl bg-[#375dfb] px-4 py-2 text-[13px] font-medium text-white hover:bg-[#2749c2] transition-colors">
          <Plus className="h-4 w-4" strokeWidth={2} />
          Add Event
        </button>
      </div>

      {/* ── Calendar Container ────────────────────────────────────────────── */}
      {/*
       * Figma outer: white bg, cornerRadius 24px, padding 4px
       * Figma inner: #F7F9FB bg, cornerRadius 20px, padding 4px
       */}
      <div className="flex flex-1 flex-col overflow-hidden rounded-3xl bg-white p-1 shadow-sm">
        <div className="flex flex-1 flex-col overflow-hidden rounded-[20px] bg-[#f7f9fb] p-1">
          {/* ── Calendar Header ─────────────────────────────────────────── */}
          {/*
           * Figma: horizontal row with month title (left), nav arrows + view
           * switcher (right). Height approx 56px.
           */}
          <div className="flex shrink-0 items-center justify-between rounded-2xl bg-white px-5 py-3">
            {/* Left: Month+Year title */}
            <h2
              className="text-[22px] font-semibold text-[#111625]"
              style={{ fontFamily: "'Inter Display', Inter, sans-serif" }}
            >
              {MONTH_NAMES[currentMonth]} {currentYear}
            </h2>

            {/* Right: Today button + Nav + View switcher */}
            <div className="flex items-center gap-2">
              {/* Today button */}
              <button
                onClick={goToday}
                className="flex items-center gap-1.5 rounded-lg border border-[#e2e4e9] bg-white px-3 py-1.5 text-[13px] font-medium text-[#111625] hover:bg-[#f7f9fb] transition-colors"
              >
                <CalendarDays
                  className="h-3.5 w-3.5 text-[#596881]"
                  strokeWidth={1.5}
                />
                Today
              </button>

              {/* Divider */}
              <div className="h-5 w-px bg-[#e2e4e9]" />

              {/* Prev / Next — Figma: white button, #E0E4EE border, cornerRadius 8px */}
              <button
                onClick={prevMonth}
                aria-label="Previous month"
                className="flex h-8 w-8 items-center justify-center rounded-lg border border-[#e0e4ee] bg-white text-[#111625] hover:bg-[#f7f9fb] transition-colors"
              >
                <ChevronLeft className="h-4 w-4" strokeWidth={1.5} />
              </button>
              <button
                onClick={nextMonth}
                aria-label="Next month"
                className="flex h-8 w-8 items-center justify-center rounded-lg border border-[#e0e4ee] bg-white text-[#111625] hover:bg-[#f7f9fb] transition-colors"
              >
                <ChevronRight className="h-4 w-4" strokeWidth={1.5} />
              </button>

              {/* Divider */}
              <div className="h-5 w-px bg-[#e2e4e9]" />

              {/* View switcher — Figma: pill group, active tab = white bg + shadow */}
              <div className="flex items-center gap-0.5 rounded-xl bg-[#f7f9fb] p-1">
                {VIEW_OPTIONS.map((v) => (
                  <button
                    key={v}
                    onClick={() => setView(v)}
                    className={cn(
                      "rounded-lg px-3 py-1.5 text-[13px] font-medium transition-all",
                      view === v
                        ? "bg-white text-[#111625] shadow-sm"
                        : "text-[#596881] hover:text-[#111625]",
                    )}
                  >
                    {v}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Gap between header and grid */}
          <div className="h-1" />

          {/* ── Month View ──────────────────────────────────────────────── */}
          {view === "Month" && (
            <div className="flex flex-1 flex-col overflow-hidden">
              {/* Day headers — Figma: #596881, 12px, UPPERCASE tracking-wide */}
              <div className="grid grid-cols-7 px-1">
                {DAY_LABELS.map((label) => (
                  <div
                    key={label}
                    className="py-2 text-center text-[11px] font-semibold uppercase tracking-widest text-[#596881]"
                  >
                    {label}
                  </div>
                ))}
              </div>

              {/* Calendar grid — Figma: gap-1 between cells, vertical flex */}
              <div className="flex flex-1 flex-col gap-1 overflow-y-auto px-1 pb-1">
                {weeks.map((week, wi) => (
                  <div key={wi} className="grid flex-1 grid-cols-7 gap-1">
                    {week.map((day) => (
                      <CalendarCell
                        key={makeKey(day.date)}
                        day={day}
                        isSelected={
                          selectedDate !== null &&
                          makeKey(day.date) === makeKey(selectedDate)
                        }
                        onClick={setSelectedDate}
                      />
                    ))}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── Week View ───────────────────────────────────────────────── */}
          {view === "Week" && (
            <div className="flex flex-1 overflow-hidden p-1">
              <WeekView
                year={currentYear}
                month={currentMonth}
                mockEvents={mockEvents}
              />
            </div>
          )}

          {/* ── Day View ────────────────────────────────────────────────── */}
          {view === "Day" && (
            <div className="flex flex-1 overflow-hidden p-1">
              <DayView mockEvents={mockEvents} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
