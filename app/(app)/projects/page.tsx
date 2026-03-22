"use client";

import { useState } from "react";
import Link from "next/link";
import { Folder, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CreateProjectDialog } from "@/components/projects/create-project-dialog";
import { useWorkspaces } from "@/lib/hooks/use-workspaces";
import { useWorkspaceProjects } from "@/lib/hooks/use-projects";
import { cn } from "@/lib/utils";

export default function ProjectsPage() {
  const [createOpen, setCreateOpen] = useState(false);
  const { activeWorkspace } = useWorkspaces();
  const { data, isLoading } = useWorkspaceProjects({
    workspaceId: activeWorkspace?.id,
    pageSize: 100,
  });

  const projects = data?.items ?? [];

  return (
    <div>
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-[26px] font-semibold text-[#111625]">Projects</h1>
          <p className="mt-1 text-[14px] text-[#596881]">
            Open a project to manage tasks on a board, list, or timeline.
          </p>
        </div>
        <Button
          className="h-9 gap-2 rounded-lg bg-[#266df0] hover:bg-[#1a5dd4]"
          onClick={() => setCreateOpen(true)}
        >
          <Plus className="h-4 w-4" />
          New project
        </Button>
      </div>

      {isLoading && (
        <p className="text-p-small text-neutral-500">Loading projects…</p>
      )}

      {!isLoading && !projects.length && (
        <div className="flex min-h-[200px] flex-col items-center justify-center rounded-xl border border-dashed border-neutral-200 bg-[#f7f9fb] px-6 py-12 text-center">
          <Folder className="mb-3 h-10 w-10 text-[#8796af]" />
          <p className="text-[15px] font-medium text-[#111625]">
            No projects yet
          </p>
          <p className="mt-1 max-w-md text-[14px] text-[#596881]">
            Create a project to organize tasks for your workspace.
          </p>
          <Button className="mt-4" onClick={() => setCreateOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Create project
          </Button>
        </div>
      )}

      {!isLoading && projects.length > 0 && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {projects.map((project) => (
            <Link
              key={project.id}
              href={`/projects/${project.id}`}
              className={cn(
                "group rounded-xl border border-neutral-200 bg-white p-4 shadow-sm transition-shadow",
                "hover:border-neutral-300 hover:shadow-md",
              )}
            >
              <div className="flex items-start gap-3">
                <div
                  className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#f7f9fb]"
                  style={
                    project.color
                      ? { backgroundColor: `${project.color}22` }
                      : undefined
                  }
                >
                  <Folder
                    className="h-5 w-5 text-[#596881]"
                    style={project.color ? { color: project.color } : undefined}
                  />
                </div>
                <div className="min-w-0 flex-1">
                  <h2 className="text-[15px] font-semibold text-[#111625] group-hover:text-[#266df0]">
                    {project.name}
                  </h2>
                  {project.description && (
                    <p className="mt-1 line-clamp-2 text-[13px] text-[#596881]">
                      {project.description}
                    </p>
                  )}
                  <p className="mt-2 text-[11px] font-medium uppercase tracking-wide text-[#8796af]">
                    {project.status}
                  </p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}

      <CreateProjectDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        workspaceId={activeWorkspace?.id}
      />
    </div>
  );
}
