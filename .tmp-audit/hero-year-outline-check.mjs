import { chromium } from 'playwright';
const browser = await chromium.launch({ headless: true });
try {
 const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
 await page.goto('http://127.0.0.1:5176/', { waitUntil: 'domcontentloaded' });
 await page.locator('#home-old-hero').waitFor();
 await page.evaluate(() => document.fonts.ready);
 await page.locator('#home-old-hero').screenshot({ path: '.tmp-audit/hero/year-outline.png' });
 console.log(await page.locator('#home-old-hero').evaluate(el => {
  const outline = getComputedStyle(el.querySelector('.festival-hero__year--outline'));
  const title = getComputedStyle(el.querySelector('.festival-hero__title--outline'));
  const year = el.querySelector('.festival-hero__composition > .festival-hero__year');
  return {yearY: getComputedStyle(el).getPropertyValue('--year-y'), fill: outline.webkitTextFillColor, stroke: outline.webkitTextStroke, titleStroke: title.webkitTextStroke, baseClip: getComputedStyle(year).clipPath};
 }));
} finally { await browser.close(); }
