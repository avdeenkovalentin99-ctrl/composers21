import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import { chromium } from 'playwright';

const base = process.argv[2] || 'http://127.0.0.1:4173';
const output = '.tmp-improvements';
await fs.mkdir(output, { recursive: true });
const browser = await chromium.launch({ headless: true });
const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
await context.route('**/*', route => new URL(route.request().url()).origin === new URL(base).origin ? route.continue() : route.fulfill({ status: 204, body: '' }));
const page = await context.newPage();
page.setDefaultTimeout(12000);
const errors = [], failedResources = [], results = [];
page.on('pageerror', error => errors.push(error.message));
page.on('response', response => { if (response.status() >= 400 && response.url().startsWith(base)) failedResources.push({ url: response.url(), status: response.status() }); });
async function check(name, action) {
  try { await action(); results.push({ name, pass: true }); console.log('PASS '+name); }
  catch (error) { results.push({ name, pass: false, error: error.stack }); console.log('FAIL '+name+': '+error.message); }
}
async function go(route) {
  await page.goto(base+route, { waitUntil: 'networkidle' });
  await page.evaluate(() => document.fonts.ready);
  await page.locator('main section').first().waitFor();
  await page.waitForTimeout(600);
}
async function navigate(route) {
  const direct = page.locator(`.navigation-rail a[href="${route}"]`);
  if (await direct.count()) await direct.click();
  else {
    await page.locator('.navigation-rail button[aria-controls="desktop-navigation-drawer"]').click();
    await page.locator(`#desktop-navigation-drawer a[href="${route}"]`).click();
  }
  await page.waitForURL(url => url.pathname === route);
  await page.waitForTimeout(900);
}
async function assertScroll(expected) {
  await page.waitForFunction(y => Math.abs(window.scrollY-y)<3, expected);
}
try {
  await check('route metadata survives Academies cleanup, Back and Forward', async () => {
    await go('/academies');
    await navigate('/media');
    assert.equal(await page.title(), 'Медиа');
    const meta = await page.evaluate(() => Object.fromEntries(['description','og:title','og:description','twitter:title','twitter:description'].map(name => [name,document.querySelector(`meta[name="${name}"],meta[property="${name}"]`)?.content])));
    assert.equal(meta['og:title'], 'Медиа');
    assert.equal(meta['twitter:title'], 'Медиа');
    assert.equal(meta['description'],meta['og:description']);
    assert.equal(meta['description'],meta['twitter:description']);
    await page.goBack(); await page.waitForTimeout(900); assert.equal(await page.title(),'Академии');
    await page.goForward(); await page.waitForTimeout(900); assert.equal(await page.title(),'Медиа');
  });
  await check('profile metadata contains the participant name', async () => {
    await go('/participants/composers/leonid-desyatnikov');
    assert.match(await page.title(), /Леонид Десятников/);
    assert.equal(await page.locator('meta[property="og:title"]').getAttribute('content'), await page.title());
    assert.equal(await page.locator('link[rel="canonical"]').getAttribute('href'),'https://21centurycomposers.com/participants/composers/leonid-desyatnikov');
  });
  await check('desktop submenu has initial focus, Tab order, Escape and focus return', async () => {
    await go('/media');
    const trigger=page.locator('.navigation-rail button[aria-controls="desktop-navigation-drawer"]');
    await trigger.focus(); await page.keyboard.press('Enter');
    await page.waitForTimeout(350);
    assert.ok(await page.evaluate(()=>document.activeElement?.closest('#desktop-navigation-drawer')));
    for(let index=0;index<10;index++){
      await page.keyboard.press('Tab');
      assert.ok(await page.evaluate(()=>document.activeElement?.closest('[role="dialog"]')));
    }
    await page.keyboard.press('Escape'); await page.waitForTimeout(400);
    assert.ok(await trigger.evaluate(el=>el===document.activeElement),await page.evaluate(()=>document.activeElement?.tagName));
    assert.equal(await page.locator('main').evaluate(el=>Boolean(el.closest('[inert]'))),false);
  });
  await check('Academies modal contains its close button and traps/restores focus', async () => {
    await go('/academies');
    const trigger=page.getByRole('button',{name:'Открыть: Сергей Ахунов. Беседы о музыке'});
    await trigger.focus(); await page.keyboard.press('Enter');
    const dialog=page.getByRole('dialog'); await dialog.waitFor();
    assert.ok(await dialog.evaluate(el=>el.contains(document.activeElement)));
    assert.equal(await dialog.getByRole('button',{name:'Закрыть',exact:true}).count(),1);
    for(const key of ['Tab','Shift+Tab','Tab']){await page.keyboard.press(key);assert.ok(await dialog.evaluate(el=>el.contains(document.activeElement)));}
    await page.keyboard.press('Escape'); await dialog.waitFor({state:'detached'});
    assert.ok(await trigger.evaluate(el=>el===document.activeElement));
    assert.equal(await page.evaluate(()=>document.documentElement.style.overflow),'');
  });
  await check('Back restores Media scroll; a new visit starts at the top', async () => {
    await go('/media');
    await page.evaluate(()=>window.scrollTo({top:982,behavior:'instant'})); await page.waitForTimeout(100);
    const y=await page.evaluate(()=>window.scrollY);
    await navigate('/team'); await assertScroll(0);
    await page.goBack(); await page.waitForTimeout(900); await assertScroll(y);
    await navigate('/team'); await navigate('/media'); await assertScroll(0);
  });
  await check('Back restores participant catalog position', async () => {
    await go('/participants');
    await page.evaluate(()=>window.scrollTo({top:1600,behavior:'instant'}));
    const y=await page.evaluate(()=>window.scrollY);
    await page.locator('main button:has(img)').nth(4).evaluate(el=>el.click());
    await page.waitForURL(/\/participants\/composers\//); await page.waitForTimeout(900); await assertScroll(0);
    await page.goBack(); await page.waitForTimeout(900); await assertScroll(y);
  });
  await check('Afisha deep links open their concert and Back restores the reading position', async () => {
    await go('/afisha?concert=20may');
    const expanded=page.locator('main button[aria-expanded="true"]:visible');
    assert.equal(await expanded.count(),1);
    assert.ok(await page.evaluate(()=>window.scrollY>200));
    await page.evaluate(()=>window.scrollBy({top:180,behavior:'instant'}));
    const y=await page.evaluate(()=>window.scrollY);
    await navigate('/media');
    await page.goBack(); await page.waitForTimeout(1100); await assertScroll(y);
  });
  await check('portrait crops select enough source pixels for the visible box', async () => {
    await go('/participants');
    const checks=await page.locator('main button:has(img) img').evaluateAll(async images=>{
      const visible=images.filter(image=>image.getBoundingClientRect().top<innerHeight);
      await Promise.all(visible.map(image=>image.decode()));
      return Promise.all(visible.map(image=>{
        const box=image.getBoundingClientRect();
        const raw=new Image(); raw.src=image.currentSrc;
        return raw.decode().then(()=>({name:image.alt,actual:raw.width,needed:Math.max(box.width,box.height*raw.width/raw.height),largest:Number(image.getAttribute('width'))}));
      }));
    });
    for(const item of checks)assert.ok(item.actual+1>=Math.min(item.needed,item.largest),JSON.stringify(item));
  });
  await check('mobile menu and submenu keep keyboard focus and restore the trigger', async () => {
    await page.setViewportSize({width:390,height:844}); await go('/media');
    const trigger=page.getByRole('button',{name:'Открыть меню',exact:true});
    await trigger.focus(); await page.keyboard.press('Enter');
    const menu=page.getByRole('dialog',{name:'Мобильная навигация'});
    assert.ok(await menu.evaluate(el=>el.contains(document.activeElement)));
    await menu.getByRole('button',{name:'2026',exact:true}).focus(); await page.keyboard.press('Enter'); await page.waitForTimeout(100);
    assert.ok(await page.evaluate(()=>document.activeElement?.closest('#mobile-festival-submenu')));
    await page.keyboard.press('Escape'); assert.equal(await page.locator('.mobile-navigation__primary button').getAttribute('aria-expanded'),'false');
    await page.keyboard.press('Escape'); await page.waitForTimeout(100);
    assert.equal(await page.evaluate(()=>document.activeElement?.getAttribute('aria-label')),'Открыть меню');
  });
  await check('optimized fonts and local images decode on main pages at mobile and desktop sizes', async () => {
    for(const width of [390,1440]){
      await page.setViewportSize({width,height:900});
      for(const route of ['/','/festival','/participants','/partners','/academies','/afisha']){
        await go(route);
        if(route==='/afisha')await page.locator('main button[aria-expanded]:visible').first().click();
        const broken=await page.evaluate(async()=>{
          const images=[...document.images];
          images.forEach(image=>{image.loading='eager';});
          await Promise.all(images.map(image=>image.decode().catch(()=>{})));
          return images.filter(image=>image.currentSrc.startsWith(location.origin)&&!image.naturalWidth).map(image=>image.currentSrc);
        });
        assert.deepEqual(broken,[],`${route} at ${width}px`);
        const fonts=await page.evaluate(()=>[...document.fonts].filter(font=>font.status==='loaded').map(font=>font.family));
        assert.ok(fonts.length>0);
      }
    }
  });
  await check('no page errors or failed local resources',async()=>{assert.deepEqual(errors,[]);assert.deepEqual(failedResources,[]);});
} finally {
  await browser.close();
  await fs.writeFile(output+'/browser-smoke.json',JSON.stringify({checkedAt:new Date().toISOString(),base,results,errors,failedResources},null,2));
}
if(results.some(result=>!result.pass))process.exitCode=1;
