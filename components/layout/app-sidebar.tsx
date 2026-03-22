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
  ChevronDown,
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

const menuItems = [
  { icon: Home, label: "Home", href: "/home" },
  { icon: MessageSquare, label: "Message", href: "/messages" },
  { icon: Calendar, label: "Calendar", href: "/calendar" },
];

export function AppSidebar() {
  const [createProjectOpen, setCreateProjectOpen] = React.useState(false);
  const pathname = usePathname();
  const sidebarOpen = useUiStore((s) => s.sidebarOpen);
  const toggleSidebar = useUiStore((s) => s.toggleSidebar);

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
    // 260px width, white background, full height
    <aside
      className={cn(
        "flex h-screen w-65 flex-col bg-white transition-transform",
        sidebarOpen ? "translate-x-0" : "-translate-x-full",
      )}
    >
      {/* Logo section: 56px height */}
      <div className="flex h-14 items-center gap-3 px-4">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary-500">
          <Sparkles className="h-5 w-5 text-white" />
        </div>
        <span className="text-[24px] font-medium text-neutral-900">
          Slender
        </span>
      </div>

      {/* Scrollable content */}
      <div className="flex flex-1 flex-col overflow-y-auto px-4 py-4">
        {/* Workspace Selector: 76px height total */}
        <div className="mb-4">
          <div className="mb-2 text-subheading-xsmall text-neutral-400">
            WORKSPACE
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                className="h-13 w-full justify-between rounded-lg bg-white"
              >
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-lg bg-orange-500 flex items-center justify-center">
                    <span className="text-white text-sm font-semibold">
                      {activeWorkspace?.name?.charAt(0).toUpperCase() ?? "W"}
                    </span>
                  </div>
                  <span className="text-p-small text-neutral-900">
                    {activeWorkspace?.name ?? "Loading workspaces..."}
                  </span>
                </div>
                <ChevronDown className="h-4 w-4 text-neutral-500" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-57">
              {workspacesLoading && (
                <DropdownMenuItem disabled>Loading...</DropdownMenuItem>
              )}
              {!workspacesLoading &&
                workspaces.map((workspace) => (
                  <DropdownMenuItem
                    key={workspace.id}
                    onClick={() => setCurrentWorkspaceId(workspace.id)}
                  >
                    <div className="flex items-center gap-2">
                      <div className="h-6 w-6 rounded bg-orange-500 flex items-center justify-center">
                        <span className="text-white text-xs font-semibold">
                          {workspace.name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <span className="text-label-medium text-neutral-900">
                        {workspace.name}
                      </span>
                    </div>
                  </DropdownMenuItem>
                ))}
              <DropdownMenuItem>
                <Plus className="mr-2 h-4 w-4" />
                <span>Create Workspace</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Menu Section */}
        <div className="mb-4">
          <div className="mb-2 text-subheading-xsmall text-neutral-400">
            MENU
          </div>
          <nav className="space-y-0.5">
            {menuItems.map((item) => {
              const isActive = pathname === item.href;
              const Icon = item.icon;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex h-8.5 items-center gap-3 rounded-lg px-3 transition-colors",
                    isActive
                      ? "bg-white text-neutral-900"
                      : "text-neutral-400 hover:bg-neutral-50",
                  )}
                >
                  <Icon className="h-5 w-5" />
                  <span className="text-label-small">{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Projects Section */}
        <div className="flex-1 mb-4">
          <div className="flex items-center justify-between mb-2">
            <Link
              href="/projects"
              className="text-subheading-xsmall text-neutral-400 hover:text-neutral-600"
            >
              PROJECTS
            </Link>
            <Button
              variant="ghost"
              size="icon"
              className="h-5 w-5 text-neutral-500 hover:text-neutral-700"
              onClick={() => setCreateProjectOpen(true)}
              aria-label="New project"
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
          <nav className="space-y-0.5">
            {projectsLoading && (
              <div className="text-p-small text-neutral-500 px-3 py-1.5">
                Loading projects...
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
                      "flex h-8.5 items-center gap-3 rounded-lg px-3 text-p-small transition-colors",
                      isActive
                        ? "bg-neutral-50 text-neutral-900 font-medium"
                        : "text-neutral-700 hover:bg-neutral-50",
                    )}
                  >
                    <Folder
                      className="h-5 w-5 text-neutral-500"
                      // color could come from project.color when backend supports it
                    />
                    <span>{project.name}</span>
                  </Link>
                );
              })}
            {!projectsLoading && !projects.length && activeWorkspace && (
              <div className="text-p-xsmall text-neutral-500 px-3 py-1.5">
                No projects yet in this workspace.
              </div>
            )}
          </nav>
        </div>

        {/* Other Section */}
        <div className="mb-4">
          <div className="mb-2 text-label-xsmall text-[#8796AF]">OTHER</div>
          <nav className="space-y-0.5">
            <Link
              href="/help"
              className="flex h-8.5 items-center gap-3 rounded-lg px-3 text-p-small text-neutral-700 transition-colors hover:bg-neutral-50"
            >
              <HelpCircle className="h-5 w-5" />
              <span>Help Center</span>
            </Link>
            <Link
              href="/settings"
              className="flex h-8.5 items-center gap-3 rounded-lg px-3 text-p-small text-neutral-700 transition-colors hover:bg-neutral-50"
            >
              <Settings className="h-5 w-5" />
              <span>Settings</span>
            </Link>
          </nav>
        </div>

        {/* Upgrade to Pro Banner */}
        <div className="rounded-lg border border-neutral-200 bg-white p-4 text-center">
          <div className="mb-1 text-label-medium text-neutral-900">
            Upgrade to Pro
          </div>
          <div className="mb-3 text-p-xsmall text-neutral-500">
            15 days left in your trial
          </div>
          <Button className="w-full" size="sm">
            <Sparkles className="mr-2 h-4 w-4" />
            Upgrade
          </Button>
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
