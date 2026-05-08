// components/layout/app-sidebar.tsx
"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
  MessageSquare,
  Calendar,
  Folder,
  Plus,
  HelpCircle,
  Settings,
  Bell,
  Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useWorkspaces } from "@/lib/hooks/use-workspaces";
import { useWorkspaceProjects } from "@/lib/hooks/use-projects";
import { useUiStore } from "@/lib/stores/ui-store";
import { CreateProjectDialog } from "@/components/projects/create-project-dialog";

interface NavItem {
  icon: React.ElementType;
  label: string;
  href: string;
}

const menuItems: NavItem[] = [
  { icon: Home, label: "Home", href: "/home" },
  { icon: MessageSquare, label: "Messages", href: "/messages" },
  { icon: Calendar, label: "Calendar", href: "/calendar" },
  { icon: Bell, label: "Notifications", href: "/notifications" },
];

export function AppSidebar() {
  const [createProjectOpen, setCreateProjectOpen] = React.useState(false);
  const pathname = usePathname();
  // BUG FIX: We read sidebarOpen but fix the layout by using width-based transitions
  // instead of translateX. The old approach used `-translate-x-full` which kept the
  // sidebar in the document flow, causing the main content not to expand.
  const sidebarOpen = useUiStore((s) => s.sidebarOpen);

  const {
    workspaces,
    activeWorkspace,
    setCurrentWorkspaceId,
    isLoading: workspacesLoading,
  } = useWorkspaces();

  const { data: projectsData, isLoading: projectsLoading } =
    useWorkspaceProjects({
      workspaceId: activeWorkspace?.id,
      pageSize: 50,
    });

  const projects = projectsData?.items ?? [];

  return (
    /*
     * FIX: Changed from `w-65 transition-transform translate-x / -translate-x-full`
     * to `transition-[width,min-width] w-65 / w-0` so that the element is actually
     * removed from the flex flow when collapsed, allowing the main panel to fill
     * the full viewport width.
     *
     * `overflow-hidden` prevents content from spilling out during the animation.
     * `shrink-0` prevents flex from shrinking the sidebar unexpectedly.
     */
    <aside
      className={cn(
        "flex h-screen flex-col bg-white shrink-0 overflow-hidden transition-[width,min-width] duration-300 ease-in-out",
        sidebarOpen ? "w-[260px] min-w-[260px]" : "w-0 min-w-0",
      )}
    >
      {/* Inner wrapper keeps content at full width so text doesn't wrap during animation */}
      <div className="flex h-full w-[260px] flex-col">
        {/* ── LOGO ── */}
        <div className="flex h-14 shrink-0 items-center gap-3 px-4">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-[#375dfb] to-[#6a8ffc]">
            <Sparkles className="h-4 w-4 text-white" />
          </div>
          <span className="text-[20px] font-semibold tracking-tight text-neutral-900">
            Slender
          </span>
        </div>

        {/* ── SCROLLABLE CONTENT ── */}
        <div className="flex flex-1 flex-col overflow-y-auto px-4 py-4 gap-5">
          {/* Workspace Selector */}
          <div>
            <div className="mb-2 text-[10px] font-medium uppercase tracking-widest text-neutral-400">
              Workspace
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex h-12 w-full items-center gap-3 rounded-xl border border-neutral-200 bg-white px-3 text-left hover:bg-neutral-50 transition-colors">
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-orange-500">
                    <span className="text-[13px] font-semibold text-white">
                      {activeWorkspace?.name?.charAt(0).toUpperCase() ?? "W"}
                    </span>
                  </div>
                  <div className="flex min-w-0 flex-1 flex-col">
                    <span className="truncate text-[13px] font-medium text-neutral-900">
                      {workspacesLoading
                        ? "Loading..."
                        : (activeWorkspace?.name ?? "Select Workspace")}
                    </span>
                    <span className="text-[11px] text-neutral-400">
                      Free plan
                    </span>
                  </div>
                  <svg
                    className="h-4 w-4 shrink-0 text-neutral-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M8 9l4-4 4 4m0 6l-4 4-4-4"
                    />
                  </svg>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-[228px]">
                {workspaces.map((ws) => (
                  <DropdownMenuItem
                    key={ws.id}
                    onClick={() => setCurrentWorkspaceId(ws.id)}
                    className="gap-2"
                  >
                    <div className="flex h-6 w-6 items-center justify-center rounded bg-orange-500 text-[11px] font-semibold text-white">
                      {ws.name.charAt(0).toUpperCase()}
                    </div>
                    <span className="truncate text-[13px]">{ws.name}</span>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Main Nav */}
          <div>
            <div className="mb-1.5 text-[10px] font-medium uppercase tracking-widest text-neutral-400">
              Menu
            </div>
            <nav className="flex flex-col gap-0.5">
              {menuItems.map((item) => {
                const isActive = pathname === item.href;
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "group flex h-9 items-center gap-3 rounded-lg px-3 text-[13px] font-medium transition-colors",
                      isActive
                        ? "bg-[#ebefff] text-[#375dfb]"
                        : "text-neutral-500 hover:bg-neutral-100 hover:text-neutral-900",
                    )}
                  >
                    <Icon
                      className={cn(
                        "h-4 w-4 shrink-0 transition-colors",
                        isActive
                          ? "text-[#375dfb]"
                          : "text-neutral-400 group-hover:text-neutral-700",
                      )}
                      strokeWidth={isActive ? 2 : 1.5}
                    />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* Projects Section */}
          <div className="flex flex-1 flex-col">
            <div className="mb-1.5 flex items-center justify-between">
              <Link
                href="/projects"
                className="text-[10px] font-medium uppercase tracking-widest text-neutral-400 hover:text-neutral-600 transition-colors"
              >
                Projects
              </Link>
              <Button
                variant="ghost"
                size="icon"
                className="h-5 w-5 text-neutral-400 hover:text-neutral-600"
                onClick={() => setCreateProjectOpen(true)}
                aria-label="New project"
              >
                <Plus className="h-3.5 w-3.5" />
              </Button>
            </div>
            <nav className="flex flex-col gap-0.5">
              {projectsLoading && (
                <div className="px-3 py-2 text-[12px] text-neutral-400">
                  Loading…
                </div>
              )}
              {!projectsLoading &&
                projects.map((project) => {
                  const isActive = pathname === `/projects/${project.id}`;
                  return (
                    <Link
                      key={project.id}
                      href={`/projects/${project.id}`}
                      className={cn(
                        "flex h-9 items-center gap-3 rounded-lg px-3 text-[13px] transition-colors",
                        isActive
                          ? "bg-neutral-100 font-medium text-neutral-900"
                          : "text-neutral-600 hover:bg-neutral-50 hover:text-neutral-900",
                      )}
                    >
                      <Folder
                        className="h-4 w-4 shrink-0 text-neutral-400"
                        strokeWidth={1.5}
                      />
                      <span className="truncate">{project.name}</span>
                    </Link>
                  );
                })}
              {!projectsLoading && !projects.length && activeWorkspace && (
                <button
                  onClick={() => setCreateProjectOpen(true)}
                  className="flex h-9 items-center gap-3 rounded-lg px-3 text-[12px] text-neutral-400 hover:bg-neutral-50 hover:text-neutral-600 transition-colors text-left"
                >
                  <Plus className="h-3.5 w-3.5 shrink-0" strokeWidth={1.5} />
                  New project
                </button>
              )}
            </nav>
          </div>

          {/* Other Section */}
          <div>
            <div className="mb-1.5 text-[10px] font-medium uppercase tracking-widest text-neutral-400">
              Other
            </div>
            <nav className="flex flex-col gap-0.5">
              <Link
                href="/help"
                className="flex h-9 items-center gap-3 rounded-lg px-3 text-[13px] text-neutral-500 transition-colors hover:bg-neutral-50 hover:text-neutral-900"
              >
                <HelpCircle
                  className="h-4 w-4 shrink-0 text-neutral-400"
                  strokeWidth={1.5}
                />
                <span>Help Center</span>
              </Link>
              <Link
                href="/settings"
                className="flex h-9 items-center gap-3 rounded-lg px-3 text-[13px] text-neutral-500 transition-colors hover:bg-neutral-50 hover:text-neutral-900"
              >
                <Settings
                  className="h-4 w-4 shrink-0 text-neutral-400"
                  strokeWidth={1.5}
                />
                <span>Settings</span>
              </Link>
            </nav>
          </div>

          {/* Upgrade Banner */}
          <div className="shrink-0 overflow-hidden rounded-xl bg-gradient-to-br from-[#375dfb] to-[#6a8ffc] p-4 text-white shadow-md shadow-blue-200">
            <div className="mb-0.5 text-[13px] font-semibold">
              Upgrade to Pro
            </div>
            <div className="mb-3 text-[11px] text-blue-100">
              15 days left in your trial
            </div>
            <button className="flex w-full items-center justify-center gap-2 rounded-lg bg-white/20 py-1.5 text-[12px] font-medium text-white backdrop-blur-sm hover:bg-white/30 transition-colors">
              <Sparkles className="h-3.5 w-3.5" />
              Upgrade
            </button>
          </div>
        </div>
      </div>

      <CreateProjectDialog
        open={createProjectOpen}
        onOpenChange={setCreateProjectOpen}
        workspaceId={activeWorkspace?.id}
      />
    </aside>
  );
}
