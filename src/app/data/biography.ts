import { personDetails } from "./personDetails";

export function getBiographyParagraphs(slug: string, fallbackDescription: string) {
  const biography = personDetails[slug]?.biography;

  if (Array.isArray(biography)) {
    const normalizedParagraphs = biography
      .filter((paragraph): paragraph is string => typeof paragraph === "string")
      .map((paragraph) => paragraph.trim())
      .filter(Boolean);

    if (normalizedParagraphs.length > 0) {
      return normalizedParagraphs;
    }
  }

  const fallbackParagraph = fallbackDescription.trim();
  return fallbackParagraph ? [fallbackParagraph] : [];
}
