"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useCreateWorkspace } from "@/lib/hooks/use-workspaces";
import { useAuthStore } from "@/lib/stores/auth-store";
import { getApiErrorMessage } from "@/lib/api/errors";
import { slugifyWorkspaceName } from "@/lib/utils/workspace";

type FormValues = {
  name: string;
  description: string;
};

interface CreateWorkspaceDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CreateWorkspaceDialog({
  open,
  onOpenChange,
}: CreateWorkspaceDialogProps) {
  const user = useAuthStore((s) => s.user);
  const mutation = useCreateWorkspace();
  const form = useForm<FormValues>({
    defaultValues: { name: "", description: "" },
  });

  const nameValue = form.watch("name");
  const slugPreview = slugifyWorkspaceName(nameValue || "");

  useEffect(() => {
    if (!open) form.reset();
  }, [open, form]);

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        onOpenChange(v);
      }}
    >
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Create workspace</DialogTitle>
          <DialogDescription className="text-[13px] text-neutral-500">
            A workspace is your team&apos;s home for projects, tasks, and
            messages.
          </DialogDescription>
        </DialogHeader>
        <form
          onSubmit={form.handleSubmit((values) => {
            const name = values.name.trim();
            if (!name) {
              form.setError("name", { message: "Name is required" });
              return;
            }
            if (!user?.id) {
              toast.error("You must be signed in");
              return;
            }
            mutation.mutate(
              {
                name,
                description: values.description?.trim() || undefined,
                ownerId: user.id,
              },
              {
                onSuccess: (workspace) => {
                  toast.success(`Workspace “${workspace.name}” created`);
                  form.reset();
                  onOpenChange(false);
                },
                onError: (err) =>
                  toast.error(
                    getApiErrorMessage(err, "Could not create workspace"),
                  ),
              },
            );
          })}
          className="space-y-4"
        >
          <div className="space-y-2">
            <Label htmlFor="ws-name">Workspace name</Label>
            <Input
              id="ws-name"
              placeholder="e.g. Acme Design"
              autoFocus
              {...form.register("name", { required: "Name is required" })}
            />
            {form.formState.errors.name && (
              <p className="text-[12px] text-red-500">
                {form.formState.errors.name.message}
              </p>
            )}
            {nameValue.trim() && (
              <p className="text-[12px] text-neutral-400">
                URL slug:{" "}
                <span className="font-mono text-neutral-600">{slugPreview}</span>
              </p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="ws-desc">Description (optional)</Label>
            <Input
              id="ws-desc"
              placeholder="What is this workspace for?"
              {...form.register("description")}
            />
          </div>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={mutation.isPending}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={mutation.isPending}
              className="bg-[#266df0] hover:bg-[#1f5ed4]"
            >
              {mutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating…
                </>
              ) : (
                "Create workspace"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
