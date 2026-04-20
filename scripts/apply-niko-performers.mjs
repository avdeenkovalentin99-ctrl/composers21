import { promises as fs } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, "..");

const reportPath = path.join(projectRoot, "tmp_data", "niko_performers_compare.json");
const concertsPath = path.join(projectRoot, "src", "app", "data", "concertProgrammes.ts");

function normalizeSpace(value) {
  return String(value ?? "")
    .replace(/\u00a0/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function extractTrailingPersonName(value) {
  const match = String(value).match(/([А-ЯЁA-Z][\p{L}-]+(?:\s+[А-ЯЁA-Z][\p{L}-]+){1,3})\s*$/u);
  return match ? match[1] : null;
}

function cleanNikoPerformers(rawPerformers) {
  const list = rawPerformers.map((item) => normalizeSpace(item)).filter(Boolean);
  if (list.length === 0) {
    return list;
  }

  const first = list[0];
  const trailingName = extractTrailingPersonName(first);
  if (trailingName) {
    list[0] = trailingName;
  }

  const unique = [];
  const seen = new Set();
  for (const name of list) {
    const key = name.toLowerCase();
    if (seen.has(key)) {
      continue;
    }
    seen.add(key);
    unique.push(name);
  }
  return unique;
}

function replacePerformersBlock(source, concertId, newPerformers) {
  const escapedId = concertId.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const objectRegex = new RegExp(`(id:\\s*"${escapedId}"[\\s\\S]*?performers:\\s*\\[)([\\s\\S]*?)(\\]\\s*,)`);
  const match = source.match(objectRegex);

  if (!match) {
    return source;
  }

  const rendered = `\n${newPerformers.map((name) => `      "${name}",`).join("\n")}\n    `;
  return source.replace(objectRegex, `$1${rendered}$3`);
}

async function run() {
  const reportRaw = await fs.readFile(reportPath, "utf8");
  const report = JSON.parse(reportRaw);
  let concertsSource = await fs.readFile(concertsPath, "utf8");

  let updated = 0;
  for (const item of report.comparison ?? []) {
    if (item.status !== "found_by_date" || !item?.niko?.performers?.length) {
      continue;
    }

    const localId = item?.local?.id;
    if (!localId) {
      continue;
    }

    const cleaned = cleanNikoPerformers(item.niko.performers);
    if (cleaned.length === 0) {
      continue;
    }

    const next = replacePerformersBlock(concertsSource, localId, cleaned);
    if (next !== concertsSource) {
      concertsSource = next;
      updated += 1;
    }
  }

  await fs.writeFile(concertsPath, concertsSource, "utf8");
  console.log(`Updated performers from Niko for ${updated} concerts.`);
}

run().catch((error) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exitCode = 1;
});
