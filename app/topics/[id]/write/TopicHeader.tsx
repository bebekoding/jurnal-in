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
    <section className="border-y border-ink py-8">
      <div className="flex items-start justify-between gap-4 mb-4">
        <span className="text-[10px] uppercase tracking-widest text-ink-subtle">
          Topik
        </span>
        {titleId && (
          <button
            type="button"
            onClick={() => setShow(!show)}
            className={`inline-flex items-center gap-1.5 text-[11px] px-2.5 h-7 border transition ${
              show
                ? "bg-ink text-paper border-ink"
                : "bg-paper-raised text-ink-muted border-rule hover:border-ink hover:text-ink"
            }`}
          >
            <Translate size={12} weight="regular" />
            {show ? "EN" : "ID"}
          </button>
        )}
      </div>
      <h1 className="font-display text-2xl md:text-3xl leading-tight text-ink max-w-2xl">
        {title}
      </h1>
      {show && titleId && (
        <p className="mt-4 pt-4 border-t border-rule font-reading italic text-[17px] text-ink-muted leading-relaxed max-w-2xl">
          {titleId}
        </p>
      )}
      {description && (
        <p className="mt-4 text-sm text-ink-muted leading-relaxed max-w-2xl">
          {description}
        </p>
      )}
    </section>
  );
}
