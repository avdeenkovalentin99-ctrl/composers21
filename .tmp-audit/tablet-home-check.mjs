import { chromium } from 'playwright';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 768, height: 1024 }, hasTouch: true });
page.setDefaultTimeout(15000);
const errors = [];
console.log('Browser ready');
page.on('pageerror', error => errors.push(error.message));
try {
  await page.goto('http://127.0.0.1:5173/', { waitUntil: 'domcontentloaded' });
  await page.locator('.mobile-festival-hero').waitFor();
  await page.evaluate(() => document.fonts.ready);
  await page.getByRole('button', { name: 'OK', exact: true }).click();
  const results = [];
  for (const [width, height] of [[390,844], [768,1024], [820,1180], [834,1194], [1024,1366], [1024,768], [1180,820], [1366,1024], [1440,900]]) {
    await page.setViewportSize({ width, height });
    const mobile = width < 1024 || (width < 1280 && height >= width);
    await page.locator(mobile ? '.mobile-festival-hero' : '.festival-hero').waitFor({state:'visible'});
    await page.waitForTimeout(700);
    const state = await page.evaluate(() => {
      const visible = s => [...document.querySelectorAll(s)].some(e => e.getBoundingClientRect().width > 0 && e.getBoundingClientRect().height > 0);
      const hero = document.querySelector('.mobile-festival-hero, .festival-hero');
      return { width: innerWidth, height: innerHeight, scrollWidth: document.documentElement.scrollWidth,
        heroHeight: hero?.getBoundingClientRect().height,
        mobile: visible('.mobile-festival-hero'), menu: visible('.mobile-navigation'), rail: visible('.navigation-rail'),
        broadcasts: visible('.mobile-home-broadcasts'), media: visible('.mobile-home-media'), year: visible('.mobile-festival-year'),
        desktopBroadcasts: visible('[aria-labelledby="homepage-broadcasts-title"]'),
        video: hero?.querySelector('video')?.getAttribute('src'),
        introColumns: getComputedStyle(document.querySelector('#festival-about-title').parentElement.parentElement).gridTemplateColumns };
    });
    results.push(state);
    console.log(JSON.stringify(state));
    assert.equal(state.mobile, mobile);
    assert.equal(state.menu, mobile);
    assert.equal(state.rail, !mobile);
    assert.equal(state.broadcasts, mobile);
    assert.equal(state.media, mobile);
    assert.equal(state.year, mobile);
    assert.equal(state.desktopBroadcasts, !mobile);
    assert(state.scrollWidth <= width + 1, 'horizontal overflow');
    if (mobile && width >= 640) assert(Math.abs(state.heroHeight - height) < 2, 'tablet hero must fit viewport');
    if ([768,1024].includes(width)) await page.screenshot({ path: '.tmp-audit/tablet-home-' + width + '-' + height + '.png' });
    if (width === 768) await page.screenshot({ path: '.tmp-audit/tablet-home-full.png', fullPage: true });
    if (mobile) {
      assert(state.video.includes('herovidmob'));
      await page.getByRole('button', { name: 'Открыть меню', exact: true }).click();
      await page.locator('.mobile-navigation__primary button').first().click();
      await page.locator('.mobile-navigation__secondary').waitFor({ state: 'visible' });
      await page.getByRole('button', { name: 'Закрыть навигацию', exact: true }).click();
    }
  }
  await page.setViewportSize({width:1024,height:1366});
  await page.getByRole('button', {name:'Открыть меню', exact:true}).click();
  await page.setViewportSize({width:1366,height:1024});
  await page.waitForTimeout(700);
  assert.equal(await page.evaluate(()=>document.documentElement.style.overflow),'');
  await page.locator('#festival-about-title').scrollIntoViewIfNeeded();
  await page.waitForTimeout(800);
  await page.locator('.navigation-rail button').first().click();
  await page.setViewportSize({width:1024,height:1366});
  await page.waitForTimeout(700);
  assert.equal(await page.evaluate(()=>document.documentElement.style.overflow),'');
  assert.equal(await page.locator('#desktop-navigation-drawer').count(),0);
  await page.goto('http://127.0.0.1:5173/festival', {waitUntil:'domcontentloaded'});
  assert(await page.locator('.navigation-rail').isVisible(), 'inner page breakpoint unchanged');
  assert.deepEqual(errors, []);
  await fs.writeFile('.tmp-audit/tablet-home-results.json',JSON.stringify(results,null,2));
  console.log('PASS: nine viewports, menus, rotation scroll unlock, inner-page navigation, no runtime errors');
} finally { await browser.close(); }
