import { notFound } from "next/navigation";
import { getReadingSet } from "@/lib/reading-sets";
import ReadingTest from "./ReadingTest";

export const dynamic = "force-dynamic";

export function generateMetadata({ params }: { params: { setId: string } }) {
  const set = getReadingSet(params.setId);
  return { title: set ? `Reading — ${set.subtitle}` : "Reading" };
}

export default function ReadingTestPage({
  params,
}: {
  params: { setId: string };
}) {
  const set = getReadingSet(params.setId);
  if (!set) notFound();
  return <ReadingTest set={set} />;
}
