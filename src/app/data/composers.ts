import { generatedComposers, type GeneratedParticipant } from "./participants.generated";
import { getParticipantImage } from "./images";
import { composers as legacyComposers } from "./composers.legacy";
import type { PersonItem } from "./types";

function mergeBySlug(legacyList: PersonItem[], generatedList: GeneratedParticipant[]) {
  const merged = new Map<string, PersonItem>();

  for (const item of legacyList) {
    merged.set(item.slug, item);
  }

  for (const item of generatedList) {
    const existing = merged.get(item.slug);
    const generatedImage = item.image || getParticipantImage(item.photo);
    merged.set(item.slug, {
      slug: item.slug,
      name: item.name || existing?.name || "",
      role: item.role || existing?.role,
      description: item.description || existing?.description || "",
      image: generatedImage || existing?.image || "",
      link: item.link || existing?.link || "",
    });
  }

  return Array.from(merged.values());
}

export const composers: PersonItem[] = mergeBySlug(legacyComposers, generatedComposers);
