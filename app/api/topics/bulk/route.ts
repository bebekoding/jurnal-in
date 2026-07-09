import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

function addDaysISO(iso: string, n: number): string {
  const d = new Date(iso + "T00:00:00Z");
  d.setUTCDate(d.getUTCDate() + n);
  return d.toISOString().slice(0, 10);
}

type IncomingTopic = { title: string; description?: string };

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  if (!body) return new NextResponse("Body invalid", { status: 400 });

  const adminPassword = process.env.ADMIN_PASSWORD;
  if (adminPassword) {
    if (body.password !== adminPassword) {
      return new NextResponse("Password admin salah", { status: 401 });
    }
  }

  const startDate: string | undefined = body.startDate;
  if (!startDate || !/^\d{4}-\d{2}-\d{2}$/.test(startDate)) {
    return new NextResponse("startDate wajib format YYYY-MM-DD", {
      status: 400,
    });
  }

  const rawTopics = Array.isArray(body.topics) ? body.topics : [];
  const topics: IncomingTopic[] = rawTopics
    .map((t: any) => {
      if (typeof t === "string") {
        const [title, ...rest] = t.split("|").map((s) => s.trim());
        return { title, description: rest.join(" | ") || undefined };
      }
      if (t && typeof t === "object") {
        return {
          title: String(t.title || "").trim(),
          description: t.description
            ? String(t.description).trim()
            : undefined,
        };
      }
      return { title: "" };
    })
    .filter((t: IncomingTopic) => t.title.length > 0 && t.title.length <= 300);

  if (topics.length === 0) {
    return new NextResponse("Tidak ada topik valid", { status: 400 });
  }
  if (topics.length > 90) {
    return new NextResponse("Maksimal 90 topik per submission", { status: 400 });
  }

  const data = topics.map((t, i) => {
    const dayOffset = Math.floor(i / 3);
    return {
      title: t.title,
      description: t.description ?? null,
      scheduledFor: new Date(addDaysISO(startDate, dayOffset) + "T00:00:00Z"),
    };
  });

  const created = await prisma.topic.createMany({ data });

  return NextResponse.json({
    inserted: created.count,
    startDate,
    endDate: addDaysISO(startDate, Math.ceil(topics.length / 3) - 1),
    perDay: 3,
  });
}
