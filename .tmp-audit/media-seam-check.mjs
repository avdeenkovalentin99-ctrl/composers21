import { chromium } from 'playwright';
import { PNG } from '../node_modules/playwright-core/lib/utilsBundle.js';
import { mkdir } from 'node:fs/promises';

await mkdir('.tmp-audit/media-seam', { recursive: true });
const browser = await chromium.launch({ headless: true });
let failures = 0;
try {
  for (const dpr of [1, 1.25, 1.5, 2]) {
    const page = await browser.newPage({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: dpr, reducedMotion: 'reduce' });
    await page.goto('http://127.0.0.1:5173/', { waitUntil: 'domcontentloaded' });
    await page.locator('[data-nav-light-start]').waitFor();
    await page.evaluate(() => document.fonts.ready);
    for (const width of [1440, 1280, 1536]) {
      await page.setViewportSize({ width, height: 900 });
      for (const offset of [400, 400.25, 400.5, 400.75]) {
        await page.evaluate(offset => {
          const top = document.querySelector('[data-nav-light-start]').getBoundingClientRect().top + scrollY;
          scrollTo({ top: top - offset, behavior: 'instant' });
        }, offset);
        await page.waitForTimeout(100);
        const state = await page.evaluate(() => {
          const media = document.querySelector('[data-nav-light-start]');
          const rail = document.querySelector('.navigation-rail');
          return { top: media.getBoundingClientRect().top, railTop: rail.querySelector('.navigation-rail-light-window').getBoundingClientRect().top, x: rail.getBoundingClientRect().left, correction: media.previousElementSibling.style.getPropertyValue('--rail-media-offset'), native: rail.dataset.nativeScroll };
        });
        const screenshot = await page.screenshot();
        const png = PNG.sync.read(screenshot);
        const mismatches = [];
        for (let y = Math.floor(state.top * dpr) - 3; y <= Math.ceil(state.top * dpr) + 3; y++) {
          const rgb = x => [...png.data.subarray((y * png.width + Math.floor(x * dpr)) * 4, (y * png.width + Math.floor(x * dpr)) * 4 + 3)];
          const a = rgb(state.x - 3), b = rgb(state.x + 3);
          if (a.some((value, i) => value !== b[i])) mismatches.push({ y, page: a, rail: b });
        }
        if (mismatches.length) {
          failures++;
          await page.screenshot({ path: `.tmp-audit/media-seam/${dpr}-${width}-${offset}.png` });
        }
        console.log(JSON.stringify({ dpr, width, offset, ...state, mismatches }));
      }
    }
    await page.close();
  }
} finally { await browser.close(); }
console.log(JSON.stringify({ failures }));
process.exitCode = failures ? 1 : 0;
