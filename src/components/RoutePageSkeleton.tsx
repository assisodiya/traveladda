export function RoutePageSkeleton({ badge = "Loading TravelAdda..." }: { badge?: string }) {
  return (
    <main className="min-h-screen bg-canvas pb-16 sm:pb-24" aria-busy="true">
      {/* Top animated progress bar for instant click feedback */}
      <div className="fixed top-0 right-0 left-0 z-[70] h-[3px] overflow-hidden bg-[#1956b4]/20">
        <div className="h-full w-1/2 animate-pulse rounded-r-full bg-[#fc6203]" />
      </div>

      {/* Matching Navy Hero Shell */}
      <section className="ta-navy-hero pt-5 pb-12 sm:pt-7 sm:pb-16">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-xs font-bold text-blue-100">
            <span className="h-2 w-2 animate-ping rounded-full bg-[#fc6203]" />
            <span>{badge}</span>
          </div>
          <div className="mt-3.5 h-8 w-3/4 max-w-xl animate-pulse rounded-xl bg-white/15 sm:h-10" />
          <div className="mt-2.5 h-4 w-2/3 max-w-lg animate-pulse rounded-lg bg-white/10" />
        </div>
      </section>

      {/* Matching Overlapping Card Shell */}
      <div className="relative z-10 mx-auto -mt-8 max-w-6xl space-y-5 px-4 sm:-mt-10 sm:px-6 lg:px-8">
        <div className="rounded-2xl border border-line bg-card p-5 shadow-md sm:p-6">
          <div className="grid gap-3 md:grid-cols-3">
            <div className="h-14 animate-pulse rounded-xl bg-subcard" />
            <div className="h-14 animate-pulse rounded-xl bg-subcard" />
            <div className="h-14 animate-pulse rounded-xl bg-subcard" />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          <div className="h-24 animate-pulse rounded-2xl border border-line bg-card p-4" />
          <div className="h-24 animate-pulse rounded-2xl border border-line bg-card p-4" />
          <div className="h-24 animate-pulse rounded-2xl border border-line bg-card p-4" />
          <div className="h-24 animate-pulse rounded-2xl border border-line bg-card p-4" />
        </div>

        <div className="rounded-2xl border border-line bg-card p-5 shadow-xs sm:p-6">
          <div className="h-5 w-52 animate-pulse rounded-lg bg-subcard" />
          <div className="mt-4 space-y-3">
            <div className="h-12 animate-pulse rounded-xl bg-subcard/70" />
            <div className="h-12 animate-pulse rounded-xl bg-subcard/70" />
            <div className="h-12 animate-pulse rounded-xl bg-subcard/70" />
            <div className="h-12 animate-pulse rounded-xl bg-subcard/70" />
          </div>
        </div>
      </div>
    </main>
  );
}
