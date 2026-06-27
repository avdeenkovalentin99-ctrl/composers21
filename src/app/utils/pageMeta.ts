export type PageMeta = {
  title: string;
  description?: string;
  canonicalPath?: string;
  image?: string;
  robots?: string;
};

const siteOrigin = "https://21centurycomposers.com";
const ogTitle = "Композиторы XXI века";
const siteName = "Фестиваль современной музыки";
const defaultDescription = "10–31 мая · Москва · Галерея НИКО · 15 концертов";
const defaultImage = `${siteOrigin}/OGimage3.png`;

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
  setMeta('meta[property="og:title"]', { property: "og:title" }, ogTitle);
  setMeta('meta[property="og:description"]', { property: "og:description" }, defaultDescription);
  setMeta('meta[property="og:type"]', { property: "og:type" }, "website");
  setMeta('meta[property="og:url"]', { property: "og:url" }, canonicalUrl);
  setMeta('meta[property="og:site_name"]', { property: "og:site_name" }, siteName);
  setMeta('meta[property="og:image"]', { property: "og:image" }, image);
  setMeta('meta[property="og:image:secure_url"]', { property: "og:image:secure_url" }, image);
  setMeta('meta[property="og:image:type"]', { property: "og:image:type" }, "image/png");
  setMeta('meta[property="og:image:width"]', { property: "og:image:width" }, "1200");
  setMeta('meta[property="og:image:height"]', { property: "og:image:height" }, "630");
  setMeta('meta[property="og:image:alt"]', { property: "og:image:alt" }, ogTitle);
  setMeta('meta[name="twitter:card"]', { name: "twitter:card" }, "summary_large_image");
  setMeta('meta[name="twitter:title"]', { name: "twitter:title" }, ogTitle);
  setMeta('meta[name="twitter:description"]', { name: "twitter:description" }, defaultDescription);
  setMeta('meta[name="twitter:image"]', { name: "twitter:image" }, image);
}
