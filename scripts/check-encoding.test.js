import assert from "node:assert/strict";
import { mkdtemp, mkdir, writeFile, rm } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import { checkEncoding, detectEncodingIssues } from "./check-encoding.js";

test("valid multilingual text and normal typography are preserved", () => {
  const text = "Руст Позюмский, Ольга Иванова, Арво Пярт. São João, Ñandú, Île Thélème, Đorđe.\r\nА\u00a0Б — е\u0308.";
  assert.deepEqual(detectEncodingIssues(Buffer.from(text)), []);
});

test("invalid UTF-8, replacement characters and hidden controls are rejected", () => {
  assert.deepEqual(detectEncodingIssues(Buffer.from([0xc3, 0x28])), ["invalid-utf8"]);
  assert.deepEqual(detectEncodingIssues(Buffer.from("A\ufffdB")), ["replacement-char"]);
  assert.deepEqual(detectEncodingIssues(Buffer.from("A\u0000B")), ["control-characters"]);
});

test("detects Cyrillic and punctuation decoded using the wrong encoding", () => {
  assert.ok(detectEncodingIssues(Buffer.from("\u0420\u045f\u0421\u0402\u0420\u0451")).includes("mojibake-cp1251"));
  const latin1 = Buffer.from("Биография — композитор", "utf8").toString("latin1");
  assert.ok(detectEncodingIssues(Buffer.from(latin1)).includes("mojibake-latin1"));
  assert.ok(detectEncodingIssues(Buffer.from(latin1)).includes("broken-punctuation-latin1"));
  assert.ok(detectEncodingIssues(Buffer.from("\u0432\u0402\u201d")).includes("broken-punctuation-cp1251"));
});

test("checks canonical biography inputs without scanning temporary reports, scraped archives or environment values", async (t) => {
  const prefix = path.join(os.tmpdir(), "composers-encoding-test-");
  const root = await mkdtemp(prefix);
  t.after(async () => {
    // Remove only this test's dedicated, absolute temporary directory.
    assert.ok(path.isAbsolute(root) && root.startsWith(prefix) && root !== prefix);
    await rm(root, { recursive: true, force: true });
  });
  const broken = Buffer.from([0xff]);
  for (const directory of ["tmp_data", ".tmp-bio-repair", "tmp_scrape", "src"]) {
    await mkdir(path.join(root, directory));
  }
  for (const file of [".tmp-bio-repair/report.json", "tmp_scrape/feed.js", "tmp_data/composers.json", ".env.local"]) {
    await writeFile(path.join(root, file), broken);
  }
  await writeFile(path.join(root, "src/app.ts"), "export const name = 'Руст Позюмский';\r\n");
  for (const file of ["bios_raw.md", "composers_bios.md", "ensembles_raw.md"]) {
    await writeFile(path.join(root, "tmp_data", file), broken);
  }
  const result = await checkEncoding(root);
  assert.equal(result.checkedFiles, 4);
  assert.deepEqual(result.brokenFiles.map((file) => file.path).sort(),
    ["bios_raw.md", "composers_bios.md", "ensembles_raw.md"].map((file) => path.join("tmp_data", file)).sort());
});
