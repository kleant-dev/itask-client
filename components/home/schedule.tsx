// components/home/schedule.tsx
"use client";

import { useMemo, useState } from "react";
import {
  Plus,
  MoreHorizontal,
  ChevronLeft,
  ChevronRight,
  CalendarDays,
  Users,
  Settings,
  Sparkles,
  Calendar,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { EmptyState } from "./empty-state";
import { CalendarDatePicker } from "./calendar-date-picker";
import { AddScheduleModal } from "./schedule-modal";
import { calendarEventsApi } from "@/lib/api/calendar-events";
import { useUiStore } from "@/lib/stores/ui-store";
import { useQuery } from "@tanstack/react-query";

interface ScheduleItem {
  icon: React.ElementType;
  title: string;
  time: string;
}

export function Schedule() {
  const workspaceId = useUiStore((s) => s.currentWorkspaceId);
  const [selectedDate, setSelectedDate] = useState<Date | null>(new Date());
  const [showCalendar, setShowCalendar] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [expanded, setExpanded] = useState<number | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ["calendar-events", workspaceId],
    queryFn: async () => {
      if (!workspaceId) return [];
      return calendarEventsApi.getByWorkspace(workspaceId);
    },
    enabled: !!workspaceId,
  });

  const scheduleItems: ScheduleItem[] = useMemo(() => {
    if (!data || !selectedDate) return [];
    const dayStart = new Date(
      selectedDate.getFullYear(),
      selectedDate.getMonth(),
      selectedDate.getDate(),
    );
    const dayEnd = new Date(dayStart);
    dayEnd.setDate(dayEnd.getDate() + 1);

    return data
      .filter((event) => {
        const starts = new Date(event.startsAtUtc);
        return starts >= dayStart && starts < dayEnd;
      })
      .sort(
        (a, b) =>
          new Date(a.startsAtUtc).getTime() -
          new Date(b.startsAtUtc).getTime(),
      )
      .map((event) => {
        const starts = new Date(event.startsAtUtc);
        const ends = new Date(event.endsAtUtc);
        const time = `${starts.toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        })} - ${ends.toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        })}`;
        let icon = CalendarDays;
        if (event.scheduleType === "Meeting") icon = Users;
        else if (event.scheduleType === "Setup") icon = Settings;
        else if (event.scheduleType === "Brainstorm") icon = Sparkles;
        return {
          icon,
          title: event.title,
          time,
        };
      });
  }, [data, selectedDate]);

  function handleDateApply(start: Date, end?: Date) {
    setSelectedDate(start);
    setShowCalendar(false);
  }

  return (
    <>
      <div className="flex flex-col rounded-lg border border-neutral-200 bg-white">
        {/* Header */}
        <div className="flex items-start justify-between p-5 pb-3">
          <div>
            <h3 className="text-label-large font-semibold text-neutral-900">
              Schedule
            </h3>
            <p className="mt-0.5 text-p-small text-neutral-500">
              Track your meetings, assignments, etc.
            </p>
          </div>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => setShowAddModal(true)} // ADDED: click handler
            >
              <Plus className="h-4 w-4 text-neutral-500" />
            </Button>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <MoreHorizontal className="h-4 w-4 text-neutral-500" />
            </Button>
          </div>
        </div>

        {/* Date Navigation */}
        <div className="flex items-center justify-between border-b border-neutral-100 px-5 pb-3">
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" className="h-7 w-7">
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="text-label-medium font-medium text-neutral-900">
              {selectedDate?.toLocaleDateString(undefined, {
                weekday: "short",
                day: "numeric",
                month: "short",
                year: "numeric",
              })}
            </span>
            <Button variant="ghost" size="icon" className="h-7 w-7">
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
          <div className="relative">
            <button
              onClick={() => setShowCalendar(!showCalendar)}
              className="flex items-center gap-2 rounded-lg hover:bg-neutral-50 px-2 py-1 transition-colors"
            >
              <span className="text-[13px] font-medium text-[#111625]">
                Today
              </span>
              <Calendar className="h-4 w-4 text-[#596881]" strokeWidth={1.5} />
            </button>

            {showCalendar && (
              <div className="absolute right-0 top-full z-20 mt-2">
                <CalendarDatePicker
                  onCancel={() => setShowCalendar(false)}
                  onApply={handleDateApply}
                />
              </div>
            )}
          </div>
        </div>

        {/* Schedule Items */}
        {isLoading ? (
          <div className="py-10 text-center text-p-small text-neutral-500">
            Loading schedule...
          </div>
        ) : scheduleItems.length === 0 ? (
          <EmptyState
            message="No events scheduled for today."
            illustration={<AddEventIllustration />}
            className="py-10"
          />
        ) : (
          <div className="flex flex-col divide-y divide-neutral-100">
            {scheduleItems.map((item, i) => {
              const Icon = item.icon;
              const isExpanded = expanded === i;
              return (
                <button
                  key={i}
                  onClick={() => setExpanded(isExpanded ? null : i)}
                  className="flex items-center justify-between px-5 py-3.5 text-left hover:bg-neutral-50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <Icon
                      className="h-4 w-4 text-neutral-400"
                      strokeWidth={1.5}
                    />
                    <span className="text-p-small text-neutral-900">
                      {item.title}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-label-small text-neutral-500">
                      {item.time}
                    </span>
                    <ChevronRight
                      className={`h-4 w-4 text-neutral-400 transition-transform ${isExpanded ? "rotate-90" : ""}`}
                    />
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>
      <AddScheduleModal open={showAddModal} onOpenChange={setShowAddModal} />
    </>
  );
}

function AddEventIllustration() {
  return (
    <svg viewBox="0 0 150 154" fill="none" className="h-full w-full opacity-60">
      <rect x="20" y="30" width="110" height="100" rx="8" fill="#e9f0fe" />
      <rect
        x="20"
        y="30"
        width="110"
        height="28"
        rx="8"
        fill="#266df0"
        opacity="0.2"
      />
      <rect x="50" y="10" width="8" height="24" rx="4" fill="#8796af" />
      <rect x="92" y="10" width="8" height="24" rx="4" fill="#8796af" />
      <rect
        x="35"
        y="74"
        width="30"
        height="8"
        rx="4"
        fill="#266df0"
        opacity="0.3"
      />
      <rect
        x="35"
        y="90"
        width="50"
        height="8"
        rx="4"
        fill="#266df0"
        opacity="0.2"
      />
      <circle cx="110" cy="110" r="18" fill="#266df0" />
      <path
        d="M103 110h14M110 103v14"
        stroke="white"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
    </svg>
  );
}
