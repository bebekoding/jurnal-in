import { describe, it, expect, vi, afterEach } from "vitest";
import { computeStreak, streaksByAuthor } from "@/lib/streak";

// Build a Date n days before "now".
function daysAgo(n: number): Date {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d;
}

afterEach(() => vi.useRealTimers());

describe("computeStreak", () => {
  it("returns 0 for no entries", () => {
    expect(computeStreak([])).toBe(0);
  });

  it("counts consecutive days ending today", () => {
    expect(computeStreak([daysAgo(0), daysAgo(1), daysAgo(2)])).toBe(3);
  });

  it("grace day: streak continues from yesterday if nothing today yet", () => {
    expect(computeStreak([daysAgo(1), daysAgo(2), daysAgo(3)])).toBe(3);
  });

  it("breaks on a gap", () => {
    // today + a gap at day 1 and 2, then day 3
    expect(computeStreak([daysAgo(0), daysAgo(3)])).toBe(1);
  });

  it("dedupes multiple entries on the same day", () => {
    expect(computeStreak([daysAgo(0), daysAgo(0), daysAgo(1)])).toBe(2);
  });

  it("returns 0 when the latest entry is older than yesterday", () => {
    expect(computeStreak([daysAgo(5), daysAgo(6)])).toBe(0);
  });
});

describe("streaksByAuthor", () => {
  it("buckets entries by author", () => {
    const dict = streaksByAuthor([
      { authorName: "Ivan", createdAt: daysAgo(0) },
      { authorName: "Ivan", createdAt: daysAgo(1) },
      { authorName: "Rafa", createdAt: daysAgo(1) },
      { authorName: "Fadli", createdAt: daysAgo(10) },
    ]);
    expect(dict.Ivan).toBe(2);
    expect(dict.Rafa).toBe(1); // grace day
    expect(dict.Fadli).toBe(0); // too old
  });
});
