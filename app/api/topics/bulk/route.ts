import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

type IncomingTopic = {
  title: string;
  titleId?: string;
  description?: string;
};

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  if (!body) return new NextResponse("Invalid body", { status: 400 });

  const adminPassword = process.env.ADMIN_PASSWORD;
  if (adminPassword) {
    if (body.password !== adminPassword) {
      return new NextResponse("Wrong admin password", { status: 401 });
    }
  }

  const startDate: string =
    typeof body.startDate === "string" &&
    /^\d{4}-\d{2}-\d{2}$/.test(body.startDate)
      ? body.startDate
      : new Date().toISOString().slice(0, 10);

  const rawTopics = Array.isArray(body.topics) ? body.topics : [];
  const topics: IncomingTopic[] = rawTopics
    .map((t: any) => {
      if (typeof t === "string") {
        const parts = t.split("|").map((s) => s.trim());
        return {
          title: parts[0] || "",
          titleId: parts[1] || undefined,
          description: parts[2] || undefined,
        };
      }
      if (t && typeof t === "object") {
        return {
          title: String(t.title || "").trim(),
          titleId: t.titleId ? String(t.titleId).trim() : undefined,
          description: t.description
            ? String(t.description).trim()
            : undefined,
        };
      }
      return { title: "" };
    })
    .filter((t: IncomingTopic) => t.title.length > 0 && t.title.length <= 500);

  if (topics.length === 0) {
    return new NextResponse("No valid topics", { status: 400 });
  }
  if (topics.length > 90) {
    return new NextResponse("Maximum 90 topics per submission", { status: 400 });
  }

  const scheduledFor = new Date(startDate + "T00:00:00Z");
  const data = topics.map((t) => ({
    title: t.title,
    titleId: t.titleId ?? null,
    description: t.description ?? null,
    scheduledFor,
  }));

  const created = await prisma.topic.createMany({ data });

  return NextResponse.json({
    inserted: created.count,
    pool: true,
  });
}
