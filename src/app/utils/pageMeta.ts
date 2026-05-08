export type PageMeta = {
  title: string;
  description?: string;
  canonicalPath?: string;
  image?: string;
  robots?: string;
};

const siteOrigin = "https://21centurycomposers.com";
const defaultDescription =
  "Фестиваль современной академической музыки в Москве. Галерея Нико. 10-31 мая 2026.";
const defaultImage = `${siteOrigin}/assets/external/heroafisha/finalconcert.jpg`;

function ensureMeta(selector: string, attributes: Record<string, string>) {
  let element = document.querySelector<HTMLMetaElement>(selector);

  if (!element) {
    const createdElement = document.createElement("meta");
    Object.entries(attributes).forEach(([name, value]) => createdElement.setAttribute(name, value));
    document.head.appendChild(createdElement);
    element = createdElement;
  }

  return element;
}

function setMeta(selector: string, attributes: Record<string, string>, content: string) {
  const element = ensureMeta(selector, attributes);
  element.setAttribute("content", content);
}

function resolveCanonicalUrl(canonicalPath: string) {
  return new URL(canonicalPath, siteOrigin).toString();
}

export function applyPageMeta(meta: PageMeta) {
  if (typeof document === "undefined") {
    return;
  }

  const description = meta.description ?? defaultDescription;
  const canonicalUrl = resolveCanonicalUrl(meta.canonicalPath ?? "/");
  const image = meta.image ?? defaultImage;
  let canonical = document.querySelector<HTMLLinkElement>('link[rel="canonical"]');

  if (!canonical) {
    canonical = document.createElement("link");
    canonical.rel = "canonical";
    document.head.appendChild(canonical);
  }

  document.title = meta.title;
  canonical.href = canonicalUrl;

  setMeta('meta[name="description"]', { name: "description" }, description);
  setMeta('meta[name="robots"]', { name: "robots" }, meta.robots ?? "index, follow");
  setMeta('meta[property="og:title"]', { property: "og:title" }, meta.title);
  setMeta('meta[property="og:description"]', { property: "og:description" }, description);
  setMeta('meta[property="og:type"]', { property: "og:type" }, "website");
  setMeta('meta[property="og:url"]', { property: "og:url" }, canonicalUrl);
  setMeta('meta[property="og:image"]', { property: "og:image" }, image);
  setMeta('meta[name="twitter:card"]', { name: "twitter:card" }, "summary_large_image");
  setMeta('meta[name="twitter:title"]', { name: "twitter:title" }, meta.title);
  setMeta('meta[name="twitter:description"]', { name: "twitter:description" }, description);
  setMeta('meta[name="twitter:image"]', { name: "twitter:image" }, image);
}
