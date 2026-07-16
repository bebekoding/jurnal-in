"use client";

import Link from "next/link";
import { useState, type ReactNode } from "react";
import { CaretDown, ArrowsClockwise } from "@phosphor-icons/react";
import { PARTICIPANTS } from "@/lib/participants";
import { useIdentity } from "@/components/Identity";
import { LogoMark, Wordmark, LogoLockup } from "@/components/Logo";
import { Nav } from "@/components/Nav";
import { Fx } from "@/components/Fx";

export function Shell({
  children,
  isBot = false,
}: {
  children: ReactNode;
  isBot?: boolean;
}) {
  const { name, ready, setName } = useIdentity();

  // Bots (link-preview crawlers, search engines) skip the identity gate
  // so they see the actual content and OG-relevant markup, not the picker.
  if (!isBot && !ready) {
    return (
      <div className="min-h-[100dvh] grid place-items-center">
        <LogoMark size={44} className="text-ink animate-pulse" />
      </div>
    );
  }

  if (!isBot && !name) {
    return <WelcomePicker onPick={setName} />;
  }

  return (
    <>
      <Fx />
      <header className="sticky top-0 z-30 border-b-[1.5px] border-ink bg-paper/90 backdrop-blur">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between gap-4">
          <Link href="/" className="shrink-0">
            <LogoLockup markSize={28} textClassName="text-xl" />
          </Link>
          <div className="flex items-center gap-3">
            <Nav />
            {!isBot && <WriterMenu />}
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-12 md:py-16">{children}</main>

      <footer className="border-t-[1.5px] border-ink mt-24 bg-paper-raised">
        <div className="max-w-6xl mx-auto px-6 py-6 flex items-center justify-between text-xs text-ink-muted">
          <Wordmark className="text-sm" />
          <span>IELTS writing practice, together.</span>
        </div>
      </footer>
    </>
  );
}

function WelcomePicker({ onPick }: { onPick: (n: string) => void }) {
  return (
    <div className="min-h-[100dvh] flex flex-col items-center justify-center px-6 py-16">
      <div className="w-full max-w-lg">
        <div className="flex flex-col items-center text-center">
          <LogoMark size={64} className="text-ink" />
          <h1 className="mt-6 font-display text-4xl md:text-5xl tracking-tight text-ink">
            Jurnal<span className="text-accent">.in</span>
          </h1>
          <p className="mt-3 text-ink-muted text-[15px]">
            IELTS writing practice, together. Who&apos;s writing today?
          </p>
        </div>

        <div className="mt-10 grid grid-cols-3 gap-3">
          {PARTICIPANTS.map((p) => (
            <button
              key={p}
              onClick={() => onPick(p)}
              className="card card-hover bg-paper-raised h-16 font-display text-lg text-ink hover:bg-lime-soft transition"
            >
              {p}
            </button>
          ))}
        </div>

        <p className="mt-6 text-center text-xs text-ink-subtle">
          You can switch anytime from the top bar.
        </p>
      </div>
    </div>
  );
}

function WriterMenu() {
  const { name, setName } = useIdentity();
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        className="inline-flex items-center gap-1.5 h-8 pl-3 pr-2 rounded-full border-[1.5px] border-ink bg-lime text-ink text-xs font-semibold shadow-hard-sm"
      >
        {name}
        <CaretDown size={12} weight="bold" />
      </button>

      {open && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setOpen(false)}
            aria-hidden
          />
          <div className="absolute right-0 top-10 z-50 w-44 card bg-paper-raised p-2">
            <div className="px-2 py-1.5 text-[10px] uppercase tracking-widest text-ink-subtle inline-flex items-center gap-1">
              <ArrowsClockwise size={11} weight="bold" />
              Switch writer
            </div>
            <div className="grid grid-cols-2 gap-1">
              {PARTICIPANTS.map((p) => (
                <button
                  key={p}
                  onClick={() => {
                    setName(p);
                    setOpen(false);
                  }}
                  className={`h-8 rounded-md text-sm font-medium transition ${
                    p === name
                      ? "bg-lime text-ink"
                      : "text-ink-muted hover:bg-lime-soft hover:text-ink"
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
