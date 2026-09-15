"use client";

import React, { useState } from "react";
import { useDebounce } from "@/hooks/useDebounce";
import { lookupTicketForVendorAction, type TicketLookupResult } from "@/actions/vendorlookup.actions";
import { JOB_STATUS_COLORS, jobStatusLabel } from "@/lib/jobStatus";
import { ClientIcon } from "@/components/ui/ClientIcon";

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}

function StatusPill({ status }: { status: string }) {
  return (
    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold capitalize ${JOB_STATUS_COLORS[status] ?? ""}`}>
      {jobStatusLabel(status)}
    </span>
  );
}

export default function VendorLookupPage() {
  const [query, setQuery] = useState("");
  const debouncedQuery = useDebounce(query, 350);
  const [result, setResult] = useState<TicketLookupResult | null>(null);
  const [searched, setSearched] = useState(false);
  // The last query a fetch actually resolved for — comparing it to the
  // current query (rather than a separate boolean flipped synchronously in
  // the effect body) is what lets isSearching be a derived value instead of
  // its own setState call at the top of the effect.
  const [resolvedQuery, setResolvedQuery] = useState("");

  const trimmedQuery = debouncedQuery.trim();
  const isSearching = trimmedQuery !== "" && trimmedQuery !== resolvedQuery;

  React.useEffect(() => {
    // An empty query needs no fetch — the render below already hides any
    // stale result once trimmedQuery is empty, so there's nothing to reset.
    if (!trimmedQuery) return;
    let cancelled = false;
    lookupTicketForVendorAction(trimmedQuery).then((res) => {
      if (cancelled) return;
      setResult(res.success ? res.data ?? null : null);
      setSearched(true);
      setResolvedQuery(trimmedQuery);
    });
    return () => {
      cancelled = true;
    };
  }, [trimmedQuery]);

  return (
    <div className="flex flex-col gap-6 w-full max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Lookup</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          Search by ticket number to see a job&apos;s work and amount history — no customer details, just the record.
        </p>
      </div>

      <div className="relative">
        {isSearching ? (
          <ClientIcon icon="ph:spinner-gap-bold" className="w-4 h-4 text-[#00B4FF] absolute left-3.5 top-1/2 -translate-y-1/2 animate-spin" />
        ) : (
          <ClientIcon icon="ph:magnifying-glass" className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
        )}
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Ticket number, e.g. HZ-100234"
          className="w-full h-12 bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-slate-700 rounded-xl pl-10 pr-4 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/40"
        />
      </div>

      {trimmedQuery && searched && !isSearching && !result && (
        <div className="p-8 text-center bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-slate-800 rounded-2xl">
          <ClientIcon icon="ph:ticket-bold" className="w-8 h-8 text-slate-300 mx-auto mb-2" />
          <p className="text-sm text-slate-500 dark:text-slate-400">No ticket found for &quot;{query}&quot;.</p>
        </div>
      )}

      {trimmedQuery && result && (
        <div className="flex flex-col gap-4">
          <div className="bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-slate-800 rounded-2xl p-5 flex flex-col gap-3">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="font-mono font-bold text-sm text-blue-600 dark:text-blue-400">{result.ticketNumber}</p>
                <p className="text-xs text-slate-400 mt-0.5">{formatDate(result.createdAt)} &middot; {result.city}</p>
              </div>
              <StatusPill status={result.status} />
            </div>
            <div className="border-t border-slate-100 dark:border-slate-800 pt-3 flex flex-col gap-1.5 text-sm">
              <p className="text-slate-700 dark:text-slate-300">{result.itemSummary || "—"}</p>
              {result.technicianName && (
                <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                  <ClientIcon icon="ph:user" className="w-3.5 h-3.5" /> {result.technicianName}
                </p>
              )}
              <p className="font-bold text-slate-900 dark:text-white text-base pt-1">₹{result.total.toFixed(0)}</p>
            </div>
          </div>

          {result.history.length > 0 && (
            <div className="bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-slate-800 rounded-2xl p-5">
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-3">
                Past visits from this customer
              </p>
              <div className="flex flex-col gap-2">
                {result.history.map((h) => (
                  <div key={h.ticketNumber} className="flex items-center justify-between text-sm py-1.5 border-b last:border-b-0 border-slate-50 dark:border-slate-800/60">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="font-mono text-xs text-slate-400">{h.ticketNumber}</span>
                      <span className="text-slate-400 text-xs">{formatDate(h.createdAt)}</span>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <StatusPill status={h.status} />
                      <span className="font-semibold text-slate-900 dark:text-white">₹{h.total.toFixed(0)}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
