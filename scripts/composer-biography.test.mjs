import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { after, before, test } from "node:test";
import { chromium } from "playwright";
import { fetchComposerBiography } from "./import-composers.mjs";
import { extractTildaBiography } from "./tilda-biography.mjs";

const fixture = JSON.parse(await readFile(new URL("./fixtures/tilda-composer-posts.json", import.meta.url), "utf8"));
const [neighbour, composer] = fixture.posts;
let browser;

before(async () => { browser = await chromium.launch({ headless: true }); });
after(async () => { await browser?.close(); });

function card(post) {
  return `<article class="js-feed-post" data-post-uid="${post.uid}">
    <div class="js-feed-post-title t-title">${post.title}</div>
    <div class="js-feed-post-descr t-descr">${post.descr}</div>
  </article>`;
}

function popup(post, html, recommendations = "") {
  return `<div class="t-feed__post-popup t-popup" data-feed-popup-postuid="${post.uid}">
    <div class="js-feed-post-title t-feed__post-popup__title">${post.title}</div>
    <div id="feed-text" class="t-feed__post-popup__text-wrapper">
      <div class="js-feed-post-text t-feed__post-popup__text t-text">${html}</div>
    </div>
    <div class="js-feed-relevants t-feed__post-popup__relevants">${recommendations}</div>
  </div>`;
}

async function withPage(t, html) {
  const page = await browser.newPage();
  // Fixtures must stay fully offline, even if future examples contain assets.
  await page.route("**/*", (route) => route.abort());
  t.after(() => page.close());
  await page.setContent(html);
  return page;
}

function expected(post = composer) {
  return { uid: post.uid, name: post.title };
}

test("extracts only the identified post, preserving short paragraphs, introduction and nested list text once", async (t) => {
  const page = await withPage(t, `<main class="t-records">
    ${card(neighbour)}
    ${popup(composer, `<div><p>16 октября 1955 года, Харьков.</p>
      <p>${composer.descr} Автор камерной и симфонической музыки.</p>
      <p>Основные сочинения:</p><ul><li><p>Опера «Дети Розенталя».</p></li><li>Камерная опера «Бедная Лиза».</li></ul>
      <blockquote><p>Музыка и слово.</p></blockquote></div>`, card(neighbour))}
    <footer><p>${neighbour.descr}</p></footer>
  </main>`);
  assert.deepEqual(await page.evaluate(extractTildaBiography, expected()), [
    "16 октября 1955 года, Харьков.",
    `${composer.descr} Автор камерной и симфонической музыки.`,
    "Основные сочинения:",
    "Опера «Дети Розенталя».",
    "Камерная опера «Бедная Лиза».",
    "Музыка и слово.",
  ]);
});

test("normalizes the owning post's HTML while retaining block boundaries and legitimate repeated text", async (t) => {
  const page = await withPage(t, "");
  assert.deepEqual(await page.evaluate(extractTildaBiography, {
    html: "<p>Первая&nbsp;<em>часть</em>.<br>Продолжение.</p><p>Вторая &amp; третья.</p>Четвертая.<br><br>Пятая.<div>Повтор.</div><div>Повтор.</div><script>чужой скрипт</script>",
  }), ["Первая часть. Продолжение.", "Вторая & третья.", "Четвертая.", "Пятая.", "Повтор.", "Повтор."]);
});

test("does not blacklist a description that belongs to the requested person", async (t) => {
  const page = await withPage(t, popup(neighbour, `<p>${neighbour.descr}</p><p>Ольга Иванова.</p>`));
  assert.deepEqual(await page.evaluate(extractTildaBiography, expected(neighbour)), [neighbour.descr, "Ольга Иванова."]);
});

test("rejects an unrelated popup, a mismatched title and ambiguous post text", async (t) => {
  const page = await withPage(t, popup(neighbour, `<p>${neighbour.descr}</p>`));
  assert.deepEqual(await page.evaluate(extractTildaBiography, expected()), []);
  await page.setContent(popup({ ...neighbour, uid: composer.uid }, `<p>${neighbour.descr}</p>`));
  assert.deepEqual(await page.evaluate(extractTildaBiography, expected()), []);
  await page.setContent(popup(composer, "<p>Первый текст.</p>") + popup(composer, "<p>Другой текст.</p>"));
  assert.deepEqual(await page.evaluate(extractTildaBiography, expected()), []);
});

test("never searches body, main or generic text wrappers when the post body is missing or loading", async (t) => {
  const page = await withPage(t, `<main id="allrecords" class="t-records"><h1>${composer.title}</h1>
    <div class="t-text"><p>${neighbour.descr}</p></div>${card(neighbour)}</main>`);
  assert.deepEqual(await page.evaluate(extractTildaBiography, expected()), []);
  await page.setContent(popup(composer, '<div class="t-feed__post-popup__text-loader">Loading…</div>', card(neighbour)));
  assert.deepEqual(await page.evaluate(extractTildaBiography, expected()), []);
});

test("detail fallback keeps the original person's description and cannot replace it with recommended content", async (t) => {
  const page = await withPage(t, `<main>${card(neighbour)}<div class="t-descr">${neighbour.descr}</div></main>`);
  const visited = [];
  const warnings = [];
  t.mock.method(console, "warn", (message) => warnings.push(message));
  const offlinePage = {
    goto: async (url) => { visited.push(url); return { ok: () => true }; },
    waitForLoadState: async () => {},
    evaluate: (fn, args) => page.evaluate(fn, args),
  };
  const original = [composer.descr];
  const result = await fetchComposerBiography(offlinePage, {
    ...expected(), link: composer.url, biography: original, hasFullText: false,
  });
  assert.deepEqual(result, original);
  assert.equal(visited.length, 2, "both historical URL variants were checked without external requests");
  assert.equal(warnings.length, 1, "an unrecognized detail page is reported instead of silently claiming a full biography");
});

test("existing full feed text is not replaced by a shorter detail summary or fetched again", async () => {
  const original = [composer.descr, "В 1978 году окончил Ленинградскую консерваторию."];
  const result = await fetchComposerBiography({ goto() { assert.fail("full feed text must not be refetched"); } }, {
    ...expected(), link: composer.url, biography: original, hasFullText: true,
  });
  assert.deepEqual(result, original);
});

test("HTTP errors and unavailable detail pages preserve the original feed content", async (t) => {
  t.mock.method(console, "warn", () => {});
  let requests = 0;
  const result = await fetchComposerBiography({
    goto: async () => {
      requests += 1;
      if (requests === 1) return { ok: () => false };
      throw new Error("offline");
    },
    evaluate: () => assert.fail("error documents must not be parsed"),
  }, { ...expected(), link: composer.url, biography: [composer.descr], hasFullText: false });
  assert.deepEqual(result, [composer.descr]);
});
