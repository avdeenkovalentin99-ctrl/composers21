// @ts-nocheck
import { promises as fs } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, "..");
const textExtensions = new Set([".ts", ".tsx", ".js", ".jsx", ".json", ".md", ".html", ".css", ".txt", ".csv"]);
const ignoredDirectories = new Set(["node_modules", ".git", "dist", ".tmp-build"]);
function normalizeText(text) {
    return text
        .replace(/\r\n/g, "\n")
        .replace(/\r/g, "\n")
        .replace(/\u00a0/g, " ")
        .replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/g, "")
        .normalize("NFC");
}
async function walk(directory, collected = []) {
    const entries = await fs.readdir(directory, { withFileTypes: true });
    for (const entry of entries) {
        if (entry.isDirectory()) {
            if (!ignoredDirectories.has(entry.name)) {
                await walk(path.join(directory, entry.name), collected);
            }
            continue;
        }
        if (textExtensions.has(path.extname(entry.name))) {
            collected.push(path.join(directory, entry.name));
        }
    }
    return collected;
}
async function validateFile(filePath) {
    const bytes = await fs.readFile(filePath);
    let text = "";
    const issues = [];
    try {
        text = new TextDecoder("utf-8", { fatal: true }).decode(bytes);
    }
    catch {
        issues.push("contains non-UTF-8 byte sequences");
        return issues;
    }
    const normalized = normalizeText(text);
    if (text.includes("\uFFFD")) {
        issues.push("contains replacement character U+FFFD");
    }
    if (text !== normalized) {
        issues.push("needs newline/space/NFC normalization");
    }
    return issues;
}
async function main() {
    const files = await walk(projectRoot);
    const failures = [];
    for (const file of files) {
        const issues = await validateFile(file);
        if (issues.length > 0) {
            failures.push({
                file: path.relative(projectRoot, file),
                issues,
            });
        }
    }
    if (failures.length > 0) {
        for (const failure of failures) {
            console.error(`${failure.file}: ${failure.issues.join("; ")}`);
        }
        process.exitCode = 1;
        return;
    }
    console.log("UTF-8 check passed.");
}
main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
