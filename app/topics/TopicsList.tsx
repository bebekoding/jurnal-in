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

const CARD_TINTS = ["bg-lime-soft", "bg-paper-raised", "bg-accent-soft"];

export default function TopicsList({ topics }: { topics: Topic[] }) {
  const [showTranslation, setShowTranslation] = useState(false);
  const hasAnyTranslation = topics.some((t) => t.titleId);

  return (
    <div>
      {hasAnyTranslation && (
        <div className="flex justify-end mb-5" data-reveal>
          <button
            onClick={() => setShowTranslation(!showTranslation)}
            className={`btn h-9 px-4 text-xs ${
              showTranslation ? "btn-ink" : "btn-secondary"
            }`}
          >
            <Translate size={14} weight="bold" />
            {showTranslation ? "Hide Indonesian" : "Show Indonesian"}
          </button>
        </div>
      )}

      <ul className="grid md:grid-cols-3 gap-6">
        {topics.map((t, i) => (
          <li
            key={t.id}
            data-reveal
            style={{ "--d": `${i * 100}ms` } as React.CSSProperties}
          >
            <Link
              href={`/topics/${t.id}/write`}
              className={`card group flex flex-col h-full p-6 ${CARD_TINTS[i % 3]}`}
            >
              <div className="flex items-baseline justify-between mb-5">
                <span className="font-display text-4xl text-ink tabular">
                  {String(i + 1).padStart(2, "0")}
                </span>
                {t._count.journals === 0 ? (
                  <span className="text-[10px] uppercase tracking-widest font-semibold text-accent tabular">
                    Unused
                  </span>
                ) : (
                  <span className="text-[10px] uppercase tracking-widest text-ink-muted tabular">
                    {t._count.journals} essays
                  </span>
                )}
              </div>

              <h3 className="font-display text-lg leading-snug text-ink">
                {t.title}
              </h3>

              {showTranslation && t.titleId && (
                <p className="mt-3 pt-3 border-t border-ink/15 text-sm text-ink-muted font-reading italic leading-relaxed">
                  {t.titleId}
                </p>
              )}

              {t.description && (
                <p className="mt-3 text-sm text-ink-muted leading-relaxed">
                  {t.description}
                </p>
              )}

              <div className="mt-auto pt-6 inline-flex items-center gap-1.5 text-sm font-semibold text-ink">
                Write essay
                <ArrowRight
                  size={14}
                  weight="bold"
                  className="group-hover:translate-x-1 transition-transform"
                />
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
