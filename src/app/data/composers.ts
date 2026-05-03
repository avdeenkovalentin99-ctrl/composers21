import { generatedComposers, type GeneratedParticipant } from "./participants.generated";
import { getParticipantImage } from "./images";
import { composers as legacyComposers } from "./composers.legacy";
import type { PersonItem } from "./types";
import { resolvePublicAssetPath } from "../utils/assets";

function resolveParticipantImage(image: string) {
  return image ? resolvePublicAssetPath(image) : "";
}

function mergeBySlug(legacyList: PersonItem[], generatedList: GeneratedParticipant[]) {
  const merged = new Map<string, PersonItem>();

  for (const item of legacyList) {
    merged.set(item.slug, {
      ...item,
      image: resolveParticipantImage(item.image),
    });
  }

  for (const item of generatedList) {
    const existing = merged.get(item.slug);
    const generatedImage = item.image || getParticipantImage(item.photo);
    merged.set(item.slug, {
      slug: item.slug,
      name: item.name || existing?.name || "",
      role: item.role || existing?.role,
      description: item.description || existing?.description || "",
      image: resolveParticipantImage(generatedImage || existing?.image || ""),
      link: item.link || existing?.link || "",
    });
  }

  return Array.from(merged.values());
}

export const composers: PersonItem[] = mergeBySlug(legacyComposers, generatedComposers);
