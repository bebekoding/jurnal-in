"use client";

import { useState } from "react";

export default function TopicHeader({
  title,
  titleId,
  description,
}: {
  title: string;
  titleId: string | null;
  description: string | null;
}) {
  const [show, setShow] = useState(false);

  return (
    <section className="border border-ink/10 rounded-lg p-6 bg-white">
      <div className="flex items-start justify-between gap-3 mb-1">
        <div className="text-xs uppercase tracking-widest text-accent">
          Topik
        </div>
        {titleId && (
          <button
            type="button"
            onClick={() => setShow(!show)}
            className={`text-[11px] px-2 py-1 rounded-full border transition ${
              show
                ? "bg-accent text-white border-accent"
                : "bg-white text-ink/60 border-ink/20 hover:border-accent hover:text-accent"
            }`}
          >
            {show ? "🇬🇧 EN" : "🇮🇩 Terjemah"}
          </button>
        )}
      </div>
      <h1 className="font-serif text-2xl font-bold leading-snug mb-2">
        {title}
      </h1>
      {show && titleId && (
        <p className="text-sm text-ink/60 italic border-l-2 border-indigo-200 pl-3 mb-2">
          {titleId}
        </p>
      )}
      {description && (
        <p className="text-sm text-ink/70 leading-relaxed">{description}</p>
      )}
    </section>
  );
}
