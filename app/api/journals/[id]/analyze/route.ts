import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { anthropic, CLAUDE_MODEL } from "@/lib/anthropic";

export const maxDuration = 60;

const SYSTEM_PROMPT = `You are an IELTS Writing examiner and coach. You evaluate essays according to the IELTS Writing Task 2 band descriptors (Task Response, Coherence & Cohesion, Lexical Resource, Grammatical Range & Accuracy).

For each essay you receive, produce a structured analysis that:
1. Gives an honest estimated band score for each criterion (0.0 to 9.0, in 0.5 increments) and an overall band.
2. Lists concrete grammar corrections (be specific — quote the exact original phrase from the essay and the corrected version).
3. Suggests vocabulary upgrades: replace common/basic words with more advanced, academic, or precise alternatives suitable for band 7–9. Quote the exact original word/phrase.
4. Provides structural feedback: paragraphing, topic sentences, cohesive devices, argument development.
5. Rewrites the essay as an improved version at approximately band 8 level, preserving the writer's ideas and voice.

You MUST respond with ONLY valid JSON matching this schema (no markdown, no code fences):
{
  "bandScore": number,
  "taskAchievement": number,
  "coherence": number,
  "lexical": number,
  "grammar": number,
  "summary": string,
  "grammarFixes": [{ "original": string, "corrected": string, "explanation": string }],
  "vocabUpgrades": [{ "original": string, "suggestion": string, "reason": string }],
  "structureFeedback": string,
  "improvedText": string
}

Keep grammarFixes and vocabUpgrades to the 8 highest-impact items each. The "summary" should be 2-3 sentences of encouraging but honest overall feedback in English.`;

function extractJson(text: string): any {
  const trimmed = text.trim();
  try {
    return JSON.parse(trimmed);
  } catch {}
  const start = trimmed.indexOf("{");
  const end = trimmed.lastIndexOf("}");
  if (start >= 0 && end > start) {
    return JSON.parse(trimmed.slice(start, end + 1));
  }
  throw new Error("Claude did not return valid JSON");
}

export async function POST(
  _req: Request,
  { params }: { params: { id: string } }
) {
  if (!process.env.ANTHROPIC_API_KEY) {
    return new NextResponse(
      "ANTHROPIC_API_KEY belum diset di environment variables.",
      { status: 500 }
    );
  }

  const journal = await prisma.journal.findUnique({
    where: { id: params.id },
  });
  if (!journal) return new NextResponse("Jurnal tidak ditemukan", { status: 404 });

  try {
    const message = await anthropic.messages.create({
      model: CLAUDE_MODEL,
      max_tokens: 4000,
      system: SYSTEM_PROMPT,
      messages: [
        {
          role: "user",
          content: `Title: ${journal.title}\n\nEssay:\n${journal.content}`,
        },
      ],
    });

    const textBlock = message.content.find((b) => b.type === "text");
    if (!textBlock || textBlock.type !== "text") {
      return new NextResponse("Claude tidak mengembalikan teks", { status: 502 });
    }

    const parsed = extractJson(textBlock.text);

    const clamp = (n: any) => {
      const v = Number(n);
      if (!Number.isFinite(v)) return 0;
      return Math.max(0, Math.min(9, v));
    };

    const data = {
      bandScore: clamp(parsed.bandScore),
      taskAchievement: clamp(parsed.taskAchievement),
      coherence: clamp(parsed.coherence),
      lexical: clamp(parsed.lexical),
      grammar: clamp(parsed.grammar),
      summary: String(parsed.summary ?? "").slice(0, 4000),
      grammarFixes: Array.isArray(parsed.grammarFixes)
        ? parsed.grammarFixes.slice(0, 20)
        : [],
      vocabUpgrades: Array.isArray(parsed.vocabUpgrades)
        ? parsed.vocabUpgrades.slice(0, 20)
        : [],
      structureFeedback: String(parsed.structureFeedback ?? "").slice(0, 8000),
      improvedText: String(parsed.improvedText ?? "").slice(0, 20000),
    };

    const analysis = await prisma.analysis.upsert({
      where: { journalId: params.id },
      create: { journalId: params.id, ...data },
      update: data,
    });

    return NextResponse.json(analysis);
  } catch (err: any) {
    console.error("analyze error", err);
    return new NextResponse(
      err?.message || "Gagal menganalisis dengan Claude",
      { status: 500 }
    );
  }
}
