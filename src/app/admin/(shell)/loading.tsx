export default function AdminLoading() {
  return (
    <div className="p-6 space-y-6 animate-pulse">
      {/* Header skeleton */}
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <div className="h-7 w-48 rounded-lg bg-zinc-800" />
          <div className="h-4 w-72 rounded bg-zinc-800/60" />
        </div>
        <div className="h-10 w-32 rounded-xl bg-zinc-800" />
      </div>

      {/* Stats grid skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-28 rounded-2xl bg-zinc-900 border border-zinc-800/80 p-4 space-y-3">
            <div className="h-4 w-24 rounded bg-zinc-800" />
            <div className="h-8 w-16 rounded-lg bg-zinc-800" />
          </div>
        ))}
      </div>

      {/* Table skeleton */}
      <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-4 space-y-4">
        <div className="h-10 w-full rounded-xl bg-zinc-800/60" />
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="h-12 w-full rounded-lg bg-zinc-800/40" />
        ))}
      </div>
    </div>
  );
}
