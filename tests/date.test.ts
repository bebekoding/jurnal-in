import { describe, it, expect } from "vitest";
import { parseWrittenAt, addDaysISO, formatDateLong } from "@/lib/date";

describe("parseWrittenAt", () => {
  it("rejects non-strings and malformed dates", () => {
    expect(parseWrittenAt(null)).toBeNull();
    expect(parseWrittenAt(123)).toBeNull();
    expect(parseWrittenAt("2026/07/17")).toBeNull();
    expect(parseWrittenAt("not-a-date")).toBeNull();
  });

  it("rejects future dates", () => {
    const future = addDaysISO(new Date().toISOString().slice(0, 10), 5);
    expect(parseWrittenAt(future)).toBeNull();
  });

  it("rejects dates older than 90 days", () => {
    const old = addDaysISO(new Date().toISOString().slice(0, 10), -120);
    expect(parseWrittenAt(old)).toBeNull();
  });

  it("accepts a valid recent date at noon UTC", () => {
    const recent = addDaysISO(new Date().toISOString().slice(0, 10), -3);
    const d = parseWrittenAt(recent);
    expect(d).toBeInstanceOf(Date);
    expect(d?.toISOString()).toContain("T12:00:00");
  });
});

describe("addDaysISO", () => {
  it("adds and subtracts days across month boundaries", () => {
    expect(addDaysISO("2026-07-01", -1)).toBe("2026-06-30");
    expect(addDaysISO("2026-07-31", 1)).toBe("2026-08-01");
    expect(addDaysISO("2026-12-31", 1)).toBe("2027-01-01");
  });
});

describe("formatDateLong", () => {
  it("formats an ISO date as a long readable string", () => {
    expect(formatDateLong("2026-07-17")).toBe("17 July 2026");
  });
});
