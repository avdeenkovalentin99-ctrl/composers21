import { promises as fs } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, "..");

const reportPath = path.join(projectRoot, "tmp_data", "niko_performers_compare.json");
const concertsPath = path.join(projectRoot, "src", "app", "data", "concertProgrammes.ts");

function decodeHtmlEntities(value) {
  return String(value ?? "")
    .replace(/&nbsp;/g, " ")
    .replace(/&quot;/g, "\"")
    .replace(/&laquo;/g, "«")
    .replace(/&raquo;/g, "»")
    .replace(/&amp;/g, "&")
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">");
}

function normalizeSpace(value) {
  return String(value ?? "")
    .replace(/\u00a0/g, " ")
    .replace(/[ \t]+/g, " ")
    .replace(/\s+\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function stripHtml(value) {
  return decodeHtmlEntities(
    String(value ?? "")
      .replace(/<script[\s\S]*?<\/script>/gi, " ")
      .replace(/<style[\s\S]*?<\/style>/gi, " ")
      .replace(/<\/p>/gi, "\n")
      .replace(/<br\s*\/?>/gi, "\n")
      .replace(/<\/h\d>/gi, "\n")
      .replace(/<[^>]+>/g, " "),
  );
}

function extractPerformersFromDetailHtml(html) {
  const rightBlockMatch = html.match(/<div class="afisha-single-right">([\s\S]*?)<\/div>\s*<\/div>/i);
  const rightBlock = rightBlockMatch ? rightBlockMatch[1] : html;

  const headingRegex = /<h4>\s*Исполнител(?:ь|и)\s*:?\s*<\/h4>/i;
  const headingMatch = headingRegex.exec(rightBlock);
  if (!headingMatch) {
    return [];
  }

  const startIndex = headingMatch.index + headingMatch[0].length;
  const tail = rightBlock.slice(startIndex);

  const nextHeadingIndex = tail.search(/<h4>/i);
  const performersHtml = nextHeadingIndex >= 0 ? tail.slice(0, nextHeadingIndex) : tail;

  const rawText = normalizeSpace(stripHtml(performersHtml));
  if (!rawText) {
    return [];
  }

  const lines = rawText
    .split("\n")
    .map((line) => normalizeSpace(line))
    .filter(Boolean)
    .filter((line) => !/^исполнител(?:ь|и)\s*:?\s*$/i.test(line))
    .filter((line) => !/^фестиваль\b/i.test(line));

  const looksLikePerformer = (line) => {
    const lower = line.toLowerCase();
    const wordCount = line.split(/\s+/).length;
    const hasRole = /\([^()]{2,80}\)/.test(line);
    const hasEnsembleKeyword =
      /\b(ансамбль|ensemble|orchestra|quartet|квартет|проект|хор|хоровой)\b/i.test(line);
    const hasBioMarkers =
      /\b(фестиваль|посвящен|произведениям|музыка|концерт|автор идеи|организатор|объединяет|направлений)\b/i
        .test(lower) && !hasRole && !hasEnsembleKeyword;
    const tooLong = line.length > 110;
    const tooPunctuated = (line.match(/[.,:;!?]/g) ?? []).length > 2 && !hasRole;

    if (hasBioMarkers || tooLong || tooPunctuated) {
      return false;
    }
    if (hasRole || hasEnsembleKeyword) {
      return true;
    }
    return wordCount >= 2 && wordCount <= 5;
  };

  const filtered = lines.filter(looksLikePerformer);

  const unique = [];
  const seen = new Set();
  for (const line of filtered) {
    const key = line.toLowerCase();
    if (seen.has(key)) {
      continue;
    }
    seen.add(key);
    unique.push(line);
  }

  return unique;
}

function escapeTsString(value) {
  return String(value).replace(/\\/g, "\\\\").replace(/"/g, '\\"');
}

function replacePerformersBlock(source, concertId, newPerformers) {
  const escapedId = concertId.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const objectRegex = new RegExp(`(id:\\s*"${escapedId}"[\\s\\S]*?performers:\\s*\\[)([\\s\\S]*?)(\\]\\s*,)`);
  const match = source.match(objectRegex);

  if (!match) {
    return source;
  }

  const rendered = `\n${newPerformers.map((name) => `      "${escapeTsString(name)}",`).join("\n")}\n    `;
  return source.replace(objectRegex, `$1${rendered}$3`);
}

async function fetchHtml(url) {
  const response = await fetch(url, {
    headers: {
      "user-agent": "Mozilla/5.0 (compatible; ComposersXXI-SyncBot/1.0)",
      accept: "text/html,application/xhtml+xml,application/xml",
    },
  });

  const html = await response.text();
  if (!html) {
    throw new Error(`Пустой ответ от ${url}`);
  }
  return html;
}

async function run() {
  const reportRaw = await fs.readFile(reportPath, "utf8");
  const report = JSON.parse(reportRaw);
  let concertsSource = await fs.readFile(concertsPath, "utf8");

  let updated = 0;
  let skipped = 0;

  for (const item of report.comparison ?? []) {
    if (item.status !== "found_by_date" || !item?.niko?.url || !item?.local?.id) {
      continue;
    }

    try {
      const html = await fetchHtml(item.niko.url);
      const performers = extractPerformersFromDetailHtml(html);
      if (performers.length === 0) {
        skipped += 1;
        continue;
      }

      const next = replacePerformersBlock(concertsSource, item.local.id, performers);
      if (next !== concertsSource) {
        concertsSource = next;
        updated += 1;
      } else {
        skipped += 1;
      }
    } catch (error) {
      skipped += 1;
      console.warn(`Skip ${item.local.id}: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  await fs.writeFile(concertsPath, concertsSource, "utf8");
  console.log(`Updated concerts: ${updated}. Skipped: ${skipped}.`);
}

run().catch((error) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exitCode = 1;
});
