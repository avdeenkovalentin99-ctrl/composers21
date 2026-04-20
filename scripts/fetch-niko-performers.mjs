import { promises as fs } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, "..");

const DEFAULT_NIKO_AFISHA_URL = "https://nikoartgallery.com/afisha/";
const localConcertsPath = path.join(projectRoot, "src", "app", "data", "concertProgrammes.ts");
const outputPath = path.join(projectRoot, "tmp_data", "niko_performers_compare.json");

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
    .replace(/\s+/g, " ")
    .trim();
}

function parseArgs(argv) {
  const options = {
    url: DEFAULT_NIKO_AFISHA_URL,
    year: 2026,
  };

  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];

    if (arg === "--url") {
      options.url = argv[i + 1] ?? options.url;
      i += 1;
      continue;
    }

    if (arg === "--year") {
      const parsed = Number(argv[i + 1] ?? "");
      if (Number.isFinite(parsed) && parsed > 0) {
        options.year = parsed;
      }
      i += 1;
    }
  }

  return options;
}

function parseLocalConcerts(source) {
  const blockRegex =
    /\{\s*id:\s*"([^"]+)"[\s\S]*?date:\s*"([^"]+)"[\s\S]*?title:\s*(?:"([^"]+)"|'([^']+)')[\s\S]*?performers:\s*\[([\s\S]*?)\]\s*,/g;
  const concerts = [];

  for (const match of source.matchAll(blockRegex)) {
    const id = match[1] ?? "";
    const date = match[2] ?? "";
    const title = match[3] ?? match[4] ?? "";
    const performersBlock = match[5] ?? "";

    const performers = [...performersBlock.matchAll(/"([^"]*)"|'([^']*)'/g)]
      .map((entry) => (entry[1] ?? entry[2] ?? "").trim())
      .filter(Boolean);

    const dateMatch = date.match(/^(\d{1,2})\s+мая$/i);
    if (!dateMatch) {
      continue;
    }

    concerts.push({
      id,
      title,
      date,
      day: Number(dateMatch[1]),
      performers,
    });
  }

  return concerts
    .filter((item) => item.day >= 10 && item.day <= 31)
    .sort((a, b) => a.day - b.day);
}

function extractNikoAnchors(html) {
  const anchorRegex = /<a\b[^>]*href=(["'])(.*?)\1[^>]*>([\s\S]*?)<\/a>/gi;
  const items = [];

  for (const match of html.matchAll(anchorRegex)) {
    const href = match[2] ?? "";
    if (!href.includes("/afisha/")) {
      continue;
    }
    if (href === "/afisha/" || href.endsWith("/afisha")) {
      continue;
    }

    const text = normalizeSpace(
      decodeHtmlEntities(
        (match[3] ?? "")
          .replace(/<script[\s\S]*?<\/script>/gi, " ")
          .replace(/<style[\s\S]*?<\/style>/gi, " ")
          .replace(/<[^>]+>/g, " "),
      ),
    );

    if (!text) {
      continue;
    }

    const url = href.startsWith("http") ? href : `https://nikoartgallery.com${href}`;
    items.push({ url, text });
  }

  return items;
}

function parseNikoEntry(anchorText, expectedYear) {
  const dateRegex = new RegExp(`(\\d{1,2})\\s+мая\\s+${expectedYear},\\s*([0-2]?\\d:[0-5]\\d)`, "i");
  const dateMatch = anchorText.match(dateRegex);
  if (!dateMatch) {
    return null;
  }

  const day = Number(dateMatch[1]);
  const time = dateMatch[2];
  const beforeDate = normalizeSpace(anchorText.slice(0, dateMatch.index ?? 0));

  // Try to split tail as performer list (best-effort):
  // "... Название <performer1, performer2, ...>"
  let titlePart = beforeDate;
  let performersText = "";

  const commaTail = beforeDate.match(/([А-ЯЁA-Z][^0-9]{1,200}(?:,\s*[А-ЯЁA-Z][^0-9]{1,200})+)$/u);
  if (commaTail?.index != null) {
    performersText = normalizeSpace(commaTail[1]);
    titlePart = normalizeSpace(beforeDate.slice(0, commaTail.index));
  }

  // Fallback for single performer at the end.
  if (!performersText) {
    const tokens = beforeDate.split(" ");
    const tail = tokens.slice(-4).join(" ");
    if (/^[А-ЯЁA-Z][\p{L}"().-]+(?:\s+[А-ЯЁA-Z][\p{L}"().-]+){0,3}$/u.test(tail)) {
      performersText = tail;
      titlePart = normalizeSpace(beforeDate.slice(0, beforeDate.length - tail.length));
    }
  }

  const performers = performersText
    ? performersText
        .split(",")
        .map((item) => normalizeSpace(item))
        .filter(Boolean)
    : [];

  return {
    day,
    dateLabel: `${day} мая ${expectedYear}`,
    time,
    titleRaw: titlePart,
    performersRaw: performersText,
    performers,
    fullText: anchorText,
  };
}

function toLookupByDay(nikoEntries) {
  const map = new Map();
  for (const entry of nikoEntries) {
    if (!map.has(entry.day)) {
      map.set(entry.day, []);
    }
    map.get(entry.day).push(entry);
  }
  return map;
}

async function run() {
  const options = parseArgs(process.argv.slice(2));
  const localSource = await fs.readFile(localConcertsPath, "utf8");
  const localConcerts = parseLocalConcerts(localSource);

  if (localConcerts.length === 0) {
    throw new Error("Не удалось извлечь локальные майские концерты из concertProgrammes.ts");
  }

  const response = await fetch(options.url, {
    headers: {
      "user-agent": "Mozilla/5.0 (compatible; ComposersXXI-SyncBot/1.0)",
      accept: "text/html,application/xhtml+xml,application/xml",
    },
  });

  if (!response.ok) {
    throw new Error(`Ошибка загрузки афиши Нико: ${response.status} ${response.statusText}`);
  }

  const html = await response.text();
  const anchors = extractNikoAnchors(html);
  const nikoEntries = anchors
    .map((anchor) => {
      const parsed = parseNikoEntry(anchor.text, options.year);
      return parsed ? { ...parsed, url: anchor.url } : null;
    })
    .filter(Boolean);

  const byDay = toLookupByDay(nikoEntries);

  const comparison = localConcerts.map((concert) => {
    const candidates = byDay.get(concert.day) ?? [];
    const candidate = candidates[0] ?? null;
    return {
      local: {
        id: concert.id,
        date: concert.date,
        title: concert.title,
        performers: concert.performers,
      },
      niko: candidate
        ? {
            url: candidate.url,
            date: candidate.dateLabel,
            time: candidate.time,
            titleRaw: candidate.titleRaw,
            performers: candidate.performers,
            performersRaw: candidate.performersRaw,
            fullText: candidate.fullText,
          }
        : null,
      status: candidate ? "found_by_date" : "missing_on_niko",
      performersCount: {
        local: concert.performers.length,
        niko: candidate ? candidate.performers.length : 0,
      },
    };
  });

  const report = {
    generatedAt: new Date().toISOString(),
    source: options.url,
    scope: {
      localConcertDays: localConcerts.map((item) => item.day),
      month: "май",
      range: "10-31",
      year: options.year,
    },
    summary: {
      localConcerts: localConcerts.length,
      foundOnNiko: comparison.filter((item) => item.status === "found_by_date").length,
      missingOnNiko: comparison.filter((item) => item.status === "missing_on_niko").length,
    },
    comparison,
  };

  await fs.mkdir(path.dirname(outputPath), { recursive: true });
  await fs.writeFile(outputPath, `${JSON.stringify(report, null, 2)}\n`, "utf8");

  console.log(`Saved report: ${path.relative(projectRoot, outputPath)}`);
  console.log(
    `Found ${report.summary.foundOnNiko}/${report.summary.localConcerts} local concerts on Niko by date.`,
  );
}

run().catch((error) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exitCode = 1;
});
