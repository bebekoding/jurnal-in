"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { CaretDown } from "@phosphor-icons/react";

type Item = { href: string; label: string };
type Group = { label: string; items: Item[] };

const HOME: Item = { href: "/", label: "Home" };
const JOURNAL: Item = { href: "/new", label: "Journal" };

const GROUPS: Group[] = [
  {
    label: "Writing",
    items: [
      { href: "/tables", label: "Task 1" },
      { href: "/topics", label: "Task 2" },
    ],
  },
  {
    label: "Practice",
    items: [
      { href: "/reading", label: "Reading" },
      { href: "/vocab", label: "Vocab" },
    ],
  },
  {
    label: "Insights",
    items: [
      { href: "/stats", label: "Stats" },
      { href: "/export", label: "Recap" },
    ],
  },
];

export function Nav() {
  const pathname = usePathname();

  function isActive(href: string) {
    if (href === "/") return pathname === "/";
    return pathname.startsWith(href);
  }

  const linkClass = (active: boolean) =>
    `px-2.5 md:px-3 h-8 inline-flex items-center rounded-full font-medium transition ${
      active
        ? "bg-lime text-ink border border-ink shadow-hard-sm"
        : "text-ink-muted hover:text-ink"
    }`;

  return (
    <nav className="flex items-center gap-0.5 md:gap-1.5 text-sm">
      <Link href={HOME.href} className={linkClass(isActive(HOME.href))}>
        {HOME.label}
      </Link>
      <Link href={JOURNAL.href} className={linkClass(isActive(JOURNAL.href))}>
        {JOURNAL.label}
      </Link>

      {GROUPS.map((g) => (
        <DropdownMenu
          key={g.label}
          group={g}
          active={g.items.some((i) => isActive(i.href))}
          isActive={isActive}
          linkClass={linkClass}
        />
      ))}
    </nav>
  );
}

function DropdownMenu({
  group,
  active,
  isActive,
  linkClass,
}: {
  group: Group;
  active: boolean;
  isActive: (href: string) => boolean;
  linkClass: (active: boolean) => string;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function onClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", onClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="menu"
        aria-expanded={open}
        className={`${linkClass(active)} gap-1`}
      >
        {group.label}
        <CaretDown
          size={12}
          weight="bold"
          className={`transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 md:left-0 top-10 z-50 w-40 card bg-paper-raised p-1.5"
        >
          {group.items.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              role="menuitem"
              onClick={() => setOpen(false)}
              className={`block px-3 h-9 inline-flex w-full items-center rounded-md font-medium transition ${
                isActive(item.href)
                  ? "bg-lime text-ink"
                  : "text-ink-muted hover:bg-lime-soft hover:text-ink"
              }`}
            >
              {item.label}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
