"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type GrammarFix = { original: string; corrected: string; explanation: string };
type VocabUpgrade = { original: string; suggestion: string; reason: string };

type Analysis = {
  bandScore: number;
  taskAchievement: number;
  coherence: number;
  lexical: number;
  grammar: number;
  summary: string;
  grammarFixes: GrammarFix[] | any;
  vocabUpgrades: VocabUpgrade[] | any;
  structureFeedback: string;
  improvedText: string;
};

export default function AnalysisPanel({
  journalId,
  initial,
}: {
  journalId: string;
  initial: Analysis | null;
}) {
  const router = useRouter();
  const [analysis, setAnalysis] = useState<Analysis | null>(initial);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [tab, setTab] = useState<"summary" | "grammar" | "vocab" | "structure" | "improved">("summary");

  async function analyze() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/journals/${journalId}/analyze`, {
        method: "POST",
      });
      if (!res.ok) throw new Error((await res.text()) || "Gagal menganalisis");
      const data = await res.json();
      setAnalysis(data);
      router.refresh();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  if (!analysis) {
    return (
      <section className="border border-dashed border-ink/20 rounded-lg p-6 text-center">
        <h2 className="font-serif text-xl font-semibold mb-1">
          Analisis Claude
        </h2>
        <p className="text-sm text-ink/60 mb-4">
          Dapatkan koreksi grammar, upgrade vocabulary ke band 7–9, feedback
          struktur, dan estimasi band score.
        </p>
        <button
          onClick={analyze}
          disabled={loading}
          className="bg-accent text-white px-5 py-2.5 rounded-full text-sm font-medium hover:opacity-90 disabled:opacity-50"
        >
          {loading ? "Menganalisis dengan Claude…" : "✨ Analisis dengan Claude"}
        </button>
        {error && (
          <div className="mt-3 text-xs text-red-700">{error}</div>
        )}
      </section>
    );
  }

  const grammarFixes: GrammarFix[] = Array.isArray(analysis.grammarFixes)
    ? analysis.grammarFixes
    : [];
  const vocabUpgrades: VocabUpgrade[] = Array.isArray(analysis.vocabUpgrades)
    ? analysis.vocabUpgrades
    : [];

  const tabs: { key: typeof tab; label: string; count?: number }[] = [
    { key: "summary", label: "Ringkasan" },
    { key: "grammar", label: "Grammar", count: grammarFixes.length },
    { key: "vocab", label: "Vocabulary", count: vocabUpgrades.length },
    { key: "structure", label: "Struktur" },
    { key: "improved", label: "Versi Perbaikan" },
  ];

  return (
    <section className="border border-ink/10 rounded-lg bg-white overflow-hidden">
      <div className="p-6 border-b border-ink/10 bg-gradient-to-br from-indigo-50 to-white">
        <div className="flex items-center justify-between">
          <h2 className="font-serif text-xl font-semibold">Analisis Claude</h2>
          <button
            onClick={analyze}
            disabled={loading}
            className="text-xs text-accent hover:underline disabled:opacity-50"
          >
            {loading ? "Menganalisis…" : "↻ Analisis ulang"}
          </button>
        </div>
        <div className="mt-4 grid grid-cols-5 gap-2 text-center">
          <ScoreBox label="Overall" value={analysis.bandScore} big />
          <ScoreBox label="Task" value={analysis.taskAchievement} />
          <ScoreBox label="Coherence" value={analysis.coherence} />
          <ScoreBox label="Lexical" value={analysis.lexical} />
          <ScoreBox label="Grammar" value={analysis.grammar} />
        </div>
      </div>

      <div className="border-b border-ink/10 flex overflow-x-auto">
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`px-4 py-2.5 text-sm whitespace-nowrap border-b-2 ${
              tab === t.key
                ? "border-accent text-accent font-medium"
                : "border-transparent text-ink/60 hover:text-ink"
            }`}
          >
            {t.label}
            {typeof t.count === "number" && (
              <span className="ml-1 text-xs text-ink/40">({t.count})</span>
            )}
          </button>
        ))}
      </div>

      <div className="p-6">
        {tab === "summary" && (
          <p className="text-sm leading-relaxed">{analysis.summary}</p>
        )}
        {tab === "grammar" && (
          <ul className="space-y-3">
            {grammarFixes.length === 0 && (
              <li className="text-sm text-ink/50 italic">
                Tidak ada koreksi grammar besar. Nice!
              </li>
            )}
            {grammarFixes.map((g, i) => (
              <li key={i} className="border-l-2 border-red-300 pl-3">
                <div className="text-sm">
                  <mark className="fix">{g.original}</mark>{" "}
                  <span className="text-ink/40">→</span>{" "}
                  <mark className="upgrade">{g.corrected}</mark>
                </div>
                <div className="text-xs text-ink/60 mt-1">{g.explanation}</div>
              </li>
            ))}
          </ul>
        )}
        {tab === "vocab" && (
          <ul className="space-y-3">
            {vocabUpgrades.length === 0 && (
              <li className="text-sm text-ink/50 italic">
                Vocabulary sudah cukup advanced.
              </li>
            )}
            {vocabUpgrades.map((v, i) => (
              <li key={i} className="border-l-2 border-emerald-300 pl-3">
                <div className="text-sm">
                  <mark className="fix">{v.original}</mark>{" "}
                  <span className="text-ink/40">→</span>{" "}
                  <mark className="upgrade">{v.suggestion}</mark>
                </div>
                <div className="text-xs text-ink/60 mt-1">{v.reason}</div>
              </li>
            ))}
          </ul>
        )}
        {tab === "structure" && (
          <p className="text-sm leading-relaxed whitespace-pre-wrap">
            {analysis.structureFeedback}
          </p>
        )}
        {tab === "improved" && (
          <div className="prose-journal">{analysis.improvedText}</div>
        )}
      </div>
    </section>
  );
}

function ScoreBox({
  label,
  value,
  big = false,
}: {
  label: string;
  value: number;
  big?: boolean;
}) {
  return (
    <div className="bg-white/70 rounded-md py-2 px-1 border border-ink/5">
      <div className={`font-serif font-bold text-accent ${big ? "text-3xl" : "text-lg"}`}>
        {value.toFixed(1)}
      </div>
      <div className="text-[10px] uppercase tracking-wider text-ink/50">
        {label}
      </div>
    </div>
  );
}
