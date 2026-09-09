/**
 * Streams a skeleton immediately instead of blocking on the server awaits in
 * this segment's page — without it, navigation here shows nothing at all
 * until every query resolves.
 */
export default function Loading() {
  return (
    <div className="flex flex-col gap-4 md:gap-6 w-full max-w-7xl mx-auto animate-pulse">
      <div className="h-8 w-48 bg-slate-200 dark:bg-slate-800 rounded-lg" />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
        <div className="md:col-span-2 h-52 bg-slate-200 dark:bg-slate-800 rounded-3xl" />
        <div className="flex flex-col gap-4">
          <div className="h-24 bg-slate-200 dark:bg-slate-800 rounded-3xl" />
          <div className="h-24 bg-slate-200 dark:bg-slate-800 rounded-3xl" />
        </div>
      </div>
      <div className="h-64 bg-slate-200 dark:bg-slate-800 rounded-3xl" />
    </div>
  );
}
