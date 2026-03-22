"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { MessageSquare } from "lucide-react";
import type { CSSProperties, ReactNode } from "react";
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  closestCorners,
  useDroppable,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragOverEvent,
  type DragStartEvent,
  type DropAnimation,
  type UniqueIdentifier,
  defaultDropAnimationSideEffects,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { cn } from "@/lib/utils";
import { tasksApi } from "@/lib/api/tasks";
import type { TaskModel, TaskStatus, TaskPriority } from "@/types/models";
import { formatShortDate } from "@/lib/utils/format-date";
import { boardTokens as figma } from "@/lib/figma/project-board-tokens";

const COLUMNS: { status: TaskStatus; label: string }[] = [
  { status: "Todo", label: "To Do" },
  { status: "InProgress", label: "On Progress" },
  { status: "InReview", label: "Review" },
  { status: "Done", label: "Done" },
];

function buildItems(tasks: TaskModel[]): Record<TaskStatus, string[]> {
  const next: Record<TaskStatus, string[]> = {
    Todo: [],
    InProgress: [],
    InReview: [],
    Done: [],
    Archived: [],
  };
  const byId = new Map(tasks.map((t) => [t.id, t]));
  for (const t of tasks) {
    next[t.status].push(t.id);
  }
  for (const col of COLUMNS) {
    next[col.status].sort(
      (a, b) =>
        (byId.get(a)?.sortOrder ?? 0) - (byId.get(b)?.sortOrder ?? 0),
    );
  }
  return next;
}

function cloneItems(
  source: Record<TaskStatus, string[]>,
): Record<TaskStatus, string[]> {
  return {
    Todo: [...source.Todo],
    InProgress: [...source.InProgress],
    InReview: [...source.InReview],
    Done: [...source.Done],
    Archived: [...source.Archived],
  };
}

function findContainer(
  id: UniqueIdentifier,
  itemMap: Record<TaskStatus, string[]>,
): TaskStatus | null {
  const s = String(id);
  if (s in itemMap) return s as TaskStatus;
  for (const col of COLUMNS) {
    if (itemMap[col.status].includes(s)) return col.status;
  }
  return null;
}

function isContainerId(id: UniqueIdentifier): boolean {
  return COLUMNS.some((c) => c.status === String(id));
}

const dropAnimation: DropAnimation = {
  duration: 220,
  easing: "cubic-bezier(0.25, 1, 0.5, 1)",
  sideEffects: defaultDropAnimationSideEffects({
    styles: {
      active: { opacity: "0.35" },
    },
  }),
};

function TaskCardVisual({
  task,
  className,
}: {
  task: TaskModel;
  className?: string;
}) {
  const due = task.dueDate ? formatShortDate(task.dueDate) : null;
  const isBadge =
    task.priority === "Medium" ||
    task.priority === "High" ||
    task.priority === "Critical";

  let badgeFg: string = figma.priorityLow;
  let badgeBg = "transparent";
  if (task.priority === "Medium") {
    badgeFg = figma.priorityMedium;
    badgeBg = "rgba(55, 93, 251, 0.1)";
  } else if (task.priority === "High" || task.priority === "Critical") {
    badgeFg = figma.priorityHigh;
    badgeBg = "rgba(223, 28, 65, 0.1)";
  }

  return (
    <div
      className={cn(
        "flex flex-col rounded-[12px] bg-white p-4 ring-1 ring-black/[0.04]",
        "select-none",
        className,
      )}
    >
      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-4">
          <span
            className={cn(
              "w-fit text-[12px] leading-4 font-medium",
              isBadge && "rounded px-1.5 py-0.5",
            )}
            style={{
              color: isBadge ? badgeFg : figma.priorityLow,
              backgroundColor: isBadge ? badgeBg : "transparent",
            }}
          >
            {task.priority === "Critical"
              ? "Critical"
              : task.priority === "High"
                ? "High"
                : task.priority === "Medium"
                  ? "Medium"
                  : "Low"}
          </span>
          <div className="flex flex-col gap-1.5">
            <h3
              className="font-semibold"
              style={{
                fontSize: figma.taskTitleFontPx,
                lineHeight: `${figma.taskTitleLinePx}px`,
                color: figma.taskTitleColor,
              }}
            >
              {task.title}
            </h3>
            {task.description && (
              <p
                className="line-clamp-2"
                style={{
                  fontSize: figma.bodyFontPx,
                  lineHeight: `${figma.bodyLinePx}px`,
                  color: figma.bodyColor,
                }}
              >
                {task.description}
              </p>
            )}
          </div>
        </div>
        <div
          className="flex items-center justify-between"
          style={{
            fontSize: figma.bodyFontPx,
            lineHeight: `${figma.bodyLinePx}px`,
            color: figma.bodyColor,
          }}
        >
          <span>{due ?? "—"}</span>
          <span className="flex items-center gap-1 opacity-90">
            <MessageSquare className="h-4 w-4" strokeWidth={1.5} />
            0
          </span>
        </div>
      </div>
    </div>
  );
}

/** Droppable column shell — must wrap SortableContext, not sit inside it. */
function ColumnDropArea({
  columnId,
  children,
}: {
  columnId: TaskStatus;
  children: ReactNode;
}) {
  const { setNodeRef, isOver } = useDroppable({ id: columnId });
  return (
    <div
      ref={setNodeRef}
      className={cn(
        "flex min-h-[160px] flex-col rounded-2xl p-1 transition-colors duration-150",
        isOver && "ring-2 ring-[#266df0]/25 ring-offset-0",
      )}
      style={{
        padding: figma.boardContainerPaddingPx,
        gap: figma.boardContainerPaddingPx,
        borderRadius: figma.boardContainerRadiusPx,
        backgroundColor: figma.boardContainerBg,
      }}
    >
      {children}
    </div>
  );
}

function SortableTaskCard({ task }: { task: TaskModel }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task.id });

  const dndStyle: CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    touchAction: "none",
  };

  return (
    <div
      ref={setNodeRef}
      style={dndStyle}
      className={cn(
        "relative rounded-[12px] outline-none",
        isDragging && "z-10 opacity-40",
      )}
      {...attributes}
      {...listeners}
    >
      <TaskCardVisual
        task={task}
        className={cn(
          "cursor-grab active:cursor-grabbing",
          isDragging && "pointer-events-none",
        )}
      />
    </div>
  );
}

interface ProjectKanbanProps {
  tasks: TaskModel[];
  priorityFilter: TaskPriority | "all";
}

export function ProjectKanban({ tasks, priorityFilter }: ProjectKanbanProps) {
  const queryClient = useQueryClient();
  const [activeId, setActiveId] = useState<UniqueIdentifier | null>(null);
  const [items, setItems] = useState<Record<TaskStatus, string[]>>(() =>
    buildItems([]),
  );
  const itemsSnapshot = useRef<Record<TaskStatus, string[]> | null>(null);
  const latestItems = useRef(items);
  useEffect(() => {
    latestItems.current = items;
  }, [items]);

  const filtered = useMemo(() => {
    if (priorityFilter === "all") return tasks;
    return tasks.filter((t) => t.priority === priorityFilter);
  }, [tasks, priorityFilter]);

  const tasksById = useMemo(() => {
    const m = new Map<string, TaskModel>();
    for (const t of filtered) m.set(t.id, t);
    return m;
  }, [filtered]);

  const taskSignature = useMemo(
    () =>
      filtered
        .map((t) => `${t.id}:${t.status}:${t.sortOrder}`)
        .sort()
        .join("|"),
    [filtered],
  );
  const prevSig = useRef("");

  useEffect(() => {
    if (activeId) return;
    if (taskSignature === prevSig.current) return;
    prevSig.current = taskSignature;
    setItems(buildItems(filtered));
  }, [filtered, taskSignature, activeId]);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      // Small threshold so drag starts reliably (distance-only can feel “stuck”).
      activationConstraint: { distance: 4 },
    }),
  );

  const moveMutation = useMutation({
    mutationFn: async ({
      task,
      status,
    }: {
      task: TaskModel;
      status: TaskStatus;
    }) => {
      const payload: Parameters<typeof tasksApi.update>[1] = { status };
      if (status === "Done") {
        payload.completedAtUtc = new Date().toISOString();
      }
      return tasksApi.update(task.id, payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["workspace-tasks"] });
      queryClient.invalidateQueries({ queryKey: ["project-tasks"] });
    },
    onError: () => {
      toast.error("Could not update task");
      if (itemsSnapshot.current) {
        setItems(itemsSnapshot.current);
      }
    },
  });

  const onDragStart = useCallback((event: DragStartEvent) => {
    itemsSnapshot.current = cloneItems(latestItems.current);
    setActiveId(event.active.id);
  }, []);

  const onDragOver = useCallback((event: DragOverEvent) => {
    const { active, over } = event;
    const overId = over?.id;
    if (overId == null || active.id === overId) return;

    setItems((prev) => {
      const overContainer = findContainer(overId, prev);
      const activeContainer = findContainer(active.id, prev);
      if (!overContainer || !activeContainer) return prev;
      if (activeContainer === overContainer) return prev;

      const activeItems = [...prev[activeContainer]];
      const overItems = [...prev[overContainer]];
      const activeIndex = activeItems.indexOf(String(active.id));
      const overIndex = overItems.indexOf(String(overId));

      let newIndex: number;
      if (isContainerId(overId)) {
        newIndex = overItems.length;
      } else {
        const isBelowOverItem =
          over &&
          active.rect.current.translated &&
          active.rect.current.translated.top > over.rect.top + over.rect.height;
        const modifier = isBelowOverItem ? 1 : 0;
        newIndex =
          overIndex >= 0 ? overIndex + modifier : overItems.length;
      }

      const moving = activeItems[activeIndex];
      if (moving === undefined) return prev;

      return {
        ...prev,
        [activeContainer]: activeItems.filter((id) => id !== moving),
        [overContainer]: [
          ...overItems.slice(0, newIndex),
          moving,
          ...overItems.slice(newIndex, overItems.length),
        ],
      };
    });
  }, []);

  const onDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event;
      setActiveId(null);

      if (!over) {
        if (itemsSnapshot.current) setItems(itemsSnapshot.current);
        itemsSnapshot.current = null;
        return;
      }

      setItems((prev) => {
        const activeContainer = findContainer(active.id, prev);
        const overContainer = findContainer(over.id, prev);
        let next = prev;

        if (
          activeContainer &&
          overContainer &&
          activeContainer === overContainer
        ) {
          const list = [...prev[activeContainer]];
          const activeIndex = list.indexOf(String(active.id));
          const overIndex = list.indexOf(String(over.id));
          if (activeIndex >= 0 && overIndex >= 0 && activeIndex !== overIndex) {
            next = {
              ...prev,
              [activeContainer]: arrayMove(list, activeIndex, overIndex),
            };
          }
        }

        const task = tasksById.get(String(active.id));
        const finalContainer = findContainer(active.id, next);
        if (task && finalContainer && task.status !== finalContainer) {
          queueMicrotask(() =>
            moveMutation.mutate({ task, status: finalContainer }),
          );
        }

        return next;
      });

      itemsSnapshot.current = null;
    },
    [moveMutation, tasksById],
  );

  const onDragCancel = useCallback(() => {
    setActiveId(null);
    if (itemsSnapshot.current) {
      setItems(itemsSnapshot.current);
    }
    itemsSnapshot.current = null;
  }, []);

  const activeTask = activeId ? tasksById.get(String(activeId)) : null;

  const cardOverlayWidth =
    figma.columnWidthPx - figma.boardContainerPaddingPx * 2;

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={onDragStart}
      onDragOver={onDragOver}
      onDragEnd={onDragEnd}
      onDragCancel={onDragCancel}
    >
      <div
        className="flex overflow-x-auto pb-2 [scrollbar-width:thin]"
        style={{ gap: figma.columnGapPx }}
      >
        {COLUMNS.map((col) => {
          const ids = items[col.status];
          return (
            <div
              key={col.status}
              className="flex shrink-0 flex-col"
              style={{ width: figma.columnWidthPx }}
            >
              <div
                className="mb-1 flex items-center justify-between px-1"
                style={{ minHeight: figma.columnTitleHeightPx }}
              >
                <h2
                  className="font-medium"
                  style={{
                    fontSize: figma.columnTitleFontPx,
                    lineHeight: `${figma.columnTitleLinePx}px`,
                    color: figma.columnTitleColor,
                  }}
                >
                  {col.label}
                </h2>
                <span
                  className="tabular-nums"
                  style={{
                    fontSize: 12,
                    lineHeight: "16px",
                    color: "#8796AF",
                  }}
                >
                  {ids.length}
                </span>
              </div>
              <ColumnDropArea columnId={col.status}>
                <SortableContext
                  items={ids}
                  strategy={verticalListSortingStrategy}
                >
                  {ids.map((id) => {
                    const task = tasksById.get(id);
                    if (!task) return null;
                    return <SortableTaskCard key={id} task={task} />;
                  })}
                </SortableContext>
              </ColumnDropArea>
            </div>
          );
        })}
      </div>

      <DragOverlay dropAnimation={dropAnimation}>
        {activeTask ? (
          <div
            className="cursor-grabbing"
            style={{ width: cardOverlayWidth }}
          >
            <TaskCardVisual
              task={activeTask}
              className="scale-[1.02] shadow-xl ring-black/10"
            />
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}
