export function wordCount(text: string): number {
  return text.trim().split(/\s+/).filter(Boolean).length;
}

export function sentenceCount(text: string): number {
  const m = text.trim().match(/[^.!?\n]+[.!?]+/g);
  return m ? m.length : 0;
}

export function paragraphCount(text: string): number {
  return text
    .trim()
    .split(/\n\s*\n+/)
    .filter((p) => p.trim().length > 0).length;
}
