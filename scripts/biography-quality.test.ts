// @ts-nocheck
import assert from "node:assert/strict";
import test from "node:test";
import { assertNoSharedBiographyParagraphs, selectBiographies } from "./biography-quality.js";

const paragraph = "Многогранный музыкант, проявляющий себя в трёх основных сферах: фортепиано, композиция, педагогика";

test("rejects contamination across 38 distinct biographies", () => {
  const blocks = Array.from({ length: 38 }, (_, index) => ({
    slug: `composer-${index}`, biography: [paragraph],
  }));
  assert.throws(() => assertNoSharedBiographyParagraphs(blocks), /composer-0.*composer-37/s);
});

test("detects the same paragraph despite whitespace differences", () => {
  assert.throws(() => assertNoSharedBiographyParagraphs([
    { slug: "one", biography: [paragraph] },
    { slug: "two", biography: [` ${paragraph.replaceAll(" ", "\n")} `] },
    { slug: "three", biography: [paragraph.replaceAll(" ", "\u00a0")] },
  ]), /Repeated biography paragraphs/);
});

test("does not count multiple source blocks for one person as different biographies", () => {
  assert.doesNotThrow(() => assertNoSharedBiographyParagraphs(
    Array.from({ length: 4 }, () => ({ slug: "olga-ivanova", biography: [paragraph] })),
  ));
});

test("allows a shared passage for two collaborators and short section headings", () => {
  assert.doesNotThrow(() => assertNoSharedBiographyParagraphs([
    { slug: "one", biography: [paragraph, "Основные сочинения"] },
    { slug: "two", biography: [paragraph, "Основные сочинения"] },
    { slug: "three", biography: ["Основные сочинения", "Собственная биография автора."] },
  ]));
});

test("removing contamination cannot switch an explicitly selected biography to a longer alternative", () => {
  const selected = { slug: "composer", source: "composers.md", biography: ["Исходная биография."] };
  const alternative = { slug: "composer", source: "soloists.md", biography: ["Другая, более длинная биография из второго файла."] };
  assert.deepEqual(selectBiographies([alternative, selected], { composer: "composers.md" }), [selected]);
  assert.deepEqual(selectBiographies([selected, alternative], { composer: "composers.md" }), [selected]);
});

test("conflicting unselected versions fail instead of choosing the longest", () => {
  assert.throws(() => selectBiographies([
    { slug: "composer", source: "one.md", biography: ["Первая версия."] },
    { slug: "composer", source: "two.md", biography: ["Вторая, гораздо более длинная версия."] },
  ]), /Conflicting biographies for composer/);
});

test("a missing or empty selected source cannot silently fall back", () => {
  for (const extra of [[], [{ slug: "composer", source: "one.md", biography: [] }]]) {
    assert.throws(() => selectBiographies([
      { slug: "composer", source: "two.md", biography: ["Другая версия."] }, ...extra,
    ], { composer: "one.md" }), /Missing selected biography/);
  }
});

test("identical copies and empty alternatives do not create a biography conflict", () => {
  const full = { slug: "composer", source: "one.md", biography: ["Биография."] };
  assert.deepEqual(selectBiographies([
    { slug: "composer", source: "two.md", biography: [] }, full, { ...full, source: "three.md" },
  ]), [full]);
});
