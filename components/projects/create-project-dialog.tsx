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
import { projectsApi } from "@/lib/api/projects";

type FormValues = { name: string; description: string };

interface CreateProjectDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  workspaceId: string | null | undefined;
  onCreated?: (projectId: string) => void;
}

export function CreateProjectDialog({
  open,
  onOpenChange,
  workspaceId,
  onCreated,
}: CreateProjectDialogProps) {
  const queryClient = useQueryClient();
  const form = useForm<FormValues>({
    defaultValues: { name: "", description: "" },
  });

  const mutation = useMutation({
    mutationFn: (values: FormValues) =>
      projectsApi.create(workspaceId!, {
        name: values.name.trim(),
        description: values.description?.trim() || undefined,
      }),
    onSuccess: (project) => {
      queryClient.invalidateQueries({ queryKey: ["workspace-projects"] });
      queryClient.invalidateQueries({ queryKey: ["project", project.id] });
      toast.success("Project created");
      form.reset();
      onOpenChange(false);
      onCreated?.(project.id);
    },
    onError: () => {
      toast.error("Could not create project");
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
          <DialogTitle>New project</DialogTitle>
        </DialogHeader>
        <form
          onSubmit={form.handleSubmit((values) => {
            const name = values.name.trim();
            if (!name) {
              form.setError("name", { message: "Name is required" });
              return;
            }
            mutation.mutate({ name, description: values.description });
          })}
          className="space-y-4"
        >
          <div className="space-y-2">
            <Label htmlFor="project-name">Name</Label>
            <Input
              id="project-name"
              placeholder="e.g. Umbrella Project"
              {...form.register("name")}
            />
            {form.formState.errors.name && (
              <p className="text-p-xsmall text-red-500">
                {form.formState.errors.name.message}
              </p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="project-desc">Description (optional)</Label>
            <Input
              id="project-desc"
              placeholder="Short summary"
              {...form.register("description")}
            />
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={!workspaceId || mutation.isPending}
            >
              {mutation.isPending ? "Creating…" : "Create"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
