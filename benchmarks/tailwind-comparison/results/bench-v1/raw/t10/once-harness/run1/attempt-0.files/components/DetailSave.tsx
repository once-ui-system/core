"use client";

import { SaveButton } from "./SaveButton";
import { useSaved } from "@/lib/useSaved";

export function DetailSave({ id, title }: { id: string; title: string }) {
  const { saved, toggle } = useSaved();
  return <SaveButton inline title={title} saved={saved.includes(id)} onToggle={() => toggle(id)} />;
}
