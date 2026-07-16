"use client";

import Link from "next/link";
import { PencilSimple } from "@phosphor-icons/react";
import { useIdentity } from "@/components/Identity";

export default function OwnerActions({
  journalId,
  authorName,
}: {
  journalId: string;
  authorName: string;
}) {
  const { name } = useIdentity();
  if (name !== authorName) return null;

  return (
    <Link
      href={`/journals/${journalId}/edit`}
      className="btn btn-secondary h-9 px-4 text-xs"
    >
      <PencilSimple size={14} weight="bold" />
      Edit
    </Link>
  );
}
