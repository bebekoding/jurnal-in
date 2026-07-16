"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const ITEMS = [
  { href: "/", label: "Home" },
  { href: "/new", label: "Journal" },
  { href: "/topics", label: "Essay" },
  { href: "/tables", label: "Table" },
  { href: "/export", label: "Recap" },
];

export function Nav() {
  const pathname = usePathname();

  function isActive(href: string) {
    if (href === "/") return pathname === "/";
    return pathname.startsWith(href);
  }

  return (
    <nav className="flex items-center gap-0.5 md:gap-1.5 text-sm">
      {ITEMS.map((item) => {
        const active = isActive(item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`px-2.5 md:px-3 h-8 inline-flex items-center rounded-full font-medium transition ${
              active
                ? "bg-lime text-ink border border-ink shadow-hard-sm"
                : "text-ink-muted hover:text-ink"
            }`}
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
