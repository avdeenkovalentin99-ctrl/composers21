import { chromium } from 'playwright';
import { mkdir, writeFile } from 'node:fs/promises';
await mkdir('.tmp-audit/hero', { recursive: true });
const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 1672, height: 941 } });
await page.goto('http://127.0.0.1:5173/', { waitUntil: 'networkidle' });
const cookie = page.getByRole('button', { name: 'OK', exact: true });
if (await cookie.isVisible()) await cookie.click();
await page.screenshot({ path: '.tmp-audit/hero/before.png' });
await writeFile('.tmp-audit/hero/sections-before.json', JSON.stringify(await page.locator('main section').evaluateAll(sections => sections.slice(1).map(section => section.outerHTML)), null, 2));
console.log(await page.evaluate(() => {
  const context = document.createElement('canvas').getContext('2d');
  context.font = '300px Impact';
  const t = context.measureText('КОМПОЗИТОРЫ');
  return { width: t.width, ascent: t.actualBoundingBoxAscent, descent: t.actualBoundingBoxDescent, left: t.actualBoundingBoxLeft, right: t.actualBoundingBoxRight };
}));
await browser.close();
