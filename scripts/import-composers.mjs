import { promises as fs } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, "..");
const composersBiosPath = path.join(projectRoot, "tmp_data", "composers_bios.md");
const outputPath = path.join(projectRoot, "tmp_data", "composers_import.md");
const participantAssetsPath = path.join(projectRoot, "src", "assets", "participants");

const FEED_RECID = "1994255161";
const DEFAULT_URL = "https://21centcomposers.ru/composers";
const composerOverrides = new Map([
  ["леонид десятников", { slug: "leonid-desyatnikov", name: "Леонид Десятников" }],
  ["александр чайковский", { slug: "aleksandr-chaykovsky", name: "Александр Чайковский" }],
  ["сергей ахунов", { slug: "sergey-akhunov", name: "Сергей Ахунов" }],
  ["павел карманов", { slug: "pavel-karmanov", name: "Павел Карманов" }],
  ["владимир мартынов", { slug: "vladimir-martynov", name: "Владимир Мартынов" }],
  ["павел турсунов", { slug: "pavel-tursunov", name: "Павел Турсунов" }],
  ["георг пелецис", { slug: "georg-peletsis", name: "Георг Пелецис" }],
  ["эрик эшенвалдс", { slug: "erik-eshenvalds", name: "Эрик Эшенвалдс" }],
  ["эрикс эшенвалдс", { slug: "erik-eshenvalds", name: "Эрик Эшенвалдс" }],
]);

function parseArgs(argv) {
  const options = {
    url: DEFAULT_URL,
    headless: false,
    writeBios: false,
    limit: Infinity,
    slowMo: 80,
  };

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];

    if (arg === "--headless") {
      options.headless = true;
      continue;
    }

    if (arg === "--write-bios") {
      options.writeBios = true;
      continue;
    }

    if (arg === "--url") {
      options.url = argv[index + 1] ?? options.url;
      index += 1;
      continue;
    }

    if (arg === "--limit") {
      const value = Number(argv[index + 1] ?? "");
      if (Number.isFinite(value) && value > 0) {
        options.limit = value;
      }
      index += 1;
      continue;
    }

    if (arg === "--slowmo") {
      const value = Number(argv[index + 1] ?? "");
      if (Number.isFinite(value) && value >= 0) {
        options.slowMo = value;
      }
      index += 1;
    }
  }

  return options;
}

function normalizeText(text) {
  return String(text ?? "")
    .replace(/\r\n/g, "\n")
    .replace(/\r/g, "\n")
    .replace(/\u00a0/g, " ")
    .replace(/[ \t]+\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .replace(/[ \t]{2,}/g, " ")
    .trim();
}

function transliterate(value) {
  const map = new Map([
    ["а", "a"], ["б", "b"], ["в", "v"], ["г", "g"], ["д", "d"], ["е", "e"], ["ё", "e"],
    ["ж", "zh"], ["з", "z"], ["и", "i"], ["й", "i"], ["к", "k"], ["л", "l"], ["м", "m"],
    ["н", "n"], ["о", "o"], ["п", "p"], ["р", "r"], ["с", "s"], ["т", "t"], ["у", "u"],
    ["ф", "f"], ["х", "kh"], ["ц", "ts"], ["ч", "ch"], ["ш", "sh"], ["щ", "shch"], ["ъ", ""],
    ["ы", "y"], ["ь", ""], ["э", "e"], ["ю", "yu"], ["я", "ya"],
  ]);

  return value
    .toLowerCase()
    .split("")
    .map((char) => map.get(char) ?? char)
    .join("");
}

function sanitizeSlugPart(value) {
  return transliterate(value)
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/-{2,}/g, "-");
}

function createComposerSlug(name) {
  const parts = normalizeText(name).split(/\s+/).filter(Boolean);

  if (parts.length === 0) {
    return "";
  }

  const firstName = parts[0] ?? "";
  const lastName = parts.at(-1) ?? firstName;

  // Composer slugs follow the existing project pattern from the examples:
  // "leonid-desyatnikov", "vladimir-martynov", etc.
  return [sanitizeSlugPart(firstName), sanitizeSlugPart(lastName)].filter(Boolean).join("-");
}

function applyComposerOverride(name, slug) {
  const key = normalizeText(name).toLowerCase();
  const override = composerOverrides.get(key);

  if (!override) {
    return { name, slug };
  }

  return {
    name: override.name ?? name,
    slug: override.slug ?? slug,
  };
}

function extractDisplayNameFromLegacyUrl(url) {
  try {
    const pathname = new URL(url).pathname;
    const lastSegment = pathname.split("/").filter(Boolean).at(-1) ?? "";
    const withoutOpaquePrefix = lastSegment.replace(/^[a-z0-9]+-/, "");

    return withoutOpaquePrefix
      .split("-")
      .filter(Boolean)
      .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
      .join(" ");
  } catch {
    return "";
  }
}

function createLegacyDetailUrlCandidates(link) {
  if (!link) {
    return [];
  }

  const variants = new Set([link]);

  try {
    const url = new URL(link);
    const originalPath = url.pathname;

    if (originalPath.startsWith("/persons/")) {
      url.pathname = originalPath.replace(/^\/persons\//, "/person/");
      variants.add(url.toString());
    } else if (originalPath.startsWith("/person/")) {
      url.pathname = originalPath.replace(/^\/person\//, "/persons/");
      variants.add(url.toString());
    }
  } catch {
    // ignore malformed urls
  }

  return Array.from(variants);
}

function toPascalCase(value) {
  return transliterate(value)
    .split(/[^a-z0-9]+/g)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join("");
}

function createPhotoBaseName(name) {
  const parts = normalizeText(name).split(/\s+/).filter(Boolean);
  const firstName = parts[0] ?? "Name";
  const lastName = parts.at(-1) ?? firstName;
  const surnamePart = toPascalCase(lastName) || "Composer";
  const initialPart = toPascalCase(firstName).charAt(0) || "A";
  return `${surnamePart}${initialPart}`;
}

function inferFileExtension(imageUrl, contentType) {
  const pathname = (() => {
    try {
      return new URL(imageUrl).pathname;
    } catch {
      return "";
    }
  })();
  const extFromPath = path.extname(pathname).toLowerCase();

  if ([".jpg", ".jpeg", ".png", ".webp", ".jfif", ".gif"].includes(extFromPath)) {
    return extFromPath;
  }

  const normalizedType = String(contentType ?? "").toLowerCase();

  if (normalizedType.includes("image/png")) {
    return ".png";
  }

  if (normalizedType.includes("image/webp")) {
    return ".webp";
  }

  if (normalizedType.includes("image/gif")) {
    return ".gif";
  }

  return ".jpg";
}

async function downloadComposerPhoto(imageUrl, preferredBaseName) {
  if (!imageUrl) {
    return "";
  }

  await fs.mkdir(participantAssetsPath, { recursive: true });

  const response = await fetch(imageUrl);

  if (!response.ok) {
    throw new Error(`Failed to download image ${imageUrl}: ${response.status} ${response.statusText}`);
  }

  const contentType = response.headers.get("content-type");
  const extension = inferFileExtension(imageUrl, contentType);
  const buffer = Buffer.from(await response.arrayBuffer());

  let fileName = `${preferredBaseName}${extension}`;
  let targetPath = path.join(participantAssetsPath, fileName);
  let suffix = 2;

  for (;;) {
    try {
      const existing = await fs.readFile(targetPath);

      if (existing.equals(buffer)) {
        return fileName;
      }

      fileName = `${preferredBaseName}${suffix}${extension}`;
      targetPath = path.join(participantAssetsPath, fileName);
      suffix += 1;
    } catch (error) {
      if (error && typeof error === "object" && "code" in error && error.code === "ENOENT") {
        await fs.writeFile(targetPath, buffer);
        return fileName;
      }

      throw error;
    }
  }
}

function parseExistingComposerSlugs(source) {
  const blockRegex = /^##\s+.+?\n([\s\S]*?)(?=^##\s+|\Z)/gm;
  const slugs = new Set();

  for (const match of source.matchAll(blockRegex)) {
    const block = match[0];
    const roleMatch = block.match(/^role:\s*(.+)$/m);
    const slugMatch = block.match(/^slug:\s*(.+)$/m);

    if (!slugMatch) {
      continue;
    }

    if ((roleMatch?.[1] ?? "").trim() === "composer") {
      slugs.add(slugMatch[1].trim());
    }
  }

  return slugs;
}

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function buildBlock(person) {
  const paragraphs = person.biography.length > 0 ? person.biography : [person.description || "TODO: добавить биографию"];
  const lines = [
    `## ${person.name}`,
    `slug: ${person.slug}`,
    "role: composer",
    "group: composers",
    person.photo ? `photo: ${person.photo}` : null,
    !person.photo && person.image ? `image: ${person.image}` : null,
    person.link ? `link: ${person.link}` : null,
    "full:",
    paragraphs.join("\n\n"),
  ].filter(Boolean);

  return `${lines.join("\n")}\n`;
}

function mergeIntoBiosRaw(existingContent, blocks) {
  let next = existingContent.trimEnd();

  if (next.length > 0) {
    next += "\n\n";
  }

  next += blocks.join("\n");
  return `${next.trimEnd()}\n`;
}

async function importPlaywright() {
  try {
    return await import("playwright");
  } catch (error) {
    const message =
      'Missing dependency "playwright". Install it with: npm install -D playwright';
    throw new Error(`${message}\nOriginal error: ${error instanceof Error ? error.message : String(error)}`);
  }
}

async function loadAllFeedPosts(page) {
  const feedContainer = page.locator(`#rec${FEED_RECID} .js-feed-container`).first();
  await feedContainer.waitFor({ state: "visible", timeout: 30000 });

  let previousCount = -1;
  let loadStep = 0;

  for (;;) {
    const currentCount = await page.locator(`#rec${FEED_RECID} .js-feed-post`).count();
    const feedEnded = await feedContainer.getAttribute("data-feed-end");

    if (feedEnded === "true") {
      console.log(`Composers list fully loaded: ${currentCount}`);
      break;
    }

    const showMore = page.locator(`#rec${FEED_RECID} .js-feed-btn-show-more`).first();
    const visible = await showMore.isVisible().catch(() => false);

    if (!visible) {
      if (currentCount === previousCount) {
        break;
      }

      previousCount = currentCount;
      await page.waitForTimeout(600);
      continue;
    }

    previousCount = currentCount;
    await showMore.click();
    loadStep += 1;
    await page.waitForFunction(
      ({ recid, count }) => {
        const container = document.querySelector(`#rec${recid} .js-feed-container`);
        const posts = document.querySelectorAll(`#rec${recid} .js-feed-post`).length;
        const isLoading = container?.getAttribute("data-feed-loading") === "true";
        return !isLoading && posts > count;
      },
      { recid: FEED_RECID, count: currentCount },
      { timeout: 30000 },
    );
    const nextCount = await page.locator(`#rec${FEED_RECID} .js-feed-post`).count();
    console.log(`Clicked "Показать ещё" ${loadStep} time(s): ${currentCount} -> ${nextCount}`);
  }

  const posts = await page.evaluate((recid) => {
    const container = document.querySelector(`#rec${recid} .js-feed-container`);
    const store = window.tFeedPosts?.[recid] ?? {};
    const order = Array.from(container?.querySelectorAll(".js-feed-post") ?? [])
      .map((element) => element.getAttribute("data-post-uid"))
      .filter(Boolean);

    function cleanupParagraphs(html, fallbackText) {
      const source = html || fallbackText || "";
      const root = document.createElement("div");
      root.innerHTML = source;

      for (const br of root.querySelectorAll("br")) {
        br.replaceWith("\n");
      }

      const text = (root.innerText || root.textContent || source)
        .replace(/\u00a0/g, " ")
        .replace(/[ \t]+\n/g, "\n")
        .replace(/\n{3,}/g, "\n\n")
        .trim();

      return text
        .split(/\n{2,}/)
        .map((paragraph) => paragraph.replace(/\s*\n\s*/g, " ").replace(/[ \t]{2,}/g, " ").trim())
        .filter(Boolean);
    }

    return order
      .map((uid) => store[uid])
      .filter((post) => post && typeof post === "object")
      .map((post) => {
        const biography = cleanupParagraphs(post.text, post.descr);
        const title = (post.title || "").replace(/\s+/g, " ").trim();
        const description = cleanupParagraphs("", post.descr)[0] ?? biography[0] ?? "";

        return {
          uid: post.uid,
          name: title,
          description,
          biography,
          image: post.image || post.thumb || "",
          link: post.directlink || post.url || "",
        };
      });
  }, FEED_RECID);

  console.log(`Loaded ${posts.length} composers from list`);
  return posts;
}

async function fetchComposerBiography(page, link, fallbackDescription) {
  const candidates = createLegacyDetailUrlCandidates(link);

  for (const candidate of candidates) {
    try {
      await page.goto(candidate, { waitUntil: "domcontentloaded", timeout: 60000 });
      await page.waitForLoadState("networkidle", { timeout: 60000 }).catch(() => {});

      const result = await page.evaluate((description) => {
        const normalize = (text) =>
          String(text ?? "")
            .replace(/\u00a0/g, " ")
            .replace(/[ \t]+\n/g, "\n")
            .replace(/\n{3,}/g, "\n\n")
            .trim();

        const selectors = [
          ".t-feed__post-popup",
          ".t-records",
          "main",
          "#allrecords",
          "body",
        ];

        function collectParagraphs(root) {
          const candidates = Array.from(
            root.querySelectorAll("p, li, blockquote, .t-text, .t-descr, .t-title, .t-name, .t-card__descr, .js-feed-post")
          );

          const seen = new Set();
          const paragraphs = [];

          for (const node of candidates) {
            const text = normalize(node.innerText || node.textContent || "");

            if (!text || text.length < 70) {
              continue;
            }

            if (text === description || text.startsWith(description)) {
              continue;
            }

            if (/^(Главная|Афиша|Композиторы|Исполнители|Партнёры|Контакты|Подписаться)/i.test(text)) {
              continue;
            }

            if (!seen.has(text)) {
              seen.add(text);
              paragraphs.push(text);
            }
          }

          return paragraphs;
        }

        for (const selector of selectors) {
          const root = document.querySelector(selector);

          if (!root) {
            continue;
          }

          const paragraphs = collectParagraphs(root);

          if (paragraphs.length > 0) {
            return paragraphs;
          }
        }

        return [];
      }, fallbackDescription);

      if (result.length > 0) {
        return result;
      }
    } catch {
      // try next candidate
    }
  }

  return [];
}

async function main() {
  const options = parseArgs(process.argv.slice(2));
  const existingComposersBios = await fs.readFile(composersBiosPath, "utf8").catch(() => "");
  const existingComposerSlugs = parseExistingComposerSlugs(existingComposersBios);
  const { chromium } = await importPlaywright();

  const browser = await chromium.launch({
    headless: options.headless,
    slowMo: options.headless ? 0 : options.slowMo,
  });

  try {
    const page = await browser.newPage({ viewport: { width: 1440, height: 1200 } });
    await page.goto(options.url, { waitUntil: "domcontentloaded", timeout: 60000 });
    await page.waitForLoadState("networkidle", { timeout: 60000 }).catch(() => {});

    const scraped = await loadAllFeedPosts(page);
    const limited = scraped.slice(0, options.limit);

    const detailPage = await browser.newPage({ viewport: { width: 1440, height: 1200 } });
    const composers = [];

    for (const item of limited) {
        const link = normalizeText(item.link);
        const name = normalizeText(item.name) || extractDisplayNameFromLegacyUrl(link);
        const description = normalizeText(item.description);
        let biography = item.biography.map((paragraph) => normalizeText(paragraph)).filter(Boolean);
        const computedSlug = createComposerSlug(name);
        const resolved = applyComposerOverride(name, computedSlug);
        const resolvedName = resolved.name;
        const slug = resolved.slug;

        if (link) {
          const detailedBiography = await fetchComposerBiography(detailPage, link, description);

          if (detailedBiography.length > 0) {
            biography = detailedBiography;
          }
        }

        composers.push({
          name: resolvedName,
          slug,
          role: "composer",
          group: "composers",
          photo: "",
          image: normalizeText(item.image),
          // Keep the original Tilda URL with its opaque prefix for navigation only.
          // Our local slug is generated independently from the composer name.
          link,
          description,
          biography,
        });
    }

    await detailPage.close();

    const validComposers = composers.filter((item) => item.name && item.slug);

    for (const composer of validComposers) {
      if (!composer.image) {
        continue;
      }

      try {
        const photoBaseName = createPhotoBaseName(composer.name);
        composer.photo = await downloadComposerPhoto(composer.image, photoBaseName);
        composer.image = "";
      } catch (error) {
        console.warn(
          `Image download failed for "${composer.name}": ${error instanceof Error ? error.message : String(error)}`,
        );
      }
    }

    const newComposers = validComposers.filter((composer) => !existingComposerSlugs.has(composer.slug));
    const blocks = newComposers.map(buildBlock);

    const header = [
      "<!--",
      `Generated by scripts/import-composers.mjs on ${new Date().toISOString()}.`,
      `Source: ${options.url}`,
      `Total scraped: ${validComposers.length}`,
      `New blocks: ${newComposers.length}`,
      "-->",
      "",
    ].join("\n");

    await fs.writeFile(outputPath, `${header}${blocks.join("\n")}`.trimEnd() + "\n", "utf8");

    if (options.writeBios && blocks.length > 0) {
      const merged = mergeIntoBiosRaw(existingComposersBios, blocks);
      await fs.writeFile(composersBiosPath, merged, "utf8");
    }

    console.log(`Scraped composers: ${validComposers.length}`);
    console.log(`New composers: ${newComposers.length}`);
    console.log(`Output: ${path.relative(projectRoot, outputPath)}`);

    if (options.writeBios) {
      console.log(`Updated: ${path.relative(projectRoot, composersBiosPath)}`);
    } else {
      console.log('Dry run complete. Add "--write-bios" to append new composer blocks into tmp_data/composers_bios.md.');
    }
  } finally {
    await browser.close();
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
