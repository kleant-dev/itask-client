"use client";

import { useState } from "react";
import {
  Search,
  Folder,
  CheckSquare,
  FileText,
  X,
  ExternalLink,
  Link,
  ArrowRight,
} from "lucide-react";
import { cn } from "@/lib/utils";

type ResultType = "folder" | "task" | "document";

interface SearchResult {
  id: string;
  type: ResultType;
  title: string;
  breadcrumb: string[];
  time: string;
}

const recentItems: SearchResult[] = [
  {
    id: "1",
    type: "folder",
    title: "User Testing",
    breadcrumb: ["Research", "Taskly"],
    time: "10 minutes ago",
  },
  {
    id: "2",
    type: "folder",
    title: "Product Brief",
    breadcrumb: ["Folder", "Taskly"],
    time: "20 minutes ago",
  },
  {
    id: "3",
    type: "document",
    title: "Design Review",
    breadcrumb: ["Document", "Taskly"],
    time: "30 minutes ago",
  },
  {
    id: "4",
    type: "task",
    title: "Taskly Brief",
    breadcrumb: ["Tasks", "Eventora"],
    time: "45 minutes ago",
  },
  {
    id: "5",
    type: "task",
    title: "Design Review",
    breadcrumb: ["Tasks", "CreativeHub"],
    time: "5 hours ago",
  },
  {
    id: "6",
    type: "task",
    title: "Sprint Planning",
    breadcrumb: ["Tasks", "AgileTools"],
    time: "2 days ago",
  },
  {
    id: "7",
    type: "document",
    title: "Taskly Brief",
    breadcrumb: ["Document", "Taskly"],
    time: "2 days ago",
  },
  {
    id: "8",
    type: "task",
    title: "Client Meeting",
    breadcrumb: ["Tasks", "Zoom"],
    time: "3 days ago",
  },
];

const searchResults: SearchResult[] = [
  {
    id: "2",
    type: "folder",
    title: "Product Brief",
    breadcrumb: ["Folder", "Taskly"],
    time: "20 minutes ago",
  },
  {
    id: "4",
    type: "task",
    title: "Taskly Brief",
    breadcrumb: ["Tasks", "Eventora"],
    time: "45 minutes ago",
  },
  {
    id: "7",
    type: "document",
    title: "Qwicky Brief",
    breadcrumb: ["Document", "Qwicky"],
    time: "2 days ago",
  },
];

function TypeIcon({ type }: { type: ResultType }) {
  const cls = "h-5 w-5 text-[#596881]";
  if (type === "folder") return <Folder className={cls} strokeWidth={1.5} />;
  if (type === "task") return <CheckSquare className={cls} strokeWidth={1.5} />;
  return <FileText className={cls} strokeWidth={1.5} />;
}

interface SearchColumnProps {
  onClose: () => void;
}

export function SearchColumn({ onClose }: SearchColumnProps) {
  const [query, setQuery] = useState("");
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  const results = query.trim()
    ? searchResults.filter((r) =>
        r.title.toLowerCase().includes(query.toLowerCase()),
      )
    : recentItems;

  const label = query.trim() ? "Results" : "Recently opened";

  return (
    <div className="flex w-150 shrink-0 flex-col min-h-0">
      {/* ── Search input (fixed height) ── */}
      <div className="flex h-18 shrink-0 items-center gap-3 border-b border-neutral-100 px-6">
        <Search className="h-5 w-5 shrink-0 text-[#596881]" strokeWidth={1.5} />
        <input
          autoFocus
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search something..."
          className="
            flex-1 bg-transparent text-[18px] font-medium
            text-[#111625] placeholder:text-[#596881] outline-none
          "
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

      {/* ── Results (scrollable) ── */}
      <div className="flex flex-1 flex-col overflow-y-auto px-6 py-4 min-h-0">
        <p className="mb-2 text-[12px] text-[#596881] shrink-0">{label}</p>

        <div className="flex flex-col">
          {results.map((item) => (
            <div
              key={item.id}
              onMouseEnter={() => setHoveredId(item.id)}
              onMouseLeave={() => setHoveredId(null)}
              className={cn(
                "group flex items-center gap-4 rounded-xl px-3 py-3 transition-colors cursor-pointer",
                hoveredId === item.id ? "bg-[#f7f9fb]" : "hover:bg-[#f7f9fb]",
              )}
            >
              {/* Type icon */}
              <div className="flex h-6 w-6 shrink-0 items-center justify-center">
                <TypeIcon type={item.type} />
              </div>

              {/* Text */}
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
                  <span className="text-[#dee4ee]">•</span>
                  <span>{item.time}</span>
                </div>
              </div>

              {/* Action buttons — visible on hover */}
              <div
                className={cn(
                  "flex items-center gap-1 shrink-0 transition-opacity",
                  hoveredId === item.id ? "opacity-100" : "opacity-0",
                )}
              >
                {[
                  {
                    icon: <ExternalLink className="h-3.5 w-3.5" />,
                    label: "Open",
                  },
                  {
                    icon: <Link className="h-3.5 w-3.5" />,
                    label: "Copy link",
                  },
                  {
                    icon: <ArrowRight className="h-3.5 w-3.5" />,
                    label: "Navigate",
                  },
                ].map((action) => (
                  <button
                    key={action.label}
                    title={action.label}
                    className="
                      flex h-8 w-8 items-center justify-center rounded-lg
                      border border-neutral-200 bg-white text-[#596881]
                      hover:bg-neutral-50 hover:text-neutral-700 transition-colors
                    "
                  >
                    {action.icon}
                  </button>
                ))}
              </div>
            </div>
          ))}

          {/* Empty state */}
          {results.length === 0 && (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Search
                className="h-8 w-8 text-[#dee4ee] mb-3"
                strokeWidth={1.5}
              />
              <p className="text-[14px] text-[#8796af]">
                No results for &quot;{query}&quot;
              </p>
              <p className="text-[12px] text-[#dee4ee] mt-1">
                Try a different search term
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
