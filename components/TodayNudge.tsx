"use client";

import Link from "next/link";
import { PencilSimpleLine, CheckCircle, Flame } from "@phosphor-icons/react";
import { useIdentity } from "@/components/Identity";

type Activity = Record<string, { wroteToday: boolean; thisWeek: number }>;

export function TodayNudge({
  activity,
  streaks,
}: {
  activity: Activity;
  streaks: Record<string, number>;
}) {
  const { name, ready } = useIdentity();
  if (!ready || !name) return null;

  const mine = activity[name] ?? { wroteToday: false, thisWeek: 0 };
  const streak = streaks[name] ?? 0;

  if (mine.wroteToday) {
    return (
      <div
        className="card bg-lime-soft p-4 flex flex-wrap items-center gap-x-4 gap-y-1.5"
        data-reveal
      >
        <span className="inline-flex items-center gap-2 font-semibold text-ink">
          <CheckCircle size={18} weight="fill" className="text-accent" />
          You&apos;ve written today, {name}.
        </span>
        <span className="text-sm text-ink-muted tabular">
          {mine.thisWeek} {mine.thisWeek === 1 ? "entry" : "entries"} this week
          {streak > 0 && (
            <>
              {" · "}
              <span className="inline-flex items-center gap-1">
                <Flame size={13} weight="fill" className="text-accent" />
                {streak}-day streak
              </span>
            </>
          )}
        </span>
      </div>
    );
  }

  return (
    <div
      className="card bg-paper-raised p-4 flex flex-wrap items-center justify-between gap-x-4 gap-y-2"
      data-reveal
    >
      <span className="inline-flex items-center gap-2 text-ink">
        <Flame
          size={18}
          weight={streak > 0 ? "fill" : "regular"}
          className={streak > 0 ? "text-accent" : "text-ink-subtle"}
        />
        <span className="font-semibold">
          {streak > 0
            ? `Keep your ${streak}-day streak alive — nothing today yet.`
            : "You haven't written today."}
        </span>
        <span className="text-sm text-ink-muted tabular hidden sm:inline">
          {mine.thisWeek} this week
        </span>
      </span>
      <div className="flex items-center gap-2">
        <Link href="/new" className="btn btn-primary h-9">
          <PencilSimpleLine size={15} weight="bold" />
          Write now
        </Link>
        <Link href="/topics" className="btn btn-secondary h-9 hidden sm:inline-flex">
          Today&apos;s topic
        </Link>
      </div>
    </div>
  );
}
