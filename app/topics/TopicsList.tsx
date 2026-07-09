"use client";

import Link from "next/link";
import { useState } from "react";

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
    <>
      {hasAnyTranslation && (
        <div className="flex justify-end -mt-4 mb-2">
          <button
            onClick={() => setShowTranslation(!showTranslation)}
            className={`text-xs px-3 py-1.5 rounded-full border transition ${
              showTranslation
                ? "bg-accent text-white border-accent"
                : "bg-white text-ink/60 border-ink/20 hover:border-accent hover:text-accent"
            }`}
          >
            {showTranslation ? "🇬🇧 Sembunyikan terjemahan" : "🇮🇩 Tampilkan terjemahan"}
          </button>
        </div>
      )}

      <ul className="grid gap-4 md:grid-cols-3">
        {topics.map((t, i) => (
          <li key={t.id}>
            <div className="border border-ink/10 rounded-lg p-5 bg-white h-full flex flex-col">
              <div className="text-xs text-accent uppercase tracking-widest mb-2">
                Topik {i + 1}
              </div>
              <h2 className="font-serif text-lg font-semibold leading-snug mb-2">
                {t.title}
              </h2>
              {showTranslation && t.titleId && (
                <p className="text-sm text-ink/60 italic border-l-2 border-indigo-200 pl-3 mb-2">
                  {t.titleId}
                </p>
              )}
              {t.description && (
                <p className="text-sm text-ink/70 leading-relaxed mb-3">
                  {t.description}
                </p>
              )}
              <div className="mt-auto pt-3 flex items-center justify-between text-xs">
                <span className="text-ink/50">
                  ✍️ {t._count.journals} setoran
                </span>
                <Link
                  href={`/topics/${t.id}/write`}
                  className="bg-ink text-paper px-3 py-1.5 rounded-full font-medium hover:bg-accent transition"
                >
                  Tulis →
                </Link>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </>
  );
}
