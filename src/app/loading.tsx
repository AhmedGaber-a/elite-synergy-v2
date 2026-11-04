// src/app/loading.tsx
export default function GlobalLoading() {
  return (
    <div
      role="status"
      aria-label="Loading page content / جاري التحميل"
      className="min-h-screen bg-bg-cream flex flex-col transition-opacity duration-300"
    >
      {/* Top indeterminate progress bar */}
      <div className="h-1 w-full bg-slate-200 overflow-hidden sticky top-0 z-50">
        <div className="h-full bg-gradient-to-r from-brand-orange via-orange-500 to-[#ea580c] w-1/3 animate-[shimmer_1.5s_infinite_linear] rounded-r" />
      </div>

      {/* Main Skeleton Wrapper */}
      <main className="max-w-6xl w-full mx-auto px-4 py-8 flex-1 space-y-8 animate-pulse">
        {/* Header / Hero Skeleton */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 sm:p-8 border border-slate-200/80 shadow-sm flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-3 w-full md:w-2/3">
            <div className="h-7 w-48 bg-slate-200 rounded-lg" />
            <div className="h-4 w-3/4 bg-slate-100 rounded" />
            <div className="h-4 w-1/2 bg-slate-100 rounded" />
          </div>

          {/* Central Branded Spinner */}
          <div className="flex flex-col items-center justify-center gap-3 shrink-0">
            <div className="relative w-12 h-12">
              <div className="w-12 h-12 rounded-full border-4 border-slate-200 border-t-[#ea580c] animate-spin" />
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="w-2.5 h-2.5 rounded-full bg-[#ea580c] animate-ping" />
              </div>
            </div>
            <span className="text-xs font-semibold text-slate-500 tracking-wide font-sans">
              Elite Synergy
            </span>
          </div>
        </div>

        {/* Content Skeleton Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Main Feed Column */}
          <div className="md:col-span-2 space-y-4">
            {[1, 2, 3].map((item) => (
              <div
                key={item}
                className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-slate-200/80 shadow-sm space-y-4"
              >
                {/* Author row */}
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-full bg-slate-200 shrink-0" />
                  <div className="space-y-2 flex-1">
                    <div className="h-4 w-36 bg-slate-200 rounded" />
                    <div className="h-3 w-24 bg-slate-100 rounded" />
                  </div>
                </div>

                {/* Content lines */}
                <div className="space-y-2 pt-2">
                  <div className="h-3.5 w-full bg-slate-200/70 rounded" />
                  <div className="h-3.5 w-11/12 bg-slate-100 rounded" />
                  <div className="h-3.5 w-4/5 bg-slate-100 rounded" />
                </div>

                {/* Actions row */}
                <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                  <div className="h-8 w-20 bg-slate-200/60 rounded-full" />
                  <div className="h-8 w-20 bg-slate-200/60 rounded-full" />
                  <div className="h-8 w-20 bg-slate-200/60 rounded-full" />
                </div>
              </div>
            ))}
          </div>

          {/* Sidebar Column */}
          <div className="space-y-4">
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-slate-200/80 shadow-sm space-y-4">
              <div className="h-5 w-32 bg-slate-200 rounded" />
              <div className="space-y-3">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-slate-200 shrink-0" />
                    <div className="space-y-1.5 flex-1">
                      <div className="h-3.5 w-24 bg-slate-200 rounded" />
                      <div className="h-2.5 w-16 bg-slate-100 rounded" />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-slate-200/80 shadow-sm space-y-3">
              <div className="h-5 w-28 bg-slate-200 rounded" />
              <div className="flex flex-wrap gap-2">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="h-7 w-16 bg-slate-200/70 rounded-full" />
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
