import { describe, it, expect } from "vitest";
import {
  READING_SETS,
  scoreSet,
  allQuestions,
  bandForRaw,
  isCorrect,
  normalizeAnswer,
} from "@/lib/reading-sets";

const set = READING_SETS[0];

describe("reading scoring", () => {
  it("has 40 questions", () => {
    expect(allQuestions(set)).toHaveLength(40);
  });

  it("perfect answers score 40 → band 9.0", () => {
    const perfect: Record<string, string> = {};
    for (const q of allQuestions(set)) perfect[String(q.n)] = q.answer;
    const s = scoreSet(set, perfect);
    expect(s.raw).toBe(40);
    expect(s.band).toBe("9.0");
  });

  it("empty answers score 0 → Below 5.0", () => {
    const s = scoreSet(set, {});
    expect(s.raw).toBe(0);
    expect(s.band).toBe("Below 5.0");
  });

  it("tolerates case, spacing, punctuation, and articles in text answers", () => {
    const perfect: Record<string, string> = {};
    for (const q of allQuestions(set)) perfect[String(q.n)] = q.answer;
    const messy = {
      ...perfect,
      "11": "  Calderas. ",
      "12": "sulfur dioxide and ash",
      "23": "User Behavior",
      "38": "accounting",
    };
    expect(scoreSet(set, messy).raw).toBe(40);
  });

  it("TFNG matching is exact after normalization", () => {
    const q1 = allQuestions(set)[0]; // answer FALSE
    expect(isCorrect(q1, "false")).toBe(true);
    expect(isCorrect(q1, "FALSE")).toBe(true);
    expect(isCorrect(q1, "true")).toBe(false);
    expect(isCorrect(q1, "")).toBe(false);
    expect(isCorrect(q1, undefined)).toBe(false);
  });

  it("normalizeAnswer strips articles and punctuation", () => {
    expect(normalizeAnswer("The Caldera!")).toBe("caldera");
    expect(normalizeAnswer("a  vector")).toBe("vector");
  });
});

describe("bandForRaw boundaries", () => {
  const cases: [number, string][] = [
    [40, "9.0"],
    [39, "9.0"],
    [38, "8.5"],
    [37, "8.5"],
    [36, "8.0"],
    [34, "7.5"],
    [32, "7.0"],
    [30, "7.0"],
    [29, "6.5"],
    [26, "6.0"],
    [22, "5.5"],
    [18, "5.0"],
    [14, "Below 5.0"],
    [0, "Below 5.0"],
  ];
  it.each(cases)("raw %i → band %s", (raw, band) => {
    expect(bandForRaw(raw).band).toBe(band);
  });
});
