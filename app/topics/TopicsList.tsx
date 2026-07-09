"use client";

import Link from "next/link";
import { useState } from "react";
import { Translate, ArrowRight } from "@phosphor-icons/react";

type Topic = {
  id: string;
  title: string;
  titleId: string | null;
  description: string | null;
  _count: { journals: number };
};

export default function TopicsList({ topics }: { topics: Topic[] }) {
  const [showTranslation, setShowTranslation] = useState(false);
  const hasAnyTranslation = topics.some((t) => t.titleId);

  return (
    <div>
      {hasAnyTranslation && (
        <div className="flex justify-end mb-4">
          <button
            onClick={() => setShowTranslation(!showTranslation)}
            className={`inline-flex items-center gap-1.5 text-xs px-3 h-8 border transition ${
              showTranslation
                ? "bg-ink text-paper border-ink"
                : "bg-paper-raised text-ink-muted border-rule hover:border-ink hover:text-ink"
            }`}
          >
            <Translate size={14} weight="regular" />
            {showTranslation ? "Sembunyikan Indonesia" : "Tampilkan Indonesia"}
          </button>
        </div>
      )}

      <ul className="grid md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-rule border-y border-rule">
        {topics.map((t, i) => (
          <li
            key={t.id}
            className="group relative bg-paper-raised md:bg-transparent"
          >
            <Link
              href={`/topics/${t.id}/write`}
              className="flex flex-col h-full p-6 md:p-8 hover:bg-paper-raised transition"
            >
              <div className="flex items-baseline justify-between mb-6">
                <span className="font-display text-5xl text-ink tabular">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span className="text-[10px] uppercase tracking-widest text-ink-subtle tabular">
                  {t._count.journals} setoran
                </span>
              </div>

              <h3 className="font-display text-lg leading-snug text-ink group-hover:text-accent transition">
                {t.title}
              </h3>

              {showTranslation && t.titleId && (
                <p className="mt-3 pt-3 border-t border-rule text-sm text-ink-muted font-reading italic leading-relaxed">
                  {t.titleId}
                </p>
              )}

              {t.description && (
                <p className="mt-3 text-sm text-ink-muted leading-relaxed">
                  {t.description}
                </p>
              )}

              <div className="mt-auto pt-6 flex items-center gap-1.5 text-sm text-ink group-hover:text-accent transition">
                Tulis jawaban
                <ArrowRight
                  size={14}
                  weight="regular"
                  className="group-hover:translate-x-0.5 transition"
                />
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
