export default function TokoLoading() {
  return (
    <div className="min-h-screen bg-zinc-950 p-4 sm:p-8 space-y-8 animate-pulse">
      {/* Header skeleton */}
      <div className="max-w-7xl mx-auto flex items-center justify-between border-b border-zinc-900 pb-4">
        <div className="h-8 w-40 rounded-lg bg-zinc-900" />
        <div className="h-10 w-64 rounded-xl bg-zinc-900 hidden sm:block" />
      </div>

      {/* Hero skeleton */}
      <div className="max-w-7xl mx-auto h-64 sm:h-80 rounded-3xl bg-zinc-900/80" />

      {/* Categories skeleton */}
      <div className="max-w-7xl mx-auto space-y-4">
        <div className="h-6 w-48 rounded bg-zinc-900" />
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-28 rounded-2xl bg-zinc-900/60" />
          ))}
        </div>
      </div>

      {/* Product grid skeleton */}
      <div className="max-w-7xl mx-auto space-y-4 pt-4">
        <div className="h-6 w-48 rounded bg-zinc-900" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="h-72 rounded-2xl bg-zinc-900/60 border border-zinc-900" />
          ))}
        </div>
      </div>
    </div>
  );
}
