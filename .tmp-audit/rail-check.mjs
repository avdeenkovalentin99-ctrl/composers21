import { chromium } from 'playwright';
import assert from 'node:assert/strict';
import { mkdir } from 'node:fs/promises';

const output = '.tmp-audit/rail';
await mkdir(output, { recursive: true });
const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 1440, height: 800 } });
const errors = [];
const resourceErrors = [];
page.on('pageerror', error => errors.push(error.message));
page.on('console', message => {
  if (message.type() !== 'error') return;
  if (message.text().startsWith('Failed to load resource')) resourceErrors.push({ text: message.text(), url: message.location().url });
  else errors.push(message.text());
});
await page.addInitScript(() => {
  const originalAdd = window.addEventListener;
  const originalRemove = window.removeEventListener;
  const scrollListeners = new Map();
  window.__railScrollListeners = scrollListeners;
  window.addEventListener = function(type, callback, options) {
    if (type === 'scroll') scrollListeners.set(callback, options);
    return originalAdd.call(this, type, callback, options);
  };
  window.removeEventListener = function(type, callback, options) {
    if (type === 'scroll') scrollListeners.delete(callback);
    return originalRemove.call(this, type, callback, options);
  };
});
const settle = () => page.evaluate(() => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve))));
async function check(name, screenshot = false) {
  await settle();
  const state = await page.evaluate(() => {
    const rail = document.querySelector('.navigation-rail');
    const railRect = rail.getBoundingClientRect();
    const viewportHeight = innerHeight;
    const media = document.querySelector('[data-nav-light-start]');
    const boundary = location.pathname === '/' ? Math.max(0, Math.min(viewportHeight, media.getBoundingClientRect().top)) : 0;
    const expected = boundary > 0 ? [{ y: 0, bottom: boundary }] : [];
    const footer = document.querySelector('[data-nav-dark-start]');
    const footerTop = location.pathname === '/' && footer ? Math.max(0, Math.min(viewportHeight, footer.getBoundingClientRect().top)) : viewportHeight;
    if (footerTop < viewportHeight) expected.push({ y: footerTop, bottom: viewportHeight });
    const nativeScroll = rail.dataset.nativeScroll === 'true';
    const nativeBoundary = rail.querySelector('.navigation-rail-light-window').getBoundingClientRect().top;
    const actual = nativeScroll ? (nativeBoundary > 0 ? [{ y: 0, bottom: nativeBoundary }] : []) : [...rail.querySelectorAll('clipPath rect')].map(rect => ({
      y: Number(rect.getAttribute('y')), bottom: Number(rect.getAttribute('y')) + Number(rect.getAttribute('height')),
    })).filter(rect => rect.bottom > rect.y);
    const nativeFooter = rail.querySelector('.navigation-rail-footer-window').getBoundingClientRect().top;
    if (nativeScroll && nativeFooter < viewportHeight) actual.push({ y: Math.max(0, nativeFooter), bottom: viewportHeight });
    const at = (rects, y) => rects.some(rect => y >= rect.y && y < rect.bottom);
    let mismatch = null;
    for (let y = 0.25; y < viewportHeight; y += 0.5) {
      if (at(expected, y) !== at(actual, y)) { mismatch = y; break; }
    }
    return {
      nativeScroll, pathname: location.pathname, scrollY, width: railRect.width, height: railRect.height, expected, actual, mismatch,
      listeners: [...window.__railScrollListeners].map(([callback, options]) => ({ name: callback.name, source: String(callback).slice(0, 200), options })),
      links: rail.querySelectorAll('a').length, buttons: rail.querySelectorAll('button').length,
      duplicateControls: rail.querySelectorAll('[aria-hidden="true"] a, [aria-hidden="true"] button').length,
      square: getComputedStyle(rail.querySelector('.navigation-rail-indicator > span')).backgroundColor,
    };
  });
  console.log(JSON.stringify({ name, ...state }));
  assert.equal(state.mismatch, null, `${name}: mask differs at y=${state.mismatch}`);
  assert.equal(state.width, 64);
  assert.equal(state.links, 4);
  assert.equal(state.buttons, 1);
  assert.equal(state.duplicateControls, 0);
  assert.equal(state.square, 'rgb(100, 17, 31)');
  if (state.pathname === '/') {
    const railListeners = state.listeners.filter(listener => listener.name === 'requestViewportFrame' || listener.name === 'onScroll');
    assert.equal(railListeners.length, state.nativeScroll ? 0 : 1, `${name}: no rail scroll listener in native mode`);
    if (!state.nativeScroll) assert.equal(railListeners[0].options.passive, true);
  }
  if (screenshot) await page.screenshot({ path: `${output}/${name}.png` });
}
async function position(selector, y) {
  await page.locator(selector).evaluate((section, viewportY) => {
    window.scrollTo({ top: section.getBoundingClientRect().top + scrollY - viewportY, behavior: 'instant' });
  }, y);
}

try {
  await page.goto('http://127.0.0.1:5176/', { waitUntil: 'domcontentloaded' });
  await page.locator('#home-old-hero').waitFor();
  await page.evaluate(() => document.fonts.ready);
  await check('hero', true);
  await position('section[aria-labelledby="festival-about-title"]', 560);
  await check('hero-about-70-30', true);
  await position('section[aria-labelledby="festival-about-title"]', 240);
  await check('hero-about-still-dark', true);
  await position('section[aria-labelledby="homepage-broadcasts-title"]', 560);
  await check('about-broadcasts', true);
  await position('section[aria-labelledby="homepage-media-title"]', 400);
  await check('broadcasts-media', true);
  await position('section[aria-labelledby="homepage-media-title"]', 240);
  await check('split-label', true);
  await position('section[aria-labelledby="festival-year-title"]', 400);
  await check('media-year', true);
  await page.evaluate(() => window.scrollTo({ top: document.body.scrollHeight, behavior: 'instant' }));
  await check('footer', true);
  for (const top of [0, 2400, 500, 1800, 20, 950]) {
    await page.evaluate(y => window.scrollTo({ top: y, behavior: 'instant' }), top);
    await check(`fast-${top}`);
  }
  await page.setViewportSize({ width: 1280, height: 720 });
  await check('resize', true);
  await page.setViewportSize({ width: 1440, height: 500 });
  await position('section[aria-labelledby="festival-about-title"]', 0);
  await check('about-full', true);
  await position('section[aria-labelledby="homepage-broadcasts-title"]', 0);
  await check('broadcasts-full', true);
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await position('section[aria-labelledby="homepage-media-title"]', 250);
  await check('reduced-motion');
  await page.emulateMedia({ reducedMotion: 'no-preference' });

  const aboutLink = page.locator('.navigation-rail a[href="/festival"]');
  await aboutLink.focus();
  await check('focus', true);
  assert.equal(await page.locator('.navigation-rail-art [data-focused="true"]').count(), 3);
  await page.keyboard.press('Enter');
  await page.waitForURL('**/festival');
  await page.locator('#home-old-hero').waitFor({ state: 'detached' });
  await check('interior', true);
  await page.locator('.navigation-rail button').click();
  await page.locator('#desktop-navigation-drawer').waitFor();
  await page.keyboard.press('Escape');
  await page.locator('#desktop-navigation-drawer').waitFor({ state: 'detached' });
  await page.locator('.navigation-rail a[href="/festival"]').click();
  assert.equal(await page.locator('.navigation-rail-art [data-focused="true"]').count(), 0, 'mouse activation has no focus frame');

  await page.goto('http://127.0.0.1:5176/#homepage-media-title', { waitUntil: 'domcontentloaded' });
  await page.locator('[data-nav-light-start]').waitFor();
  await page.evaluate(() => document.fonts.ready);
  await check('initial-anchor', true);
  // Existing routing uses manual restoration; verify actual and explicit jumps.
  await page.locator('#homepage-media-title').evaluate(element => element.scrollIntoView({ behavior: 'instant' }));
  await check('anchor-jump');
  await page.reload({ waitUntil: 'domcontentloaded' });
  await page.locator('[data-nav-light-start]').waitFor();
  await page.evaluate(() => document.fonts.ready);
  await check('reload-anchor');
  await page.evaluate(() => window.dispatchEvent(new PageTransitionEvent('pageshow', { persisted: true })));
  await check('pageshow-restoration');
  await page.locator('section[aria-labelledby="festival-about-title"]').evaluate(section => { section.style.paddingBottom = '137px'; });
  await check('content-resize');
  await page.setViewportSize({ width: 1440, height: 800 });
  await position('[data-nav-light-start]', 240);
  await check('final-boundary', true);
  const geometry = await page.evaluate(() => {
    const light = document.querySelector('.navigation-rail-art[data-theme="light"]');
    const dark = document.querySelector('.navigation-rail-art[data-theme="dark"]');
    return {
      labelDelta: light.querySelector('.navigation-rail-label').getBoundingClientRect().top - dark.querySelector('.navigation-rail-label').getBoundingClientRect().top,
      border: getComputedStyle(dark).borderLeftColor,
      lineTop: getComputedStyle(dark, '::before').top,
    };
  });
  assert.ok(Math.abs(geometry.labelDelta) < 0.02, 'artwork stays stationary');
  assert.equal(geometry.border, 'rgba(0, 0, 0, 0)');
  assert.equal(geometry.lineTop, '80px');
  const cdp = await page.context().newCDPSession(page);
  await cdp.send('Emulation.setCPUThrottlingRate', { rate: 6 });
  for (const delta of [120, -300, 650, -500, 180]) {
    await page.mouse.wheel(0, delta);
    await check(`wheel-${delta}`);
  }
  await cdp.send('Emulation.setCPUThrottlingRate', { rate: 1 });
  await page.evaluate(() => window.scrollTo({ top: document.body.scrollHeight, behavior: 'instant' }));
  await check('footer-final', true);
  await page.setViewportSize({ width: 1440, height: 1200 });
  await position('[data-nav-light-start]', 80);
  await check('both-boundaries-visible', true);
  console.log(JSON.stringify({ name: 'desktop-errors', errors, resourceErrors }));
  assert.deepEqual(errors, []);
} finally {
  await browser.close();
}
