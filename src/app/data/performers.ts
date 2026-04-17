import { generatedPerformers, type GeneratedParticipant } from "./participants.generated";
import { performers as legacyPerformers } from "./performers.legacy";
import type { PersonItem } from "./types";

function mergeBySlug(legacyList: PersonItem[], generatedList: GeneratedParticipant[]) {
  const merged = new Map<string, PersonItem>();

  for (const item of legacyList) {
    merged.set(item.slug, item);
  }

  for (const item of generatedList) {
    const existing = merged.get(item.slug);
    merged.set(item.slug, {
      slug: item.slug,
      name: item.name || existing?.name || "",
      role: item.role || existing?.role,
      description: item.description || existing?.description || "",
      image: item.image || existing?.image || "",
      link: item.link || existing?.link || "",
    });
  }

  return Array.from(merged.values());
}

export const performers: PersonItem[] = mergeBySlug(legacyPerformers, generatedPerformers);
