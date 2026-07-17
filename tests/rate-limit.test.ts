import { describe, it, expect, vi, afterEach } from "vitest";
import { rateLimit, clientIp } from "@/lib/rate-limit";

afterEach(() => vi.useRealTimers());

describe("rateLimit", () => {
  it("allows up to max within the window, then blocks", () => {
    const key = `t-${Math.random()}`;
    for (let i = 0; i < 3; i++) {
      expect(rateLimit(key, 3, 60_000).ok).toBe(true);
    }
    const blocked = rateLimit(key, 3, 60_000);
    expect(blocked.ok).toBe(false);
    expect(blocked.retryAfter).toBeGreaterThan(0);
  });

  it("recovers after the window elapses", () => {
    vi.useFakeTimers();
    const key = `t-${Math.random()}`;
    expect(rateLimit(key, 1, 1000).ok).toBe(true);
    expect(rateLimit(key, 1, 1000).ok).toBe(false);
    vi.advanceTimersByTime(1100);
    expect(rateLimit(key, 1, 1000).ok).toBe(true);
  });

  it("keys are independent", () => {
    expect(rateLimit(`a-${Math.random()}`, 1, 60_000).ok).toBe(true);
    expect(rateLimit(`b-${Math.random()}`, 1, 60_000).ok).toBe(true);
  });
});

describe("clientIp", () => {
  it("takes the first x-forwarded-for value", () => {
    const req = new Request("http://x", {
      headers: { "x-forwarded-for": "1.2.3.4, 5.6.7.8" },
    });
    expect(clientIp(req)).toBe("1.2.3.4");
  });

  it("falls back to unknown", () => {
    expect(clientIp(new Request("http://x"))).toBe("unknown");
  });
});
