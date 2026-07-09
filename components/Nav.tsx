"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const ITEMS = [
  { href: "/", label: "Beranda" },
  { href: "/new", label: "Jurnal" },
  { href: "/topics", label: "Topik" },
  { href: "/export", label: "Rekap" },
];

export function Nav() {
  const pathname = usePathname();

  function isActive(href: string) {
    if (href === "/") return pathname === "/";
    return pathname.startsWith(href);
  }

  return (
    <nav className="flex items-center gap-6 md:gap-8 text-sm">
      {ITEMS.map((item) => {
        const active = isActive(item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`relative py-1 transition ${
              active ? "text-ink" : "text-ink-muted hover:text-ink"
            }`}
          >
            {item.label}
            {active && (
              <span className="absolute left-0 right-0 -bottom-[2px] h-[2px] bg-accent" />
            )}
          </Link>
        );
      })}
    </nav>
  );
}
