export default function WorkspaceRouteFallback() {
  return (
    <main className="mx-auto min-h-[65vh] max-w-7xl space-y-6 px-4 py-8 sm:px-6 lg:px-8" role="status" aria-label="Đang mở trang quản lý">
      <span className="sr-only">Đang mở trang quản lý…</span>
      <div className="flex items-end justify-between gap-6 border-b border-slate-200 pb-6">
        <div className="min-w-0 flex-1">
          <div className="skeleton-shimmer h-3 w-28 rounded-full" />
          <div className="skeleton-shimmer mt-4 h-7 w-full max-w-sm rounded-lg" />
        </div>
        <div className="skeleton-shimmer h-10 w-28 rounded-xl" />
      </div>
      <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
        {[0, 1, 2, 3].map((item) => <div key={item} className="skeleton-shimmer h-36 rounded-2xl" />)}
      </div>
      <div className="skeleton-shimmer h-72 rounded-2xl" />
    </main>
  )
}
