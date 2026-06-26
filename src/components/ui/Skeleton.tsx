"use client";

export function Skeleton({ className }: { className?: string }) {
  return (
    <div
      className={`animate-pulse rounded-lg bg-white/5 ${className ?? ""}`}
    />
  );
}

export function ScoreSkeleton() {
  return (
    <div className="flex items-center justify-between py-4">
      <div className="flex flex-1 flex-col items-center gap-2">
        <Skeleton className="h-16 w-16 rounded-full" />
        <Skeleton className="h-3 w-20" />
        <Skeleton className="h-9 w-12" />
      </div>
      <div className="flex flex-col items-center gap-2 px-6">
        <Skeleton className="h-3 w-16" />
      </div>
      <div className="flex flex-1 flex-col items-center gap-2">
        <Skeleton className="h-16 w-16 rounded-full" />
        <Skeleton className="h-3 w-20" />
        <Skeleton className="h-9 w-12" />
      </div>
    </div>
  );
}
