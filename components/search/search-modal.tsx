"use client";

import {
  Dialog,
  DialogContentSearch,
  DialogTitle,
} from "@/components/ui/dialog";
import { SearchColumn } from "./search-column";
import { FiltersColumn } from "./filters-column";

interface SearchModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function SearchModal({ open, onOpenChange }: SearchModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContentSearch>
        {/* Hidden title for screen readers — required by Radix */}
        <DialogTitle className="sr-only">Search</DialogTitle>

        {/* Left — search input + results (60%) */}
        <SearchColumn onClose={() => onOpenChange(false)} />

        {/* Divider */}
        <div className="w-px shrink-0 self-stretch bg-neutral-100" />

        {/* Right — quick filters (40%) */}
        <FiltersColumn />
      </DialogContentSearch>
    </Dialog>
  );
}
