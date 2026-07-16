import { isoDateJakarta, todayJakartaISO, addDaysISO } from "@/lib/date";

/**
 * Count consecutive writing days ending today (Jakarta TZ).
 * If the user hasn't written today yet but wrote yesterday, the streak
 * still counts from yesterday backwards — same grace-day rule as Duolingo.
 */
export function computeStreak(dates: Date[]): number {
  if (dates.length === 0) return 0;

  const days = new Set(dates.map(isoDateJakarta));
  const today = todayJakartaISO();

  let cursor = days.has(today) ? today : addDaysISO(today, -1);
  if (!days.has(cursor)) return 0;

  let count = 0;
  while (days.has(cursor)) {
    count++;
    cursor = addDaysISO(cursor, -1);
  }
  return count;
}

export function streaksByAuthor(
  entries: { authorName: string; createdAt: Date }[]
): Record<string, number> {
  const buckets: Record<string, Date[]> = {};
  for (const e of entries) {
    (buckets[e.authorName] ||= []).push(e.createdAt);
  }
  const out: Record<string, number> = {};
  for (const [name, list] of Object.entries(buckets)) {
    out[name] = computeStreak(list);
  }
  return out;
}
