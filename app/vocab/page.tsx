"use client";

import { useCallback, useEffect, useState } from "react";
import { Plus, Trash, Cards, BookOpen, ArrowRight } from "@phosphor-icons/react";
import { useIdentity } from "@/components/Identity";

type Vocab = {
  id: string;
  authorName: string;
  term: string;
  meaning: string | null;
  example: string | null;
  createdAt: string;
};

export default function VocabPage() {
  const { name, ready } = useIdentity();
  const [items, setItems] = useState<Vocab[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<"glossary" | "quiz">("glossary");

  const load = useCallback(async () => {
    if (!name) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/vocab?author=${encodeURIComponent(name)}`);
      setItems(res.ok ? await res.json() : []);
    } finally {
      setLoading(false);
    }
  }, [name]);

  useEffect(() => {
    if (ready && name) load();
    else if (ready) setLoading(false);
  }, [ready, name, load]);

  if (ready && !name) {
    return (
      <div className="max-w-xl py-16">
        <h1 className="font-display text-2xl text-ink">
          Pick your name in the top bar to use your glossary.
        </h1>
      </div>
    );
  }

  return (
    <div className="max-w-3xl space-y-8">
      <header>
        <h1 className="font-display text-[clamp(2.5rem,5vw,4rem)] leading-[0.98] tracking-tight text-ink">
          <span className="block" data-reveal>
            Vocabulary
          </span>
          <span
            className="block italic font-reading font-medium"
            data-reveal
            style={{ "--d": "90ms" } as React.CSSProperties}
          >
            glossary.
          </span>
        </h1>
        <p
          className="mt-4 text-ink-muted text-[15px]"
          data-reveal
          style={{ "--d": "180ms" } as React.CSSProperties}
        >
          Save band 7–9 words you meet in corrections and reading, then quiz
          yourself. {name}&apos;s personal list.
        </p>
      </header>

      <div className="flex gap-1.5" data-reveal>
        <TabButton active={tab === "glossary"} onClick={() => setTab("glossary")}>
          <BookOpen size={15} weight="bold" /> Glossary ({items.length})
        </TabButton>
        <TabButton active={tab === "quiz"} onClick={() => setTab("quiz")}>
          <Cards size={15} weight="bold" /> Quiz
        </TabButton>
      </div>

      {tab === "glossary" ? (
        <Glossary
          items={items}
          loading={loading}
          name={name!}
          onChange={load}
        />
      ) : (
        <Quiz items={items} />
      )}
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

function Glossary({
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
            placeholder="Word or phrase *"
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
          {saving ? "Saving…" : "Add word"}
        </button>
      </form>

      {loading ? (
        <p className="text-sm text-ink-muted">Loading…</p>
      ) : items.length === 0 ? (
        <p className="text-sm text-ink-muted italic">
          No words yet. Add the first one above.
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

function Quiz({ items }: { items: Vocab[] }) {
  const withMeaning = items.filter((v) => v.meaning || v.example);
  const [deck, setDeck] = useState<Vocab[]>([]);
  const [idx, setIdx] = useState(0);
  const [revealed, setRevealed] = useState(false);

  const start = useCallback(() => {
    setDeck(shuffle(withMeaning));
    setIdx(0);
    setRevealed(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [items]);

  useEffect(() => {
    start();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [items]);

  if (withMeaning.length === 0) {
    return (
      <div className="card p-8 text-center text-ink-muted" data-reveal>
        Add a few words with a meaning or example to start a quiz.
      </div>
    );
  }

  const card = deck[idx];
  if (!card) return null;
  const done = idx >= deck.length - 1;

  return (
    <div className="space-y-4" data-reveal>
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
        <div className="font-display text-3xl text-ink">{card.term}</div>
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
    </div>
  );
}
