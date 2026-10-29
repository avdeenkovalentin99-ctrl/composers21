import { generatedPerformers, type GeneratedParticipant } from "./participants.generated";
import { getParticipantImage } from "./images";
import { performers as legacyPerformers } from "./performers.legacy";
import type { PersonItem } from "./types";
import { resolvePublicAssetPath } from "../utils/assets";

// Verified local copies take precedence over imported CDN URLs for these
// ensembles. Keep this explicit so unrelated soloist photo choices do not change.
const verifiedLocalEnsembleSlugs = new Set([
  "opensoundorchestra",
  "185385o731-brezel-ensemble",
  "bcix09uev1-ansambl-classica-plus",
  "kvartet_glinki",
  "2ci5ibo0z1-horovoi-ansambl-melodiya",
  "jsspbiezo1-le-thlme-ensemble",
]);

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
    const verifiedLocalImage = verifiedLocalEnsembleSlugs.has(item.slug) ? existing?.image : "";
    const generatedImage = verifiedLocalImage || item.image || getParticipantImage(item.photo);
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

export const performers: PersonItem[] = mergeBySlug(legacyPerformers, generatedPerformers);
