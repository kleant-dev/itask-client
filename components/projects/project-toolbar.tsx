"use client";

import Link from "next/link";
import {
  ChevronRight,
  Filter,
  LayoutGrid,
  List,
  Share2,
  GanttChart,
} from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import type { TaskPriority } from "@/types/models";

export type ProjectViewMode = "board" | "list" | "timeline";

interface ProjectToolbarProps {
  projectName: string;
  view: ProjectViewMode;
  onViewChange: (v: ProjectViewMode) => void;
  priorityFilter: TaskPriority | "all";
  onPriorityFilterChange: (p: TaskPriority | "all") => void;
  onNewTask: () => void;
  onShare?: () => void;
}

export function ProjectToolbar({
  projectName,
  view,
  onViewChange,
  priorityFilter,
  onPriorityFilterChange,
  onNewTask,
  onShare,
}: ProjectToolbarProps) {
  const views: { id: ProjectViewMode; label: string; icon: typeof LayoutGrid }[] =
    [
      { id: "board", label: "Board", icon: LayoutGrid },
      { id: "list", label: "List", icon: List },
      { id: "timeline", label: "Timeline", icon: GanttChart },
    ];

  return (
    <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
      <div>
        <div className="flex items-center gap-1 text-[14px] text-[#596881]">
          <Link href="/projects" className="hover:text-[#111625]">
            Projects
          </Link>
          <ChevronRight className="h-4 w-4 shrink-0" />
          <span className="font-medium text-[#111625]">{projectName}</span>
        </div>
        <h1 className="mt-1 text-[26px] font-semibold leading-tight text-[#111625]">
          {projectName}
        </h1>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <div className="flex -space-x-2">
          <Avatar className="h-8 w-8 border-2 border-white">
            <AvatarFallback className="bg-[#266df0] text-xs font-semibold text-white">
              T
            </AvatarFallback>
          </Avatar>
          <Avatar className="h-8 w-8 border-2 border-white">
            <AvatarFallback className="bg-emerald-500 text-[10px] font-semibold text-white">
              +2
            </AvatarFallback>
          </Avatar>
        </div>

        <Button
          variant="outline"
          size="sm"
          className="h-8 gap-1.5 rounded-lg border-neutral-200 text-[13px]"
          onClick={onShare}
        >
          <Share2 className="h-3.5 w-3.5" />
          Share
        </Button>

        <div className="flex rounded-lg border border-neutral-200 bg-[#f7f9fb] p-0.5">
          {views.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              type="button"
              onClick={() => onViewChange(id)}
              className={cn(
                "flex h-8 items-center gap-1.5 rounded-md px-2.5 text-[13px] font-medium transition-colors",
                view === id
                  ? "bg-white text-[#111625] shadow-sm"
                  : "text-[#596881] hover:text-[#111625]",
              )}
            >
              <Icon className="h-3.5 w-3.5" />
              {label}
            </button>
          ))}
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className="h-8 gap-1.5 rounded-lg border-neutral-200 text-[13px]"
            >
              <Filter className="h-3.5 w-3.5" />
              Filter
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuRadioGroup
              value={priorityFilter}
              onValueChange={(v) =>
                onPriorityFilterChange(v as TaskPriority | "all")
              }
            >
              <DropdownMenuRadioItem value="all">
                All priorities
              </DropdownMenuRadioItem>
              <DropdownMenuRadioItem value="High">High</DropdownMenuRadioItem>
              <DropdownMenuRadioItem value="Medium">
                Medium
              </DropdownMenuRadioItem>
              <DropdownMenuRadioItem value="Low">Low</DropdownMenuRadioItem>
              <DropdownMenuRadioItem value="Critical">
                Critical
              </DropdownMenuRadioItem>
            </DropdownMenuRadioGroup>
          </DropdownMenuContent>
        </DropdownMenu>

        <Button
          size="sm"
          className="h-8 rounded-lg bg-[#266df0] px-3 text-[13px] hover:bg-[#1a5dd4]"
          onClick={onNewTask}
        >
          New Task
        </Button>
      </div>
    </div>
  );
}
