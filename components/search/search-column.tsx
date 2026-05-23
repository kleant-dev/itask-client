"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import {
  Search,
  Folder,
  CheckSquare,
  X,
  ExternalLink,
  Link,
  ArrowRight,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { searchApi } from "@/lib/api/search";
import { useUiStore } from "@/lib/stores/ui-store";
import type { SearchResultModel } from "@/types/models";
import { formatNotificationTime } from "@/lib/utils/notifications";

type ResultType = "folder" | "task" | "document";

interface DisplayResult {
  id: string;
  type: ResultType;
  title: string;
  breadcrumb: string[];
  time: string;
  projectId?: string | null;
}

function toDisplayResult(item: SearchResultModel): DisplayResult {
  const type: ResultType =
    item.type === "project" ? "folder" : item.type === "task" ? "task" : "document";
  const breadcrumb =
    item.type === "project"
      ? ["Project", item.subtitle ?? "Workspace"]
      : ["Task", item.subtitle ?? "Project"];

  return {
    id: item.id,
    type,
    title: item.title,
    breadcrumb,
    time: item.updatedAtUtc
      ? formatNotificationTime(item.updatedAtUtc)
      : "",
    projectId: item.projectId,
  };
}

function TypeIcon({ type }: { type: ResultType }) {
  const cls = "h-5 w-5 text-[#596881]";
  if (type === "folder") return <Folder className={cls} strokeWidth={1.5} />;
  if (type === "task") return <CheckSquare className={cls} strokeWidth={1.5} />;
  return <CheckSquare className={cls} strokeWidth={1.5} />;
}

interface SearchColumnProps {
  onClose: () => void;
}

export function SearchColumn({ onClose }: SearchColumnProps) {
  const router = useRouter();
  const workspaceId = useUiStore((s) => s.currentWorkspaceId);
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  useEffect(() => {
    const t = setTimeout(() => setDebouncedQuery(query.trim()), 300);
    return () => clearTimeout(t);
  }, [query]);

  const { data, isLoading, isError } = useQuery({
    queryKey: ["workspace-search", workspaceId, debouncedQuery],
    queryFn: () =>
      searchApi.searchWorkspace(workspaceId!, { q: debouncedQuery, limit: 20 }),
    enabled: !!workspaceId && debouncedQuery.length >= 1,
  });

  const results: DisplayResult[] = useMemo(() => {
    if (!debouncedQuery) return [];
    return (data?.results ?? []).map(toDisplayResult);
  }, [data, debouncedQuery]);

  const label = debouncedQuery ? "Results" : "Type to search";

  function navigateTo(item: DisplayResult) {
    onClose();
    if (item.type === "folder") {
      router.push(`/projects/${item.id}`);
    } else if (item.projectId) {
      router.push(`/projects/${item.projectId}`);
    }
  }

  return (
    <div className="flex w-150 shrink-0 flex-col min-h-0">
      <div className="flex h-18 shrink-0 items-center gap-3 border-b border-neutral-100 px-6">
        <Search className="h-5 w-5 shrink-0 text-[#596881]" strokeWidth={1.5} />
        <input
          autoFocus
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search tasks and projects…"
          className="flex-1 bg-transparent text-[18px] font-medium text-[#111625] placeholder:text-[#596881] outline-none"
        />
        {query ? (
          <button
            onClick={() => setQuery("")}
            className="text-[#8796af] hover:text-neutral-600 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        ) : (
          <button
            onClick={onClose}
            className="text-[#8796af] hover:text-neutral-600 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      <div className="flex flex-1 flex-col overflow-y-auto px-6 py-4 min-h-0">
        <p className="mb-2 text-[12px] text-[#596881] shrink-0">{label}</p>

        {!workspaceId && (
          <p className="text-[13px] text-neutral-400">Select a workspace first.</p>
        )}

        {workspaceId && debouncedQuery && isLoading && (
          <p className="text-[13px] text-neutral-400">Searching…</p>
        )}

        {workspaceId && debouncedQuery && isError && (
          <p className="text-[13px] text-red-500">Search failed. Try again.</p>
        )}

        {workspaceId && debouncedQuery && !isLoading && !isError && results.length === 0 && (
          <p className="text-[13px] text-neutral-400">No results found.</p>
        )}

        <div className="flex flex-col">
          {results.map((item) => (
            <div
              key={`${item.type}-${item.id}`}
              role="button"
              tabIndex={0}
              onClick={() => navigateTo(item)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  navigateTo(item);
                }
              }}
              onMouseEnter={() => setHoveredId(item.id)}
              onMouseLeave={() => setHoveredId(null)}
              className={cn(
                "group flex items-center gap-4 rounded-xl px-3 py-3 transition-colors cursor-pointer",
                hoveredId === item.id ? "bg-[#f7f9fb]" : "hover:bg-[#f7f9fb]",
              )}
            >
              <div className="flex h-6 w-6 shrink-0 items-center justify-center">
                <TypeIcon type={item.type} />
              </div>

              <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                <span className="text-[15px] font-medium text-[#111625] truncate">
                  {item.title}
                </span>
                <div className="flex flex-wrap items-center gap-1 text-[12px] text-[#596881]">
                  {item.breadcrumb.map((crumb, i) => (
                    <span key={i} className="flex items-center gap-1">
                      {i > 0 && <span className="text-[#dee4ee]">•</span>}
                      {crumb}
                    </span>
                  ))}
                  {item.time && (
                    <>
                      <span className="text-[#dee4ee]">•</span>
                      <span>{item.time}</span>
                    </>
                  )}
                </div>
              </div>

              <div
                className={cn(
                  "flex shrink-0 items-center gap-1 transition-opacity",
                  hoveredId === item.id ? "opacity-100" : "opacity-0",
                )}
              >
                <ArrowRight className="h-4 w-4 text-[#596881]" strokeWidth={1.5} />
              </div>
            </div>
          ))}
        </div>

        {!debouncedQuery && workspaceId && (
          <p className="mt-4 text-[13px] text-neutral-400">
            Search across tasks and projects in your workspace.
          </p>
        )}
      </div>

      <div className="flex h-12 shrink-0 items-center gap-4 border-t border-neutral-100 px-6 text-[12px] text-[#8796af]">
        <span className="flex items-center gap-1">
          <kbd className="rounded border border-neutral-200 bg-[#f7f9fb] px-1.5 py-0.5 font-mono text-[10px]">
            ↵
          </kbd>
          to open
        </span>
        <span className="flex items-center gap-1">
          <kbd className="rounded border border-neutral-200 bg-[#f7f9fb] px-1.5 py-0.5 font-mono text-[10px]">
            esc
          </kbd>
          to close
        </span>
      </div>
    </div>
  );
}
