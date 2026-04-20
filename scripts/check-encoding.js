import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, "..");

const ignoredDirectories = new Set(["node_modules", ".git", "dist", "build"]);
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
  ".env",
  ".ini",
  ".toml",
]);

const suspiciousPatterns = [
  { name: "mojibake-cp1251", regex: /\u0420[\u0452\u0453\u0454\u0455\u0456\u0457\u0409\u040A\u040B\u040F\u0451\u2116\u00BB\u00AB\u00B0\u00B1\u00B5\u00B7]/u },
  { name: "mojibake-cp1251", regex: /\u0421[\u0452\u0453\u0454\u0455\u0456\u0457\u0409\u040A\u040B\u040F\u0451\u2116\u00BB\u00AB\u00B0\u00B1\u00B5\u00B7]/u },
  { name: "mojibake-latin1", regex: /\u00D0./u },
  { name: "mojibake-latin1", regex: /\u00D1./u },
  { name: "mojibake-latin1", regex: /\u00C3./u },
  { name: "replacement-char", regex: /\uFFFD/u },
];

function isTextFile(fileName) {
  const ext = path.extname(fileName).toLowerCase();
  return textExtensions.has(ext);
}

async function walk(directory, collected = []) {
  const entries = await readdir(directory, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(directory, entry.name);

    if (entry.isDirectory()) {
      if (!ignoredDirectories.has(entry.name)) {
        await walk(fullPath, collected);
      }
      continue;
    }

    if (entry.isFile() && isTextFile(entry.name)) {
      collected.push(fullPath);
    }
  }

  return collected;
}

function detectEncodingIssues(text) {
  return suspiciousPatterns
    .filter(({ regex }) => regex.test(text))
    .map(({ name }) => name);
}

async function main() {
  const files = await walk(projectRoot);
  const brokenFiles = [];
  const selfPath = path.join(projectRoot, "scripts", "check-encoding.js");

  for (const filePath of files) {
    if (filePath === selfPath) {
      continue;
    }

    const content = await readFile(filePath, "utf8");
    const issues = detectEncodingIssues(content);

    if (issues.length > 0) {
      brokenFiles.push({
        path: path.relative(projectRoot, filePath),
        issues,
      });
    }
  }

  if (brokenFiles.length > 0) {
    console.error("Encoding issues found in files:");
    for (const file of brokenFiles) {
      console.error(`- ${file.path} (${file.issues.join(", ")})`);
    }
    process.exitCode = 1;
    return;
  }

  console.log("Encoding check passed.");
}

main().catch((error) => {
  console.error("Encoding check failed with error:");
  console.error(error);
  process.exitCode = 1;
});
