// @ts-nocheck
import { promises as fs } from "node:fs";
import path from "node:path";
import { TextDecoder } from "node:util";
import { fileURLToPath } from "node:url";
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, "..");
const textExtensions = new Set([".ts", ".tsx", ".js", ".jsx", ".json", ".md", ".html", ".css", ".txt", ".csv"]);
const skipDirs = new Set(["node_modules", ".git", "dist", ".tmp-build"]);
const cp1251Files = new Set();
const biosRawPath = path.join(projectRoot, "tmp_data", "bios_raw.md");
const composersBiosPath = path.join(projectRoot, "tmp_data", "composers_bios.md");
const legacyDetailsPath = path.join(projectRoot, "src", "app", "data", "personDetails.legacy.ts");
const cp1251EncodeMap = new Map([
    [0x0402, 0x80],
    [0x0403, 0x81],
    [0x201A, 0x82],
    [0x0453, 0x83],
    [0x201E, 0x84],
    [0x2026, 0x85],
    [0x2020, 0x86],
    [0x2021, 0x87],
    [0x20AC, 0x88],
    [0x2030, 0x89],
    [0x0409, 0x8a],
    [0x2039, 0x8b],
    [0x040A, 0x8c],
    [0x040C, 0x8d],
    [0x040B, 0x8e],
    [0x040F, 0x8f],
    [0x0452, 0x90],
    [0x2018, 0x91],
    [0x2019, 0x92],
    [0x201C, 0x93],
    [0x201D, 0x94],
    [0x2022, 0x95],
    [0x2013, 0x96],
    [0x2014, 0x97],
    [0x2122, 0x99],
    [0x0459, 0x9a],
    [0x203A, 0x9b],
    [0x045A, 0x9c],
    [0x045C, 0x9d],
    [0x045B, 0x9e],
    [0x045F, 0x9f],
    [0x00A0, 0xa0],
    [0x040E, 0xa1],
    [0x045E, 0xa2],
    [0x0408, 0xa3],
    [0x00A4, 0xa4],
    [0x0490, 0xa5],
    [0x00A6, 0xa6],
    [0x00A7, 0xa7],
    [0x0401, 0xa8],
    [0x00A9, 0xa9],
    [0x0404, 0xaa],
    [0x00AB, 0xab],
    [0x00AC, 0xac],
    [0x00AD, 0xad],
    [0x00AE, 0xae],
    [0x0407, 0xaf],
    [0x00B0, 0xb0],
    [0x00B1, 0xb1],
    [0x0406, 0xb2],
    [0x0456, 0xb3],
    [0x0491, 0xb4],
    [0x00B5, 0xb5],
    [0x00B6, 0xb6],
    [0x00B7, 0xb7],
    [0x0451, 0xb8],
    [0x2116, 0xb9],
    [0x0454, 0xba],
    [0x00BB, 0xbb],
    [0x0458, 0xbc],
    [0x0405, 0xbd],
    [0x0455, 0xbe],
    [0x0457, 0xbf],
]);
function normalizeText(text) {
    return text
        .replace(/\r\n/g, "\n")
        .replace(/\r/g, "\n")
        .replace(/\u00a0/g, " ")
        .replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/g, "")
        .normalize("NFC");
}
function encodeCp1251(text) {
    const bytes = [];
    for (const char of text) {
        const codePoint = char.codePointAt(0) ?? 0;
        if (codePoint <= 0x7f) {
            bytes.push(codePoint);
            continue;
        }
        if (codePoint >= 0x0410 && codePoint <= 0x044f) {
            bytes.push(codePoint - 0x350);
            continue;
        }
        if (cp1251EncodeMap.has(codePoint)) {
            bytes.push(cp1251EncodeMap.get(codePoint));
            continue;
        }
        throw new Error(`No cp1251 mapping for U+${codePoint.toString(16).toUpperCase()}`);
    }
    return Uint8Array.from(bytes);
}
function decodeCp1251Utf8Mojibake(text) {
    return new TextDecoder("utf-8", { fatal: false }).decode(encodeCp1251(text));
}
function scoreReadableCyrillic(text) {
    let score = 0;
    for (const char of text) {
        const codePoint = char.codePointAt(0) ?? 0;
        if ((codePoint >= 0x0410 && codePoint <= 0x044f) || codePoint === 0x0401 || codePoint === 0x0451) {
            score += 2;
        }
        if (codePoint === 0xFFFD) {
            score -= 10;
        }
    }
    score -= (text.match(/[ЃЉЊЋЏђѓљњќћџ]/g) || []).length * 4;
    score -= (text.match(/пїЅ/g) || []).length * 10;
    return score;
}
function maybeFixMojibake(text) {
    if (!/[^\u0000-\u007f]/.test(text)) {
        return text;
    }
    try {
        const fixed = decodeCp1251Utf8Mojibake(text);
        return scoreReadableCyrillic(fixed) > scoreReadableCyrillic(text) ? fixed : text;
    }
    catch {
        return text;
    }
}
async function collectTextFiles(root, bucket = []) {
    const entries = await fs.readdir(root, { withFileTypes: true });
    for (const entry of entries) {
        const fullPath = path.join(root, entry.name);
        if (entry.isDirectory()) {
            if (!skipDirs.has(entry.name)) {
                await collectTextFiles(fullPath, bucket);
            }
            continue;
        }
        if (textExtensions.has(path.extname(entry.name).toLowerCase())) {
            bucket.push(fullPath);
        }
    }
    return bucket;
}
async function normalizeFile(filePath) {
    const rawBytes = await fs.readFile(filePath);
    const decoder = cp1251Files.has(filePath) ? new TextDecoder("windows-1251") : new TextDecoder("utf-8", { fatal: false });
    const next = normalizeText(decoder.decode(rawBytes));
    const prev = rawBytes.toString("utf8");
    if (prev !== next) {
        await fs.writeFile(filePath, next, "utf8");
    }
}
async function fixBiosRawTemplate() {
    const template = `<!--
Шаблон блока:

## Имя Фамилия
slug: unique-slug
role: composer | soloist | ensemble
group: composers | performers
order: 1
photo: source-file.jpg
image: /public-image.jpg или https://...
link: https://...
description: Короткое описание
full:
Первый абзац биографии.

Второй абзац биографии.
-->

`;
    const current = await fs.readFile(biosRawPath, "utf8");
    const next = normalizeText(current).replace(/^<!--[\s\S]*?-->\s*/m, template);
    if (next !== current) {
        await fs.writeFile(biosRawPath, next, "utf8");
    }
}
async function fixComposersBiosTemplate() {
    const template = `<!--
Отдельный файл для композиторов.
Солистов продолжайте добавлять в tmp_data/bios_raw.md.

Шаблон блока:

## Имя Фамилия
slug: unique-slug
role: composer
group: composers
order: 1
photo: source-file.jpg
image: /public-image.jpg или https://...
link: https://...
description: Короткое описание
full:
Первый абзац биографии.

Второй абзац биографии.
-->

`;
    const current = await fs.readFile(composersBiosPath, "utf8").catch(() => "");
    const next = current
        ? normalizeText(current).replace(/^<!--[\s\S]*?-->\s*/m, template)
        : template;
    if (next !== current) {
        await fs.writeFile(composersBiosPath, next, "utf8");
    }
}
async function pruneLegacyDuplicates() {
    const biosRaw = await fs.readFile(biosRawPath, "utf8").catch(() => "");
    const composersBios = await fs.readFile(composersBiosPath, "utf8").catch(() => "");
    const legacy = await fs.readFile(legacyDetailsPath, "utf8");
    const slugMatches = [...biosRaw.matchAll(/^slug:\s*(.+)$/gm), ...composersBios.matchAll(/^slug:\s*(.+)$/gm)];
    const slugs = slugMatches.map((match) => match[1].trim()).filter(Boolean);
    let next = legacy;
    for (const slug of slugs) {
        const escapedSlug = slug.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
        const entryRegex = new RegExp(`\\n\\s*"${escapedSlug}":\\s*\\{[\\s\\S]*?\\n\\s*\\},`, "g");
        next = next.replace(entryRegex, "");
    }
    next = next
        .replace(/^\?export /, "export ")
        .replace(/"([^"\\]*(?:\\.[^"\\]*)*)"/g, (full, content) => JSON.stringify(maybeFixMojibake(content)))
        .replace(/,\n(\s*};\s*)$/, "\n$1");
    next = normalizeText(next).replace(/^\uFEFF/, "");
    if (next !== legacy) {
        await fs.writeFile(legacyDetailsPath, next, "utf8");
    }
}
async function main() {
    const files = await collectTextFiles(projectRoot);
    for (const filePath of files) {
        await normalizeFile(filePath);
    }
    await fixBiosRawTemplate();
    await fixComposersBiosTemplate();
    await pruneLegacyDuplicates();
}
main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
