import { cn } from "@/lib/utils";

interface EmptyStateProps {
  illustration?: React.ReactNode;
  message: string;
  className?: string;
}

export function EmptyState({
  illustration,
  message,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-1 flex-col items-center justify-center gap-4 py-12",
        className,
      )}
    >
      {illustration && (
        <div className="h-30 w-37.5 flex items-center justify-center">
          {illustration}
        </div>
      )}
      <p className="text-p-small text-[#596881]">{message}</p>
    </div>
  );
}
