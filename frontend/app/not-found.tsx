export default function NotFound() {
  return (
    <main className="flex min-h-[50vh] items-center justify-center px-4">
      <div className="w-full max-w-md rounded-[28px] border border-white/70 bg-white/95 p-6 text-center shadow-soft">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-brand-500">404</p>
        <h1 className="mt-3 text-2xl font-bold text-ink">Page not found</h1>
        <p className="mt-2 text-sm text-slate-500">The page you requested does not exist.</p>
      </div>
    </main>
  );
}
