"use client";

import { useState } from "react";
import { Translate } from "@phosphor-icons/react";

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
    <section className="card bg-lime-soft p-6 md:p-8" data-reveal>
      <div className="flex items-start justify-between gap-4 mb-3">
        <span className="text-[10px] uppercase tracking-widest font-semibold text-ink-muted">
          Topik
        </span>
        {titleId && (
          <button
            type="button"
            onClick={() => setShow(!show)}
            className={`btn h-8 px-3 text-[11px] ${
              show ? "btn-ink" : "btn-secondary"
            }`}
          >
            <Translate size={12} weight="bold" />
            {show ? "EN" : "ID"}
          </button>
        )}
      </div>
      <h1 className="font-display text-2xl md:text-3xl leading-tight text-ink">
        {title}
      </h1>
      {show && titleId && (
        <p className="mt-4 pt-4 border-t border-ink/15 font-reading italic text-[17px] text-ink-muted leading-relaxed">
          {titleId}
        </p>
      )}
      {description && (
        <p className="mt-4 text-sm text-ink-muted leading-relaxed">
          {description}
        </p>
      )}
    </section>
  );
}
