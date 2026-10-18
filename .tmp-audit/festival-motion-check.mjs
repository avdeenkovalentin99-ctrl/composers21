import { chromium } from 'playwright';
import assert from 'node:assert/strict';
const browser = await chromium.launch({ headless: true });
const base = 'http://127.0.0.1:5173';
try {
  const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
  const errors = [];
  page.on('pageerror', e => errors.push(e.message));
  await page.goto(base, { waitUntil: 'domcontentloaded' });
  const nav = page.locator('.home-year-composition');
  await nav.waitFor();
  await page.evaluate(() => document.fonts.ready);
  await nav.scrollIntoViewIfNeeded();
  await page.mouse.move(10, 10);
  const columns = nav.locator('.home-year-column');
  const snapshot = () => nav.evaluate(e => [...e.querySelectorAll('.home-year-column')].map(column => ({
    bounds: column.getBoundingClientRect().toJSON(),
    label: column.lastElementChild.getBoundingClientRect().toJSON(),
    figures: [...column.querySelectorAll('.home-year-square,.home-year-diagonal,.home-year-hairline,.home-year-inversion')].map(f => ({
      x: parseFloat(f.style.getPropertyValue('--figure-x')) || 0,
      y: parseFloat(f.style.getPropertyValue('--figure-y')) || 0,
      transform: getComputedStyle(f).transform,
    })),
    digits: [...column.querySelectorAll('.home-year-figure .home-year-digit')].map(d => ({
      rect: d.getBoundingClientRect().toJSON(),
      transform: getComputedStyle(d).transform,
      translate: getComputedStyle(d).translate,
    })),
  })));
  const initial = await snapshot();
  await page.waitForTimeout(300);
  assert.deepEqual(await snapshot(), initial, 'At rest the complete block is stationary');
  await nav.screenshot({ path: '.tmp-audit/media-seam/festival-motion-rest.png' });
  for (let index = 0; index < 4; index++) {
    for (let pass = 0; pass < 3; pass++) {
      const before = await snapshot();
      await columns.nth(index).hover();
      await page.waitForTimeout(500);
      const active = await snapshot();
      assert.notDeepEqual(active[index].figures, before[index].figures, 'Hovered figures move');
      for (let other = 0; other < 5; other++) {
        assert.deepEqual(active[other].bounds, initial[other].bounds, 'Grid stays fixed');
        assert.deepEqual(active[other].label, initial[other].label, 'Labels stay fixed');
        if (other !== index) assert.deepEqual(active[other].figures, before[other].figures, 'Other column phases stay frozen');
      }
      for (const f of active[index].figures) {
        assert.ok(Math.abs(f.x) <= 12 && Math.abs(f.y) <= 12, 'Motion remains bounded');
      }
      if (index === 1 || index === 2) {
        const [a, b] = active[index].digits;
        for (const key of ['x','y','width','height']) assert.ok(Math.abs(a.rect[key]-b.rect[key]) < 0.05, 'Inverted digit remains registered: '+key);
        assert.equal(a.transform,b.transform);
      }
      await page.mouse.move(10, 10);
      await page.waitForTimeout(450);
      const stopped = await snapshot();
      await page.waitForTimeout(200);
      const frozen = await snapshot();
      assert.deepEqual(frozen[index].figures, stopped[index].figures, 'Figures retain their stopped positions');
      assert.notDeepEqual(stopped[index].figures, initial[index].figures, 'Figures do not return to origin');
      console.log('column '+index+' pass '+pass+' stopped', JSON.stringify(stopped[index].figures.map(f=>[f.x,f.y])));
    }
  }
  // Rapid reversals retain position and keep the accumulated phase bounded.
  for (let i = 0; i < 12; i++) {
    const column = columns.nth(i % 4);
    const before = await snapshot();
    await column.hover();
    const after = await snapshot();
    for (let f = 0; f < after[i%4].figures.length; f++) {
      const a = before[i%4].figures[f], b = after[i%4].figures[f];
      assert.ok(Math.hypot(b.x-a.x,b.y-a.y) < 2, 'No jump on repeated hover');
    }
    await page.waitForTimeout(40);
    await page.mouse.move(10,10);
    await page.waitForTimeout(400);
  }
  await page.waitForTimeout(1100);
  const resting = await snapshot();
  for(const c of resting) for(const d of c.digits) {
    const m = d.transform.match(/matrix\(([^)]+)\)/)[1].split(',').map(Number);
    assert.ok(Math.abs(m[1]) < 0.00001 && Math.abs(m[2]) < 0.00001, 'Digits return upright');
  }
  const dot = nav.locator('.home-year-team-dot');
  const dotState = () => dot.evaluate(e => { const r=e.getBoundingClientRect();return {x:r.x+r.width/2,y:r.y+r.height/2,width:r.width,height:r.height}; });
  const dotRest = await dotState();
  assert.equal(dotRest.width,44);
  await columns.nth(4).hover();
  await page.waitForTimeout(450);
  const dotHover = await dotState();
  assert.ok(Math.abs(dotHover.width/44-1.14)<0.001);
  assert.ok(Math.abs(dotHover.x-dotRest.x)<0.01 && Math.abs(dotHover.y-dotRest.y)<0.01,'Dot scales from center');
  await page.mouse.move(10,10);
  await page.waitForTimeout(450);
  assert.deepEqual(await dotState(),dotRest);
  await columns.nth(2).hover();
  await page.waitForTimeout(1100);
  await nav.screenshot({path:'.tmp-audit/media-seam/festival-motion-hover.png'});
  await page.emulateMedia({reducedMotion:'reduce'});
  await page.waitForTimeout(100);
  const reduced = await snapshot();
  await page.waitForTimeout(400);
  assert.deepEqual(await snapshot(),reduced,'Reduced motion stops figure updates');
  await columns.nth(4).hover();
  assert.equal((await dotState()).width,44);
  await page.mouse.move(10,10);
  await page.waitForTimeout(250);
  assert.equal(await nav.locator(':scope > span').evaluate(e=>getComputedStyle(e).opacity),'0','Link highlight clears');
  for (const [index,path] of ['/afisha','/participants','/academies','/partners','/team'].entries()) {
    await page.locator('.home-year-column').nth(index).click();
    await page.waitForURL(base+path);
    console.log('link passed',path);
    await page.goto(base,{waitUntil:'domcontentloaded'});
    await page.locator('.home-year-composition').waitFor();
    await page.locator('.home-year-composition').scrollIntoViewIfNeeded();
  }
  await page.setViewportSize({width:390,height:844});
  assert.equal(await nav.isVisible(),false,'Desktop block stays hidden on mobile');
  assert.deepEqual(errors,[]);
  console.log('All Festival hover checks passed');
} finally { await browser.close(); }
