import { chromium } from 'playwright';
const browser = await chromium.launch({ headless: true });
try {
 const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
 await page.goto('http://127.0.0.1:5176/', { waitUntil: 'domcontentloaded' });
 const hero = page.locator('#home-old-hero');
 await hero.waitFor();
 await page.evaluate(() => document.fonts.ready);
 await page.evaluate(() => { document.querySelectorAll('video').forEach(v => v.pause()); });
 await hero.screenshot({ path: '.tmp-audit/hero/year-inversion.png' });
 console.log(await hero.evaluate(el => {
  const style = getComputedStyle(el.querySelector('.festival-hero__year--inverted'));
  return {fill: style.color, stroke: style.webkitTextStrokeWidth, blend: getComputedStyle(el.querySelector('.festival-hero__clip--year')).mixBlendMode};
 }));
 await page.locator('.festival-hero__clip--year').evaluate(el => { el.style.visibility = 'hidden'; });
 await hero.screenshot({ path: '.tmp-audit/hero/year-inversion-base.png' });
} finally { await browser.close(); }
