export default function CandidateRouteFallback() {
  return (
    <div className="mx-auto min-h-[65vh] max-w-7xl px-4 py-8 sm:px-6 lg:px-8" role="status" aria-label="Đang mở trang">
      <span className="sr-only">Đang mở trang…</span>
      <div className="skeleton-shimmer h-4 w-28 rounded-full" />
      <div className="skeleton-shimmer mt-5 h-9 w-full max-w-md rounded-xl" />
      <div className="skeleton-shimmer mt-3 h-4 w-full max-w-2xl rounded-full" />
      <div className="mt-8 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {[0, 1, 2].map((item) => <div key={item} className="skeleton-shimmer h-56 rounded-2xl" />)}
      </div>
    </div>
  )
}
