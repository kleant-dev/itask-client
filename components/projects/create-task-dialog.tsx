"use client";

import { useForm } from "react-hook-form";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { tasksApi } from "@/lib/api/tasks";
import type { TaskPriority } from "@/types/models";

type FormValues = {
  title: string;
  description: string;
  priority: "Low" | "Medium" | "High" | "Critical";
  dueDate: string;
};

interface CreateTaskDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  projectId: string;
  workspaceId: string;
}

export function CreateTaskDialog({
  open,
  onOpenChange,
  projectId,
  workspaceId,
}: CreateTaskDialogProps) {
  const queryClient = useQueryClient();
  const form = useForm<FormValues>({
    defaultValues: {
      title: "",
      description: "",
      priority: "Medium",
      dueDate: "",
    },
  });

  const mutation = useMutation({
    mutationFn: (values: FormValues) =>
      tasksApi.create({
        projectId,
        workspaceId,
        title: values.title.trim(),
        description: values.description?.trim() || undefined,
        status: "Todo",
        priority: values.priority as TaskPriority,
        dueDate: values.dueDate
          ? new Date(values.dueDate).toISOString()
          : undefined,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["workspace-tasks"] });
      queryClient.invalidateQueries({ queryKey: ["project-tasks"] });
      toast.success("Task created");
      form.reset({ title: "", description: "", priority: "Medium", dueDate: "" });
      onOpenChange(false);
    },
    onError: () => {
      toast.error("Could not create task");
    },
  });

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        if (!v) form.reset();
        onOpenChange(v);
      }}
    >
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>New task</DialogTitle>
        </DialogHeader>
        <form
          onSubmit={form.handleSubmit((values) => {
            const title = values.title.trim();
            if (!title) {
              form.setError("title", { message: "Title is required" });
              return;
            }
            mutation.mutate({ ...values, title });
          })}
          className="space-y-4"
        >
          <div className="space-y-2">
            <Label htmlFor="task-title">Title</Label>
            <Input
              id="task-title"
              placeholder="What needs to be done?"
              {...form.register("title")}
            />
            {form.formState.errors.title && (
              <p className="text-p-xsmall text-red-500">
                {form.formState.errors.title.message}
              </p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="task-desc">Description (optional)</Label>
            <Input
              id="task-desc"
              placeholder="Add details"
              {...form.register("description")}
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="task-priority">Priority</Label>
              <select
                id="task-priority"
                className="border-input flex h-9 w-full rounded-md border bg-transparent px-3 text-p-small shadow-xs outline-none"
                {...form.register("priority")}
              >
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
                <option value="Critical">Critical</option>
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="task-due">Due date</Label>
              <Input id="task-due" type="date" {...form.register("dueDate")} />
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={mutation.isPending}>
              {mutation.isPending ? "Creating…" : "Create task"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
