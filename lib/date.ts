const TZ = "Asia/Jakarta";

export function todayJakartaISO(): string {
  const now = new Date();
  const jakarta = new Date(now.toLocaleString("en-US", { timeZone: TZ }));
  const y = jakarta.getFullYear();
  const m = String(jakarta.getMonth() + 1).padStart(2, "0");
  const d = String(jakarta.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export function formatDateLong(iso: string | Date): string {
  const d = typeof iso === "string" ? new Date(iso + "T00:00:00") : iso;
  return d.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: TZ,
  });
}

export function isoDateJakarta(d: Date): string {
  const jakarta = new Date(d.toLocaleString("en-US", { timeZone: TZ }));
  const y = jakarta.getFullYear();
  const m = String(jakarta.getMonth() + 1).padStart(2, "0");
  const day = String(jakarta.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export function addDaysISO(iso: string, n: number): string {
  const d = new Date(iso + "T00:00:00");
  d.setDate(d.getDate() + n);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${dd}`;
}

/**
 * Parse a yyyy-mm-dd string from a form input into a UTC-noon Date so the day
 * survives Jakarta timezone shifts either way. Returns null on invalid input,
 * future dates, or dates more than 90 days in the past.
 */
export function parseWrittenAt(input: unknown): Date | null {
  if (typeof input !== "string") return null;
  if (!/^\d{4}-\d{2}-\d{2}$/.test(input)) return null;

  const today = todayJakartaISO();
  const earliest = addDaysISO(today, -90);
  if (input > today) return null;
  if (input < earliest) return null;

  // Noon UTC anchors the date safely inside a single Jakarta calendar day.
  const d = new Date(`${input}T12:00:00Z`);
  if (Number.isNaN(d.getTime())) return null;
  return d;
}
