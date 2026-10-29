import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, "..");

const ignoredDirectories = new Set([
  "node_modules",
  ".git",
  "dist",
  "build",
  ".tmp-build",
  ".tmp-audit",
  "tmp_scrape",
  "logos_to_send",
]);
const textExtensions = new Set([
  ".js",
  ".mjs",
  ".cjs",
  ".ts",
  ".tsx",
  ".jsx",
  ".json",
  ".css",
  ".html",
  ".md",
  ".txt",
  ".csv",
  ".yml",
  ".yaml",
  ".xml",
  ".svg",
  ".ini",
  ".toml",
]);

const suspiciousPatterns = [
  { name: "mojibake-cp1251", regex: /(?:[\u0420\u0421][\u0080-\u00bf\u0400-\u040f\u0450-\u045f]){2,}/u },
  { name: "mojibake-latin1", regex: /[\u00c2\u00c3\u00d0\u00d1][\u0080-\u00bf]/u },
  { name: "broken-punctuation-cp1251", regex: /\u0432\u0402[\u2010-\u203f\u00a0-\u00ff]/u },
  { name: "broken-punctuation-latin1", regex: /\u00e2[\u0080-\u00bf\u20ac][\u0080-\u00bf\u2122\u0153]/u },
  { name: "replacement-char", regex: /\uFFFD/u },
  { name: "control-characters", regex: /[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/u },
];

// Only these Markdown files feed build:bios. Raw scraped JSON/HTML are
// historical evidence, not build inputs; do not rewrite or validate those.
const biographySources = new Set(["bios_raw.md", "composers_bios.md", "ensembles_raw.md"]);

function isTextFile(fileName) {
  const ext = path.extname(fileName).toLowerCase();
  return textExtensions.has(ext);
}

async function walk(directory, root, collected = []) {
  const entries = await readdir(directory, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(directory, entry.name);

    if (entry.isDirectory()) {
      if (!ignoredDirectories.has(entry.name) && !entry.name.startsWith(".tmp")) {
        await walk(fullPath, root, collected);
      }
      continue;
    }

    const relative = path.relative(root, fullPath).split(path.sep).join("/");
    if (relative.startsWith("tmp_data/") && !biographySources.has(relative.slice("tmp_data/".length))) continue;
    if (entry.name === ".env" || entry.name.startsWith(".env.")) continue;
    if (entry.isFile() && isTextFile(entry.name)) {
      collected.push(fullPath);
    }
  }

  return collected;
}

export function detectEncodingIssues(bytes) {
  let text;
  try {
    text = new TextDecoder("utf-8", { fatal: true }).decode(bytes);
  } catch {
    return ["invalid-utf8"];
  }
  return suspiciousPatterns
    .filter(({ regex }) => regex.test(text))
    .map(({ name }) => name);
}

export async function checkEncoding(root = projectRoot) {
  const files = await walk(root, root);
  const brokenFiles = [];

  for (const filePath of files) {
    const content = await readFile(filePath);
    const issues = detectEncodingIssues(content);

    if (issues.length > 0) {
      brokenFiles.push({
        path: path.relative(root, filePath),
        issues,
      });
    }
  }

  return { checkedFiles: files.length, brokenFiles };
}

async function main() {
  const { checkedFiles, brokenFiles } = await checkEncoding();

  if (brokenFiles.length > 0) {
    console.error("Encoding issues found in files:");
    for (const file of brokenFiles) {
      console.error(`- ${file.path} (${file.issues.join(", ")})`);
    }
    process.exitCode = 1;
    return;
  }

  console.log(`Encoding check passed (${checkedFiles} text files, including biography sources).`);
}

if (process.argv[1] && path.resolve(process.argv[1]) === __filename) {
  main().catch((error) => {
    console.error("Encoding check failed with error:");
    console.error(error);
    process.exitCode = 1;
  });
}
