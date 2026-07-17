"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Plus, Trash, Cards, BookOpen, ArrowRight, Books } from "@phosphor-icons/react";
import { useIdentity } from "@/components/Identity";
import { IDIOMS, IDIOM_CATEGORIES, type Idiom } from "@/lib/idioms";

type Vocab = {
  id: string;
  authorName: string;
  term: string;
  meaning: string | null;
  example: string | null;
  createdAt: string;
};

type Tab = "library" | "mine" | "quiz";

// A quiz card is anything with a term + a back (meaning/example).
type Card = { term: string; meaning: string | null; example: string | null };

export default function IdiomsPage() {
  const { name, ready } = useIdentity();
  const [items, setItems] = useState<Vocab[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<Tab>("library");

  const load = useCallback(async () => {
    if (!name) {
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`/api/vocab?author=${encodeURIComponent(name)}`);
      setItems(res.ok ? await res.json() : []);
    } finally {
      setLoading(false);
    }
  }, [name]);

  useEffect(() => {
    if (ready) load();
  }, [ready, name, load]);

  return (
    <div className="max-w-3xl space-y-8">
      <header>
        <h1 className="font-display text-[clamp(2.5rem,5vw,4rem)] leading-[0.98] tracking-tight text-ink">
          <span className="block" data-reveal>
            Idiom
          </span>
          <span
            className="block italic font-reading font-medium"
            data-reveal
            style={{ "--d": "90ms" } as React.CSSProperties}
          >
            &amp; phrase bank.
          </span>
        </h1>
        <p
          className="mt-4 text-ink-muted text-[15px]"
          data-reveal
          style={{ "--d": "180ms" } as React.CSSProperties}
        >
          A curated library of {IDIOMS.length} band 7–9 idioms and phrases —
          browse, add your own, and quiz yourself.
        </p>
      </header>

      <div className="flex flex-wrap gap-1.5" data-reveal>
        <TabButton active={tab === "library"} onClick={() => setTab("library")}>
          <Books size={15} weight="bold" /> Library ({IDIOMS.length})
        </TabButton>
        <TabButton active={tab === "mine"} onClick={() => setTab("mine")}>
          <BookOpen size={15} weight="bold" /> My idioms ({items.length})
        </TabButton>
        <TabButton active={tab === "quiz"} onClick={() => setTab("quiz")}>
          <Cards size={15} weight="bold" /> Quiz
        </TabButton>
      </div>

      {tab === "library" && <Library />}
      {tab === "mine" &&
        (ready && !name ? (
          <p className="text-sm text-ink-muted italic" data-reveal>
            Pick your name in the top bar to keep a personal list.
          </p>
        ) : (
          <MyIdioms items={items} loading={loading} name={name!} onChange={load} />
        ))}
      {tab === "quiz" && <Quiz personal={items} />}
    </div>
  );
}

function TabButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={`h-9 px-4 inline-flex items-center gap-1.5 rounded-full border-[1.5px] text-sm font-semibold transition ${
        active
          ? "bg-lime border-ink text-ink shadow-hard-sm"
          : "border-ink/25 text-ink-muted hover:border-ink"
      }`}
    >
      {children}
    </button>
  );
}

function Library() {
  const [cat, setCat] = useState<string>("All");
  const shown = useMemo(
    () => (cat === "All" ? IDIOMS : IDIOMS.filter((i) => i.category === cat)),
    [cat]
  );

  return (
    <div className="space-y-5" data-reveal>
      <div className="flex flex-wrap gap-1.5">
        <CatChip active={cat === "All"} onClick={() => setCat("All")}>
          All
        </CatChip>
        {IDIOM_CATEGORIES.map((c) => (
          <CatChip key={c} active={cat === c} onClick={() => setCat(c)}>
            {c}
          </CatChip>
        ))}
      </div>

      <ul className="space-y-2">
        {shown.map((idiom, i) => (
          <IdiomRow key={i} idiom={idiom} />
        ))}
      </ul>
    </div>
  );
}

function CatChip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={`h-7 px-2.5 rounded-full border text-[11px] font-semibold transition ${
        active
          ? "bg-lime border-ink text-ink"
          : "border-ink/20 text-ink-muted hover:border-ink"
      }`}
    >
      {children}
    </button>
  );
}

function IdiomRow({ idiom }: { idiom: Idiom }) {
  return (
    <li className="card p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="font-display text-lg text-ink">{idiom.word}</div>
        <span className="shrink-0 inline-flex items-center rounded-full border border-ink/20 px-2 h-6 text-[10px] font-semibold text-ink-muted tabular">
          band {idiom.band}
        </span>
      </div>
      <div className="text-sm text-ink-muted mt-0.5">{idiom.meaning}</div>
      <div className="text-sm font-reading italic text-ink-subtle mt-1">
        “{idiom.example}”
      </div>
      <div className="mt-2 text-[10px] uppercase tracking-widest text-ink-subtle font-semibold">
        {idiom.category}
      </div>
    </li>
  );
}

function MyIdioms({
  items,
  loading,
  name,
  onChange,
}: {
  items: Vocab[];
  loading: boolean;
  name: string;
  onChange: () => void;
}) {
  const [term, setTerm] = useState("");
  const [meaning, setMeaning] = useState("");
  const [example, setExample] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function add(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!term.trim()) return;
    setSaving(true);
    try {
      const res = await fetch("/api/vocab", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          authorName: name,
          term: term.trim(),
          meaning: meaning.trim() || undefined,
          example: example.trim() || undefined,
        }),
      });
      if (!res.ok) throw new Error(await res.text());
      setTerm("");
      setMeaning("");
      setExample("");
      onChange();
    } catch (err: any) {
      setError(err.message || "Failed to save.");
    } finally {
      setSaving(false);
    }
  }

  async function remove(id: string) {
    await fetch(
      `/api/vocab?id=${encodeURIComponent(id)}&author=${encodeURIComponent(name)}`,
      { method: "DELETE" }
    );
    onChange();
  }

  return (
    <div className="space-y-6" data-reveal>
      <form onSubmit={add} className="card p-5 space-y-3">
        <div className="grid sm:grid-cols-2 gap-3">
          <input
            value={term}
            onChange={(e) => setTerm(e.target.value)}
            placeholder="Idiom or phrase *"
            className="h-11 px-3 text-sm"
          />
          <input
            value={meaning}
            onChange={(e) => setMeaning(e.target.value)}
            placeholder="Meaning"
            className="h-11 px-3 text-sm"
          />
        </div>
        <input
          value={example}
          onChange={(e) => setExample(e.target.value)}
          placeholder="Example sentence (optional)"
          className="w-full h-11 px-3 text-sm"
        />
        {error && (
          <div className="text-xs text-accent font-semibold">{error}</div>
        )}
        <button
          type="submit"
          disabled={saving || !term.trim()}
          className="btn btn-primary h-10"
        >
          <Plus size={15} weight="bold" />
          {saving ? "Saving…" : "Add idiom"}
        </button>
      </form>

      {loading ? (
        <p className="text-sm text-ink-muted">Loading…</p>
      ) : items.length === 0 ? (
        <p className="text-sm text-ink-muted italic">
          No idioms of your own yet. Add one above, or study the Library.
        </p>
      ) : (
        <ul className="space-y-2">
          {items.map((v) => (
            <li key={v.id} className="card p-4 flex items-start gap-3">
              <div className="min-w-0 flex-1">
                <div className="font-display text-lg text-ink">{v.term}</div>
                {v.meaning && (
                  <div className="text-sm text-ink-muted mt-0.5">
                    {v.meaning}
                  </div>
                )}
                {v.example && (
                  <div className="text-sm font-reading italic text-ink-subtle mt-1">
                    “{v.example}”
                  </div>
                )}
              </div>
              <button
                onClick={() => remove(v.id)}
                className="shrink-0 text-ink-subtle hover:text-accent transition p-1"
                aria-label={`Delete ${v.term}`}
              >
                <Trash size={16} weight="bold" />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function Quiz({ personal }: { personal: Vocab[] }) {
  const [source, setSource] = useState<"library" | "mine" | "both">("library");

  const pool: Card[] = useMemo(() => {
    const lib: Card[] = IDIOMS.map((i) => ({
      term: i.word,
      meaning: i.meaning,
      example: i.example,
    }));
    const mine: Card[] = personal
      .filter((v) => v.meaning || v.example)
      .map((v) => ({ term: v.term, meaning: v.meaning, example: v.example }));
    if (source === "library") return lib;
    if (source === "mine") return mine;
    return [...lib, ...mine];
  }, [source, personal]);

  const [deck, setDeck] = useState<Card[]>([]);
  const [idx, setIdx] = useState(0);
  const [revealed, setRevealed] = useState(false);

  const start = useCallback(() => {
    setDeck(shuffle(pool));
    setIdx(0);
    setRevealed(false);
  }, [pool]);

  useEffect(() => {
    start();
  }, [start]);

  const card = deck[idx];
  const done = idx >= deck.length - 1;

  return (
    <div className="space-y-4" data-reveal>
      <div className="flex flex-wrap gap-1.5">
        <CatChip active={source === "library"} onClick={() => setSource("library")}>
          Library
        </CatChip>
        <CatChip active={source === "mine"} onClick={() => setSource("mine")}>
          My idioms
        </CatChip>
        <CatChip active={source === "both"} onClick={() => setSource("both")}>
          Both
        </CatChip>
      </div>

      {deck.length === 0 ? (
        <div className="card p-8 text-center text-ink-muted">
          Nothing to quiz here yet.
        </div>
      ) : card ? (
        <>
          <div className="flex items-center justify-between text-xs text-ink-muted tabular">
            <span>
              Card {idx + 1} / {deck.length}
            </span>
            <button onClick={start} className="link">
              Reshuffle
            </button>
          </div>

          <button
            onClick={() => setRevealed((r) => !r)}
            className="card bg-paper-raised w-full min-h-[220px] p-8 flex flex-col items-center justify-center text-center gap-4"
          >
            <div className="font-display text-2xl md:text-3xl text-ink">
              {card.term}
            </div>
            {revealed ? (
              <div className="space-y-2">
                {card.meaning && (
                  <div className="text-ink-muted">{card.meaning}</div>
                )}
                {card.example && (
                  <div className="font-reading italic text-ink-subtle">
                    “{card.example}”
                  </div>
                )}
              </div>
            ) : (
              <div className="text-xs uppercase tracking-widest text-ink-subtle">
                Tap to reveal
              </div>
            )}
          </button>

          <div className="flex justify-end">
            {done ? (
              <button onClick={start} className="btn btn-secondary">
                Restart deck
              </button>
            ) : (
              <button
                onClick={() => {
                  setRevealed(false);
                  setIdx((i) => i + 1);
                }}
                className="btn btn-primary"
              >
                Next
                <ArrowRight size={15} weight="bold" />
              </button>
            )}
          </div>
        </>
      ) : null}
    </div>
  );
}
