import { chromium } from 'playwright';
import fs from 'node:fs/promises';
import assert from 'node:assert/strict';
const browser = await chromium.launch({headless:true});
const errors=[];
const measurements=[];
const folder='.tmp-audit/home-design-review';
await fs.mkdir(folder,{recursive:true});
try {
 for(const [name,width,height,mobile] of [['desktop',1440,900,false],['laptop',1366,768,false],['wide',1920,1080,false],['mobile',390,844,true],['small',320,568,true],['large',430,932,true]]) {
  const page=await browser.newPage({viewport:{width,height},isMobile:mobile,hasTouch:mobile,reducedMotion:'reduce'});
  page.on('pageerror',e=>errors.push(name+': '+e.message));
  await page.goto('http://127.0.0.1:5177/',{waitUntil:'domcontentloaded'});
  await page.locator('.logo-video-hero').waitFor(); await page.evaluate(()=>document.fonts.ready);
  await page.waitForTimeout(250);
  const cookie=page.getByRole('button',{name:'OK',exact:true});if(await cookie.isVisible())await cookie.click();
  await page.screenshot({path:folder+'/'+name+'-hero.png'});
  const sections=mobile?['.festival-intro-content','.mobile-home-broadcasts','.mobile-home-media','.mobile-festival-year','footer']:['.festival-intro-content','[aria-labelledby="homepage-broadcasts-title"]','[aria-labelledby="homepage-media-title"]','[aria-labelledby="festival-year-title"]','footer'];
  if(['desktop','mobile'].includes(name))for(let i=0;i<sections.length;i++){
   const section=page.locator(sections[i]);
   await section.scrollIntoViewIfNeeded();
   for(const image of await section.locator('img').all()){
    await image.scrollIntoViewIfNeeded();
    await image.evaluate(e=>e.decode().catch(()=>{}));
   }
   await section.screenshot({path:folder+'/'+name+'-section-'+i+'.png'});
  }
  measurements.push(await page.evaluate(name=>({name,width:innerWidth,overflow:document.documentElement.scrollWidth>innerWidth,
   typography:[...document.querySelectorAll('h1,h2,.festival-intro-paragraph,.mobile-home-broadcasts__name,.mobile-home-broadcasts__date,.mobile-home-media__caption,.editorial-cta,.home-media-article p,.logo-video-hero__metadata')].filter(e=>e.getBoundingClientRect().width>0).map(e=>({text:e.textContent?.slice(0,80),font:getComputedStyle(e).fontFamily,size:getComputedStyle(e).fontSize,lineHeight:getComputedStyle(e).lineHeight,color:getComputedStyle(e).color})),
   brokenImages:[...document.querySelectorAll('img')].filter(e=>e.getBoundingClientRect().width&&e.complete&&!e.naturalWidth).map(e=>e.src)
  }),name));
  if(name==='mobile'){
   const options=page.locator('.mobile-home-broadcasts__item');
   for(let i=0;i<await options.count();i++){await options.nth(i).click();assert.equal(await options.nth(i).getAttribute('aria-pressed'),'true');assert((await page.locator('.mobile-home-broadcasts__preview').getAttribute('aria-label')).includes((await options.nth(i).locator('.mobile-home-broadcasts__name').innerText()).trim()));}
   await page.getByRole('button',{name:'Открыть меню',exact:true}).click();
   await page.getByRole('button',{name:'2026'}).first().click();
   await page.screenshot({path:folder+'/mobile-menu.png'});
   await page.setViewportSize({width:844,height:390});
   // Element screenshots can reset Chromium's touch emulation while resizing.
   const cdp=await page.context().newCDPSession(page);
   await cdp.send('Emulation.setTouchEmulationEnabled',{enabled:true,maxTouchPoints:1});
   await page.waitForTimeout(400);
   await page.goto('http://127.0.0.1:5177/',{waitUntil:'domcontentloaded'});
   await page.locator('.logo-video-hero').waitFor();
   const rotated=await page.evaluate(()=>({shell:document.querySelector('.site-shell').getBoundingClientRect().toJSON(),nav:document.querySelector('.mobile-navigation').getBoundingClientRect().toJSON(),coarse:matchMedia('(pointer: coarse)').matches,none:matchMedia('(hover: none)').matches}));
   console.log('ROTATED',JSON.stringify(rotated));
   assert.equal(rotated.shell.width,390,'landscape keeps portrait width');
   assert.equal(rotated.nav.width,390,'menu stays in portrait column');
   const close=page.getByRole('button',{name:'Закрыть навигацию',exact:true});
   if(await close.isVisible())await close.click();
   assert.equal(await page.evaluate(()=>document.documentElement.style.overflow),'');
   await page.evaluate(()=>scrollTo({top:0,behavior:'instant'}));
   await page.screenshot({path:folder+'/mobile-landscape.png'});
   await page.locator('.mobile-home-broadcasts').screenshot({path:folder+'/mobile-landscape-broadcasts.png'});
   await page.setViewportSize({width:390,height:844});await page.waitForTimeout(200);
   assert.equal(await page.locator('.site-shell').evaluate(e=>e.getBoundingClientRect().width),390);
   console.log('PASS concert switching, menu, rotation and scroll unlock');
  }
  console.log('REVIEWED',name,width,height);
  await page.close();
 }
 assert.deepEqual(errors,[]);
 await fs.writeFile(folder+'/measurements.json',JSON.stringify({errors,measurements},null,2));
 console.log('PASS',JSON.stringify(measurements.map(({name,width,overflow,brokenImages})=>({name,width,overflow,brokenImages}))));
}finally{await browser.close()}
