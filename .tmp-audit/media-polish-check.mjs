import { chromium } from 'playwright';
import { PNG } from '../node_modules/playwright-core/lib/utilsBundle.js';
import assert from 'node:assert/strict';

const browser = await chromium.launch({ headless: true });
const errors = [];
try {
  for (const dpr of [1, 1.25, 2]) {
    const page = await browser.newPage({ viewport: { width: 1440, height: 800 }, deviceScaleFactor: dpr });
    page.on('pageerror', e => errors.push(e.message));
    page.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });
    await page.goto('http://127.0.0.1:5176/', { waitUntil: 'domcontentloaded' });
    await page.locator('#home-old-hero').waitFor();
    await page.evaluate(() => document.fonts.ready);
    const settle = () => page.evaluate(() => new Promise(r => requestAnimationFrame(() => requestAnimationFrame(() => requestAnimationFrame(r)))));
    for (const width of [1440, 1280, 1536]) {
      await page.setViewportSize({ width, height: 800 });
      await settle();
      await page.evaluate(() => scrollTo({ top: document.body.scrollHeight, behavior: 'instant' }));
      await settle();
      const state = await page.evaluate(() => ({
        top: document.querySelector('[data-nav-dark-start]').getBoundingClientRect().top,
        railTop: document.querySelector('.navigation-rail-footer-window').getBoundingClientRect().top,
        x: document.querySelector('.navigation-rail').getBoundingClientRect().left,
        correction: document.querySelector('[data-nav-dark-start]').style.getPropertyValue('--rail-footer-offset'),
      }));
      const png = PNG.sync.read(await page.screenshot());
      const mismatches = [];
      for (let y = Math.floor(state.top * dpr) - 3; y <= Math.ceil(state.top * dpr) + 3; y++) {
        const channel = x => [...png.data.subarray((y * png.width + Math.floor(x * dpr)) * 4, (y * png.width + Math.floor(x * dpr)) * 4 + 3)];
        const a = channel(state.x - 3), b = channel(state.x + 3);
        if (a.some((value, i) => value !== b[i])) mismatches.push({ y, page: a, rail: b });
      }
      console.log(JSON.stringify({ dpr, width, ...state, mismatches }));
      if (mismatches.length) {
        await page.screenshot({ path: '.tmp-audit/rail/seam-' + dpr + '-' + width + '.png' });
        console.log(await page.locator('.navigation-rail').evaluate(rail => [...rail.children].map(e => ({ tag: e.className, rect: e.getBoundingClientRect().toJSON(), style: getComputedStyle(e).transform, child: e.firstElementChild?.getBoundingClientRect().toJSON() }))));
      }
    }
    if (dpr === 1) {
      await page.setViewportSize({ width: 1440, height: 900 });
      await page.locator('[data-nav-light-start]').evaluate(e => scrollTo({ top: e.getBoundingClientRect().top + scrollY, behavior: 'instant' }));
      await settle();
      const media = await page.locator('[data-nav-light-start]').evaluate(section => {
        const videos = [...section.querySelectorAll('a[target="_blank"]')].filter(a => a.querySelector('img'));
        const articles = [...section.querySelectorAll('a[target="_blank"]')].filter(a => !a.querySelector('img'));
        return {
          count: articles.length,
          videoOffset: videos[1].getBoundingClientRect().top - videos[0].getBoundingClientRect().top,
          publicationOffset: articles[0].parentElement.parentElement.getBoundingClientRect().top - videos[0].getBoundingClientRect().top,
          captionGaps: videos.map(a => a.querySelector('p').getBoundingClientRect().top - a.querySelector('h3').getBoundingClientRect().bottom),
        };
      });
      assert.equal(media.count, 4);
      assert.equal(media.videoOffset, 100);
      assert.equal(media.publicationOffset, 0);
      media.captionGaps.forEach(gap => assert.equal(gap, 12));
      const arrow = () => page.locator('.home-media-tile svg').evaluate(svg => {
        const shaft = svg.querySelector('path'), head = svg.querySelector('path:last-child');
        return { shaftWidth: shaft.getBoundingClientRect().width, headX: head.getBoundingClientRect().x,
          delay: getComputedStyle(shaft).transitionDelay, duration: getComputedStyle(shaft).transitionDuration };
      });
      const before = await arrow();
      await page.locator('.home-media-tile').hover();
      await page.waitForTimeout(60);
      const delayed = await arrow();
      await page.waitForTimeout(400);
      const after = await arrow();
      assert.ok(Math.abs(before.shaftWidth - 16) < 0.1);
      assert.ok(Math.abs(delayed.shaftWidth - 16) < 0.1);
      assert.ok(Math.abs(after.shaftWidth - 40) < 0.1);
      assert.equal(after.headX, before.headX);
      assert.equal(after.delay, '0.1s');
      assert.equal(after.duration, '0.24s');
      console.log(JSON.stringify({ media, arrow: { before, delayed, after } }));
      await page.screenshot({ path: '.tmp-audit/rail/media-polish-final.png' });
      await page.emulateMedia({ reducedMotion: 'reduce' });
      assert.equal((await arrow()).duration, '0s');
    }
    await page.close();
  }
  assert.deepEqual(errors, []);
  console.log('Media and footer checks passed; console errors: 0');
} finally {
  await browser.close();
}
