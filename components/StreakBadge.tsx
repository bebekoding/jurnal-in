"use client";

import { Flame } from "@phosphor-icons/react";
import { useIdentity } from "@/components/Identity";

type TopEntry = { name: string; days: number };

export function StreakBadge({
  dict,
  top,
}: {
  dict: Record<string, number>;
  top: TopEntry[];
}) {
  const { name } = useIdentity();
  const personal = name ? dict[name] ?? 0 : 0;
  const leader = top[0];

  return (
    <div className="mt-4 pt-4 border-t border-ink/15">
      {name && personal > 0 ? (
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Flame
              size={18}
              weight="fill"
              className="text-accent shrink-0"
              aria-hidden
            />
            <div className="tabular">
              <span className="font-display text-2xl text-ink">{personal}</span>
              <span className="text-xs text-ink-muted ml-1.5">
                day{personal === 1 ? "" : "s"} in a row
              </span>
            </div>
          </div>
          {leader && leader.name !== name && (
            <span className="text-[11px] text-ink-subtle tabular">
              {leader.name} · {leader.days}
            </span>
          )}
        </div>
      ) : leader ? (
        <div className="flex items-center gap-2">
          <Flame
            size={16}
            weight="fill"
            className="text-accent shrink-0"
            aria-hidden
          />
          <span className="text-xs text-ink-muted">
            <span className="font-semibold text-ink">{leader.name}</span> leads
            with{" "}
            <span className="font-semibold text-ink tabular">
              {leader.days}
            </span>{" "}
            day{leader.days === 1 ? "" : "s"}
          </span>
        </div>
      ) : (
        <div className="flex items-center gap-2 text-xs text-ink-subtle">
          <Flame size={16} weight="regular" className="shrink-0" aria-hidden />
          No streaks yet — write today to start one.
        </div>
      )}
    </div>
  );
}
