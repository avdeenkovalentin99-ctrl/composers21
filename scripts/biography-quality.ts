type BiographyBlock = { slug: string; biography: string[] };

export function assertUniqueParticipantSlugs(blocks: { slug: string; group: string }[]) {
  const seen = new Set<string>();
  for (const { slug, group } of blocks) {
    const key = `${group}/${slug}`;
    if (seen.has(key)) throw new Error(`Duplicate participant: ${key}. Remove the duplicate source block before generating.`);
    seen.add(key);
  }
}

// A shorter corrected biography must not lose to an unrelated source version.
// Conflicting versions require an explicit source choice, never a length score.
export function selectBiographies<T extends BiographyBlock & { source: string }>(
  blocks: T[],
  preferredSources: Record<string, string> = {},
): T[] {
  const bySlug = new Map<string, T[]>();
  for (const block of blocks) {
    const versions = bySlug.get(block.slug) ?? [];
    versions.push(block);
    bySlug.set(block.slug, versions);
  }

  return [...bySlug].map(([slug, versions]) => {
    const preferred = preferredSources[slug];
    const candidates = preferred
      ? versions.filter((block) => block.source === preferred && block.biography.length > 0)
      : versions.filter((block) => block.biography.length > 0);
    if (preferred && candidates.length === 0) {
      throw new Error(`Missing selected biography for ${slug} in ${preferred}. Review the source before generating.`);
    }
    const distinct = new Set(candidates.map((block) => JSON.stringify(block.biography)));
    if (distinct.size > 1) {
      throw new Error(`Conflicting biographies for ${slug}: ${candidates.map((block) => block.source).join(", ")}. Select a source before generating.`);
    }
    return candidates[0] ?? versions[0];
  });
}

// A long paragraph repeated across unrelated profiles usually means that the
// importer captured a neighbouring card. Fail before writing generated files;
// never silently remove editorial content during a build.
export function assertNoSharedBiographyParagraphs(blocks: BiographyBlock[]) {
  const paragraphs = new Map<string, Set<string>>();

  for (const { slug, biography } of blocks) {
    for (const paragraph of biography) {
      const normalized = paragraph.normalize("NFC").replace(/\s+/g, " ").trim();
      if (normalized.length < 80) continue;
      const slugs = paragraphs.get(normalized) ?? new Set<string>();
      slugs.add(slug);
      paragraphs.set(normalized, slugs);
    }
  }

  const repeated = [...paragraphs].filter(([, slugs]) => slugs.size >= 3);
  if (repeated.length) {
    throw new Error(
      "Repeated biography paragraphs found. Review the source before generating:\n" +
        repeated.map(([paragraph, slugs]) =>
          `${[...slugs].join(", ")}: ${paragraph}`,
        ).join("\n"),
    );
  }
}
