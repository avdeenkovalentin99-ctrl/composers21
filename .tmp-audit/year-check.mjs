import { chromium } from 'playwright';
import assert from 'node:assert/strict';
const browser = await chromium.launch({ headless: true });
const errors = [];
try {
  const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
  page.on('pageerror', error => errors.push(error.message));
  await page.goto('http://127.0.0.1:5176/', { waitUntil: 'domcontentloaded' });
  await page.locator('#home-old-hero').waitFor();
  await page.evaluate(() => document.fonts.ready);
  const section = page.locator('section[aria-labelledby="festival-year-title"]');
  for (const width of [1440, 1024, 1920]) {
    await page.setViewportSize({ width, height: 1000 });
    await section.evaluate(e => scrollTo({ top: e.getBoundingClientRect().top + scrollY, behavior: 'instant' }));
    await page.evaluate(() => new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r))));
    const state = await section.evaluate(e => ({
      links: [...e.querySelectorAll('a')].map(a => ({ label: a.textContent.trim(), href: a.getAttribute('href'), rect: a.getBoundingClientRect().toJSON() })),
      digits: [...e.querySelectorAll('.home-year-figure > .home-year-digit')].map(d => ({ text: d.textContent, rect: d.getBoundingClientRect().toJSON() })),
      labels: [...e.querySelectorAll('a > span:last-child')].map(d => d.getBoundingClientRect().top),
      images: [...e.querySelectorAll('img')].map(img => img.naturalWidth),
      inversions: [...e.querySelectorAll('.home-year-inversion')].map(el => ({ clip: getComputedStyle(el).clipPath, background: getComputedStyle(el).backgroundColor, ink: getComputedStyle(el.firstElementChild).color })),
      headingWeight: getComputedStyle(e.querySelector('h2')).fontWeight,
      captionWeight: getComputedStyle(e.querySelector('a > span:last-child')).fontWeight,
      overflow: document.documentElement.scrollWidth > innerWidth,
    }));
    assert.equal(state.links.length, 5);
    assert.equal(state.images.length, 0);
    assert.equal(state.inversions.length, 2);
    state.inversions.forEach(inversion => {
      assert.notEqual(inversion.clip, 'none');
      assert.equal(inversion.background, 'rgb(15, 15, 15)');
      assert.equal(inversion.ink, 'rgb(255, 255, 255)');
    });
    assert.ok(Number(state.headingWeight) > Number(state.captionWeight));
    assert.deepEqual(state.links.map(l => l.href), ['/afisha', '/participants', '/academies', '/partners', '/team']);
    assert.equal(state.digits.map(d => d.text).join(''), '2026');
    assert.equal(new Set(state.labels).size, 1);
    assert.ok(state.digits.every(d => d.rect.bottom < state.labels[0]));
    assert.equal(state.overflow, false);
    console.log(JSON.stringify({ width, ...state }));
    await page.screenshot({ path: '.tmp-audit/rail/year-reference-' + width + '.png' });
  }
  await page.setViewportSize({ width: 1440, height: 1000 });
  const first = section.locator('a').first();
  await first.hover();
  await page.waitForTimeout(350);
  assert.equal(await first.locator('span').last().evaluate(e => getComputedStyle(e).color), 'rgb(255, 255, 255)');
  await first.focus();
  assert.ok(await first.evaluate(e => e === document.activeElement));
  await first.press('Enter');
  await page.waitForURL('**/afisha');
  assert.deepEqual(errors, []);
  console.log('Year layout, routes, hover and keyboard checks passed; page errors: 0');
} finally {
  await browser.close();
}
