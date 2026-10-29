import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import {chromium,webkit,devices} from 'playwright';

const base=process.argv[2]||'http://127.0.0.1:4173';
const engine=process.argv[3]||'webkit';
const only=process.argv[4];
let browser;
const results=[];
await fs.mkdir('.tmp-device',{recursive:true});
try{
  for(const fault of ['none','storage-denied','storage-quota','video-denied'].filter(fault=>!only||fault===only)){
    console.log('CHECK '+engine+' '+fault);
    browser=await ({chromium,webkit}[engine]).launch({headless:true});
    const context=await browser.newContext({...devices[engine==='webkit'?'iPhone 13':'Pixel 5']});
    await context.route('**/*',route=>{
      const url=new URL(route.request().url());
      if(url.origin!==new URL(base).origin)return route.fulfill({status:204,body:''});
      if(fault==='video-denied'&&url.pathname.endsWith('.mp4'))return route.abort();
      return route.continue();
    });
    if(fault==='storage-denied')await context.addInitScript(()=>{
      for(const name of ['localStorage','sessionStorage'])Object.defineProperty(window,name,{get(){throw new DOMException('Storage is disabled','SecurityError');}});
    });
    if(fault==='storage-quota')await context.addInitScript(()=>{
      localStorage.setItem('composersxxi_cookie_notice_accepted','false');
      localStorage.setItem('participants-view-mode','grid');
      sessionStorage.setItem('participants-active-category','composers');
      Storage.prototype.setItem=()=>{throw new DOMException('Quota exceeded','QuotaExceededError');};
    });
    if(fault==='video-denied')await context.addInitScript(()=>{HTMLMediaElement.prototype.play=()=>Promise.reject(new DOMException('Autoplay disabled','NotAllowedError'));});
    const page=await context.newPage();page.setDefaultTimeout(12000);
    const errors=[];page.on('pageerror',error=>errors.push(error.message));
    try{
      await page.goto(base+'/',{waitUntil:'domcontentloaded'});
      console.log('  home loaded');
      await page.locator('main h1').waitFor();await page.evaluate(()=>document.fonts.ready);
      const emblem=page.locator('.logo-video-hero__emblem');
      assert.equal(await emblem.evaluate(element=>getComputedStyle(element).opacity),'1');
      const posters=await page.locator('.logo-video-hero__mass video').evaluateAll(async videos=>Promise.all(videos.map(async video=>{
        const image=new Image();image.src=video.poster;
        await Promise.race([image.decode(),new Promise((_,reject)=>setTimeout(()=>reject(new Error('Poster did not decode')),10000))]);
        return {src:video.poster,width:image.naturalWidth};
      })));
      assert.equal(posters.length,2);assert.ok(posters.every(poster=>poster.width>0));
      console.log('  posters decoded');
      const cookie=page.getByRole('button',{name:'OK',exact:true});
      if(await cookie.isVisible())await cookie.tap();
      if(fault==='video-denied')await page.screenshot({path:`.tmp-device/startup-${engine}-${fault}.png`,timeout:12000});
      await emblem.evaluate(element=>window.scrollTo({top:window.scrollY+element.getBoundingClientRect().bottom+2,behavior:'instant'}));
      const menu=page.getByRole('button',{name:'Открыть меню',exact:true});await menu.tap();
      await page.getByRole('dialog').getByRole('button',{name:'2026',exact:true}).tap();
      await page.locator('#mobile-festival-submenu a[href="/participants"]').tap();
      await page.waitForURL(url=>url.pathname==='/participants');
      await page.locator('main button:has(img)').first().waitFor();
      await page.getByRole('button',{name:'ИСПОЛНИТЕЛИ',exact:true}).tap();
      await page.waitForTimeout(450);
      await page.locator('main button:has(img)').first().tap();
      await page.waitForURL(/\/participants\/(soloists|ensembles)\//);
      await page.locator('main h1').waitFor();
      await page.goBack();
      await page.getByRole('button',{name:'ИСПОЛНИТЕЛИ',exact:true}).waitFor();
      assert.equal(await page.getByRole('button',{name:'ИСПОЛНИТЕЛИ',exact:true}).getAttribute('aria-pressed'),'true');
      await page.goBack();await page.locator('.logo-video-hero__emblem').waitFor();
      assert.equal(await page.getByRole('button',{name:'OK',exact:true}).isVisible(),false);
      assert.deepEqual(errors,[]);
      results.push({fault,pass:true,posters,errors});console.log('PASS '+engine+' '+fault);
    }catch(error){results.push({fault,pass:false,error:error.stack,errors});console.log('FAIL '+engine+' '+fault+': '+error.message);}
    await context.close();
    await browser.close();browser=undefined;
  }
}finally{
  await browser?.close();
  await fs.writeFile(`.tmp-device/startup-results-${engine}${only?'-'+only:''}.json`,JSON.stringify({checkedAt:new Date().toISOString(),engine,base,emulation:true,results},null,2));
}
if(results.some(result=>!result.pass))process.exitCode=1;
