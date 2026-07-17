"use client";

import { useState } from "react";

type Tab = "essays" | "tables" | "featured";

const TABS: { key: Tab; label: string }[] = [
  { key: "essays", label: "Essay pool" },
  { key: "tables", label: "Task 1 tables" },
  { key: "featured", label: "Featured essays" },
];

function todayISO() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
    d.getDate()
  ).padStart(2, "0")}`;
}

export default function AdminPage() {
  const [tab, setTab] = useState<Tab>("essays");
  const [password, setPassword] = useState("");

  return (
    <div className="max-w-3xl space-y-8">
      <header data-reveal>
        <h1 className="font-display text-4xl md:text-5xl leading-[1] tracking-tight text-ink">
          Admin.
        </h1>
        <p className="mt-3 text-ink-muted text-[15px]">
          Add essay prompts, Task 1 tables, or feature essays for a specific
          day. All actions are idempotent by title.
        </p>
      </header>

      <div
        className="flex gap-1.5"
        data-reveal
        style={{ "--d": "90ms" } as React.CSSProperties}
      >
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`h-9 px-4 rounded-full border-[1.5px] text-sm font-semibold transition ${
              tab === t.key
                ? "bg-lime border-ink text-ink shadow-hard-sm"
                : "border-ink/25 text-ink-muted hover:border-ink"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div
        data-reveal
        style={{ "--d": "150ms" } as React.CSSProperties}
      >
        <label className="block text-[11px] font-semibold uppercase tracking-wider text-ink-muted mb-1.5">
          Admin password
        </label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full max-w-xs h-10 px-3 text-sm"
          placeholder="Only needed if ADMIN_PASSWORD is set"
        />
      </div>

      {tab === "essays" && <EssayPool password={password} />}
      {tab === "tables" && <TablesBulk password={password} />}
      {tab === "featured" && <FeaturedEssays password={password} />}
    </div>
  );
}

function useSubmit() {
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function run(url: string, payload: any, ok: (data: any) => string) {
    setError(null);
    setResult(null);
    setSubmitting(true);
    try {
      const res = await fetch(url, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error(await res.text());
      setResult(ok(await res.json()));
    } catch (err: any) {
      setError(err.message || "Failed.");
    } finally {
      setSubmitting(false);
    }
  }

  return { submitting, result, error, run, setResult };
}

function Feedback({
  result,
  error,
}: {
  result: string | null;
  error: string | null;
}) {
  return (
    <>
      {error && (
        <div className="card bg-accent-soft px-4 py-3 text-sm text-ink whitespace-pre-wrap">
          {error}
        </div>
      )}
      {result && (
        <div className="card bg-lime-soft px-4 py-3 text-sm text-ink font-semibold">
          {result}
        </div>
      )}
    </>
  );
}

function EssayPool({ password }: { password: string }) {
  const [raw, setRaw] = useState("");
  const { submitting, result, error, run } = useSubmit();
  const lines = raw.split("\n").map((l) => l.trim()).filter(Boolean);

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        run(
          "/api/topics/bulk",
          { password, topics: lines },
          (d) => `${d.inserted} topics added to the pool.`
        );
      }}
      className="space-y-5 mt-6"
    >
      <p className="text-sm text-ink-muted">
        One topic per line:{" "}
        <code className="font-mono text-ink text-xs">
          English title | Indonesian title | Description
        </code>
      </p>
      <div>
        <label className="block text-[11px] font-semibold uppercase tracking-wider text-ink-muted mb-1.5">
          Topics ({lines.length} lines)
        </label>
        <textarea
          value={raw}
          onChange={(e) => setRaw(e.target.value)}
          rows={12}
          className="w-full px-4 py-3 font-mono text-xs leading-relaxed"
        />
      </div>
      <Feedback result={result} error={error} />
      <button type="submit" disabled={submitting} className="btn btn-primary">
        {submitting ? "Saving…" : "Add to pool"}
      </button>
    </form>
  );
}

function TablesBulk({ password }: { password: string }) {
  const [raw, setRaw] = useState("");
  const { submitting, result, error, run } = useSubmit();
  const blocks = raw.split(/\n\s*---\s*\n/).map((b) => b.trim()).filter(Boolean);

  const example = `Retail | Weekly sales at a supermarket, 2020–2023
| Year | Fruit | Dairy |
|------|-------|-------|
| 2020 | 120   | 90    |
| 2023 | 180   | 110   |
---
Banking | Online vs branch transactions
| Channel | 2019 | 2024 |
|---------|------|------|
| Online  | 40%  | 78%  |`;

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        run(
          "/api/tables/bulk",
          { password, raw },
          (d) =>
            `${d.inserted} tables added, ${d.skipped} already existed.` +
            (d.errors?.length ? ` ${d.errors.length} errors.` : "")
        );
      }}
      className="space-y-5 mt-6"
    >
      <p className="text-sm text-ink-muted">
        Each block starts with{" "}
        <code className="font-mono text-ink text-xs">Category | Title</code>,
        then the markdown table. Separate blocks with a line containing only{" "}
        <code className="font-mono text-ink text-xs">---</code>.
      </p>
      <div>
        <label className="block text-[11px] font-semibold uppercase tracking-wider text-ink-muted mb-1.5">
          Tables ({blocks.length} block{blocks.length === 1 ? "" : "s"})
        </label>
        <textarea
          value={raw}
          onChange={(e) => setRaw(e.target.value)}
          rows={14}
          placeholder={example}
          className="w-full px-4 py-3 font-mono text-xs leading-relaxed"
        />
      </div>
      <Feedback result={result} error={error} />
      <button type="submit" disabled={submitting} className="btn btn-primary">
        {submitting ? "Saving…" : "Add tables"}
      </button>
    </form>
  );
}

function FeaturedEssays({ password }: { password: string }) {
  const [raw, setRaw] = useState("");
  const [date, setDate] = useState(todayISO());
  const { submitting, result, error, run } = useSubmit();
  const lines = raw.split("\n").map((l) => l.trim()).filter(Boolean);

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        run(
          "/api/topics/featured",
          { password, date, raw },
          (d) =>
            `${d.inserted} new + ${d.refeatured} re-featured for ${d.date}.`
        );
      }}
      className="space-y-5 mt-6"
    >
      <p className="text-sm text-ink-muted">
        These essays replace the normal rotation on the chosen day. One per
        line:{" "}
        <code className="font-mono text-ink text-xs">
          English title | Indonesian title
        </code>
      </p>
      <div>
        <label className="block text-[11px] font-semibold uppercase tracking-wider text-ink-muted mb-1.5">
          Feature for date
        </label>
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="h-10 px-3 text-sm tabular"
        />
      </div>
      <div>
        <label className="block text-[11px] font-semibold uppercase tracking-wider text-ink-muted mb-1.5">
          Essays ({lines.length} line{lines.length === 1 ? "" : "s"})
        </label>
        <textarea
          value={raw}
          onChange={(e) => setRaw(e.target.value)}
          rows={10}
          className="w-full px-4 py-3 font-mono text-xs leading-relaxed"
        />
      </div>
      <Feedback result={result} error={error} />
      <button type="submit" disabled={submitting} className="btn btn-primary">
        {submitting ? "Saving…" : "Feature essays"}
      </button>
    </form>
  );
}
