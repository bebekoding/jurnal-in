"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { MagnifyingGlass, X } from "@phosphor-icons/react";
import { PARTICIPANTS } from "@/lib/participants";

export default function FeedFilters() {
  const router = useRouter();
  const params = useSearchParams();

  const [q, setQ] = useState(params.get("q") ?? "");
  const type = params.get("type") ?? "all";
  const author = params.get("author") ?? "All";
  const from = params.get("from") ?? "";
  const to = params.get("to") ?? "";

  const qRef = useRef(q);
  qRef.current = q;

  // Push a new query string, preserving the other params.
  function update(next: Record<string, string>) {
    const sp = new URLSearchParams(params.toString());
    for (const [k, v] of Object.entries(next)) {
      if (!v || v === "all" || v === "All") sp.delete(k);
      else sp.set(k, v);
    }
    const qs = sp.toString();
    router.replace(qs ? `/feed?${qs}` : "/feed", { scroll: false });
  }

  // Debounce the keyword box so we don't push on every keystroke.
  useEffect(() => {
    const current = params.get("q") ?? "";
    if (q === current) return;
    const id = window.setTimeout(() => update({ q: qRef.current }), 300);
    return () => window.clearTimeout(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q]);

  const hasFilters =
    q || type !== "all" || author !== "All" || from || to;

  return (
    <div className="card p-4 space-y-4" data-reveal>
      <div className="relative">
        <MagnifyingGlass
          size={16}
          weight="bold"
          className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-muted"
        />
        <input
          type="search"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search by keyword, title, or writer…"
          className="w-full h-11 pl-9 pr-3 text-sm"
        />
      </div>

      <div className="grid sm:grid-cols-4 gap-3">
        <div>
          <label className="block text-[11px] font-semibold uppercase tracking-wider text-ink-muted mb-1.5">
            Type
          </label>
          <select
            value={type}
            onChange={(e) => update({ type: e.target.value })}
            className="w-full h-10 px-2 text-sm"
          >
            <option value="all">All</option>
            <option value="journal">Journal</option>
            <option value="essay">Essay</option>
            <option value="table">Table</option>
          </select>
        </div>
        <div>
          <label className="block text-[11px] font-semibold uppercase tracking-wider text-ink-muted mb-1.5">
            Writer
          </label>
          <select
            value={author}
            onChange={(e) => update({ author: e.target.value })}
            className="w-full h-10 px-2 text-sm"
          >
            <option value="All">All</option>
            {PARTICIPANTS.map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-[11px] font-semibold uppercase tracking-wider text-ink-muted mb-1.5">
            From
          </label>
          <input
            type="date"
            value={from}
            max={to || undefined}
            onChange={(e) => update({ from: e.target.value })}
            className="w-full h-10 px-2 text-sm tabular"
          />
        </div>
        <div>
          <label className="block text-[11px] font-semibold uppercase tracking-wider text-ink-muted mb-1.5">
            To
          </label>
          <input
            type="date"
            value={to}
            min={from || undefined}
            onChange={(e) => update({ to: e.target.value })}
            className="w-full h-10 px-2 text-sm tabular"
          />
        </div>
      </div>

      {hasFilters && (
        <button
          type="button"
          onClick={() => {
            setQ("");
            router.replace("/feed", { scroll: false });
          }}
          className="inline-flex items-center gap-1.5 text-xs text-ink-muted hover:text-ink"
        >
          <X size={12} weight="bold" />
          Clear filters
        </button>
      )}
    </div>
  );
}
