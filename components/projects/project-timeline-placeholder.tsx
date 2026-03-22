"use client";

export function ProjectTimelinePlaceholder() {
  return (
    <div className="flex min-h-[280px] flex-col items-center justify-center rounded-xl border border-dashed border-neutral-200 bg-[#f7f9fb] px-6 text-center">
      <p className="text-[15px] font-medium text-[#111625]">Timeline view</p>
      <p className="mt-1 max-w-sm text-[14px] text-[#596881]">
        A Gantt-style timeline is not available yet. Use Board or List to manage
        tasks.
      </p>
    </div>
  );
}
