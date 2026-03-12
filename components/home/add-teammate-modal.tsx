"use client";

import { useState, useRef, KeyboardEvent } from "react";
import { Info, X } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface AddTeammateModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AddTeammateModal({
  open,
  onOpenChange,
}: AddTeammateModalProps) {
  const [emails, setEmails] = useState<string[]>([]);
  const [inputValue, setInputValue] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  function addEmail(value: string) {
    const trimmed = value.trim().replace(/,$/, ""); // strip trailing comma
    if (trimmed && !emails.includes(trimmed)) {
      setEmails((prev) => [...prev, trimmed]);
    }
    setInputValue("");
  }

  function handleKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      addEmail(inputValue);
    }
    if (e.key === "Backspace" && !inputValue && emails.length > 0) {
      setEmails((prev) => prev.slice(0, -1));
    }
  }

  function removeEmail(email: string) {
    setEmails((prev) => prev.filter((e) => e !== email));
  }

  function handleSend() {
    // TODO: call API
    setEmails([]);
    setInputValue("");
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-150 max-w-[calc(100vw-48px)] rounded-2xl p-6 gap-5">
        <DialogHeader className="gap-1">
          <DialogTitle className="text-[20px] font-semibold text-[#111625]">
            Invite Teammates
          </DialogTitle>
          <DialogDescription className="text-[14px] text-[#596881]">
            New members can check out public Spaces, Docs, and Dashboards!
          </DialogDescription>
        </DialogHeader>

        {/* Tag input */}
        <div className="flex flex-col gap-1.5">
          <label className="text-[14px] text-[#596881]">Email</label>

          <div
            className="
              flex min-h-10 w-full flex-wrap items-center gap-1.5
              rounded-[10px] border border-neutral-200 bg-white px-3 py-2
              cursor-text focus-within:border-[#266df0] focus-within:ring-2
              focus-within:ring-[#266df0]/10 transition-all
            "
            onClick={() => inputRef.current?.focus()}
          >
            {emails.map((email) => (
              <span
                key={email}
                className="flex items-center gap-1 rounded-md bg-[#e9f0fe] px-2 py-0.5 text-[12px] text-[#266df0]"
              >
                {email}
                <button
                  onClick={() => removeEmail(email)}
                  className="text-[#266df0]/60 hover:text-[#266df0] transition-colors"
                >
                  <X className="h-3 w-3" />
                </button>
              </span>
            ))}
            <input
              ref={inputRef}
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              onBlur={() => {
                if (inputValue.trim()) addEmail(inputValue);
              }}
              placeholder={emails.length === 0 ? "Add email addresses..." : ""}
              className="flex-1 min-w-40 bg-transparent text-[14px] text-[#111625] placeholder:text-[#8796af] outline-none"
            />
          </div>

          <div className="flex items-center gap-1.5">
            <Info className="h-3.5 w-3.5 shrink-0 text-[#8796af]" />
            <span className="text-[12px] text-[#8796af]">
              Use a comma or press Enter to add a new email.
            </span>
          </div>
        </div>

        <DialogFooter className="gap-2">
          <DialogClose asChild>
            <Button variant="outline" className="h-10 rounded-[10px] px-4">
              Cancel
            </Button>
          </DialogClose>
          <Button
            onClick={handleSend}
            disabled={emails.length === 0 && !inputValue.trim()}
            className="h-10 rounded-[10px] bg-[#266df0] px-4 hover:bg-[#1a5dd4] disabled:opacity-50"
          >
            Send Invites
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
