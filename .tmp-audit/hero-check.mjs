import { chromium } from 'playwright';
import assert from 'node:assert/strict';
import { mkdir, readFile, writeFile } from 'node:fs/promises';

await mkdir('.tmp-audit/hero', { recursive: true });
const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 1672, height: 941 } });
const errors = [];
page.on('pageerror', error => errors.push(error.message));
await page.goto('http://127.0.0.1:5174/', { waitUntil: 'domcontentloaded' });
await page.locator('.festival-hero').waitFor({ timeout: 15000 });
console.log('Hero ready');
const cookie = page.getByRole('button', { name: 'OK', exact: true });
if (await cookie.isVisible()) await cookie.click();
await page.evaluate(() => document.fonts.ready);
const reports = [];
for (const [width, height] of [[1672, 941], [1440, 900], [1920, 1080]]) {
  await page.setViewportSize({ width, height });
  await page.evaluate(() => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve))));
  const state = await page.evaluate(() => {
    const hero = document.querySelector('.festival-hero');
    const box = selector => {
      const r = hero.querySelector(selector).getBoundingClientRect();
      return { x: r.x, y: r.y, width: r.width, height: r.height, right: r.right, bottom: r.bottom };
    };
    const style = selector => {
      const s = getComputedStyle(hero.querySelector(selector));
      return Object.fromEntries(['fontFamily', 'fontSize', 'fontWeight', 'fontVariationSettings', 'letterSpacing', 'lineHeight', 'transform', 'color', 'webkitTextFillColor', 'webkitTextStrokeWidth'].map(key => [key, s[key]]));
    };
    const rect = hero.getBoundingClientRect();
    const media = ['choir', 'violin', 'piano'].map(name => {
      const img = hero.querySelector(`.festival-hero__media--${name} img`);
      return { name, loaded: img.complete && img.naturalWidth > 0, opacity: getComputedStyle(img).opacity, fit: getComputedStyle(img).objectFit, position: getComputedStyle(img).objectPosition };
    });
    return {
      viewport: innerWidth, contentWidth: document.documentElement.clientWidth, scrollWidth: document.documentElement.scrollWidth,
      heroHeight: rect.height, choirTextStyle: style('.festival-hero__title--white'), title: box('h1'), outline: box('.festival-hero__title--outline'),
      choir: box('.festival-hero__media--choir'), outlines: [...hero.querySelectorAll('.festival-hero__title--over-media')].map(el => { const r=el.getBoundingClientRect(); return {x:r.x,y:r.y,width:r.width,height:r.height}; }), violin: box('.festival-hero__media--violin'), band: box('.festival-hero__band'), century: box('.festival-hero__century'),
      piano: box('.festival-hero__media--piano'), year: box('.festival-hero__composition > .festival-hero__year'), whiteYear: box('.festival-hero__year--white'), metadata: box('.festival-hero__metadata'),
      titleStyle: style('h1'), outlineStyle: style('.festival-hero__title--outline'),
      yearStyle: style('.festival-hero__composition > .festival-hero__year'), whiteYearStyle: style('.festival-hero__year--white'),
      h1Count: document.querySelectorAll('h1').length, videos: hero.querySelectorAll('video').length,
      media, clips: [...hero.querySelectorAll('.festival-hero__clip')].map(el => ({ overflow: getComputedStyle(el).overflow, hidden: el.getAttribute('aria-hidden') })),
      railCovered: hero.contains(document.elementFromPoint(rect.right - 15, rect.top + 100)),
    };
  });
  await page.screenshot({ path: `.tmp-audit/hero/desktop-${width}.png` });
  await page.locator('.festival-hero').screenshot({ path: `.tmp-audit/hero/hero-${width}.png` });
  reports.push(state);
  console.log(JSON.stringify(state));
}
await writeFile('.tmp-audit/hero/geometry.json', JSON.stringify(reports, null, 2));
const after = await page.locator('main section').evaluateAll(sections => sections.slice(1).map(section => section.outerHTML));
await writeFile('.tmp-audit/hero/sections-after.json', JSON.stringify(after, null, 2));
console.log({ errors });
await browser.close();
