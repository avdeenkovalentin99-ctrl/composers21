import { chromium } from 'playwright';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
const browser=await chromium.launch({headless:true});
const errors=[];
const folder='.tmp-audit/approved-home-polish';
await fs.mkdir(folder,{recursive:true});
let releaseFirst,releaseSecond;
try {
 const firstGate=new Promise(resolve=>releaseFirst=resolve);
 const secondGate=new Promise(resolve=>releaseSecond=resolve);
 const delayed=await browser.newPage({viewport:{width:390,height:844},isMobile:true,hasTouch:true,reducedMotion:'reduce'});
 delayed.on('pageerror',e=>errors.push(e.message));
 await delayed.route('**/*.mp4',async route=>{
  await (route.request().url().includes('herovidmob')?secondGate:firstGate);
  await route.continue();
 });
 await delayed.goto('http://127.0.0.1:5177/',{waitUntil:'domcontentloaded'});
 await delayed.locator('.logo-video-hero__emblem').waitFor();
 assert.equal(await delayed.locator('.logo-video-hero__emblem').getAttribute('data-video-ready'),'false');
 assert.equal(await delayed.locator('.logo-video-hero__emblem').evaluate(e=>getComputedStyle(e).opacity),'0');
 assert.equal(await delayed.locator('video[poster]').count(),0);
 releaseFirst();
 await delayed.waitForFunction(()=>document.querySelector('.logo-video-hero video').readyState>=3);
 assert.equal(await delayed.locator('.logo-video-hero__emblem').getAttribute('data-video-ready'),'false','wait for both videos');
 releaseSecond();
 await delayed.waitForFunction(()=>document.querySelector('.logo-video-hero__emblem').dataset.videoReady==='true');
 const loaded=await delayed.locator('.logo-video-hero video').evaluateAll(videos=>videos.map(v=>({state:v.readyState,paused:v.paused,seeking:v.seeking,time:v.currentTime})));
 assert(loaded.every(v=>v.state>=3&&v.paused&&!v.seeking));
 assert(loaded[1].time>0,'second video seek completed');
 assert.equal(await delayed.locator('.logo-video-hero__emblem').evaluate(e=>getComputedStyle(e).opacity),'1');
 console.log('PASS: no logo before video, waits for both videos including seek, reduced motion ready, no poster',JSON.stringify(loaded));
 await delayed.close();

 for(const [width,height,mobile] of [[320,568,true],[390,844,true],[430,932,true],[844,390,true],[1440,900,false]]){
  const page=await browser.newPage({viewport:{width,height},isMobile:mobile,hasTouch:mobile,reducedMotion:'reduce'});
  page.on('pageerror',e=>errors.push(e.message));
  await page.goto('http://127.0.0.1:5177/',{waitUntil:'domcontentloaded'});
  await page.waitForFunction(()=>document.querySelector('.logo-video-hero__emblem')?.dataset.videoReady==='true');
  await page.evaluate(()=>document.fonts.ready);
  const cookie=page.getByRole('button',{name:'OK',exact:true});if(await cookie.isVisible())await cookie.click();
  const state=await page.evaluate(()=>{
   const font=s=>parseFloat(getComputedStyle(document.querySelector(s)).fontSize);
   const box=e=>{const b=e.getBoundingClientRect();return{x:b.x,y:b.y,width:b.width,height:b.height,right:b.right,bottom:b.bottom}};
   return {width:innerWidth,overflow:document.documentElement.scrollWidth>innerWidth,shell:box(document.querySelector('.site-shell')),
    title:font('.logo-video-hero__title'),body:font('.festival-intro-paragraph'),heroCaption:font('.logo-video-hero__metadata'),
    smallCaptions:['.mobile-home-media__caption','.mobile-home-broadcasts__date'].map(font),
    heroText:[...document.querySelectorAll('.logo-video-hero__metadata p,.logo-video-hero__status,.logo-video-hero__year,.logo-video-hero__title')].map(e=>({text:e.textContent,...box(e)})),
    bars:[...document.querySelectorAll('.mobile-navigation__plaque>span')].map(e=>({width:getComputedStyle(e).width,height:getComputedStyle(e).height,opacity:getComputedStyle(e).opacity,...box(e)}))};
  });
  assert(!state.overflow);
  assert(state.body>=14);
  assert(state.heroCaption>=11);
  assert(state.smallCaptions.every(s=>s>=11));
  assert(state.heroText.every(r=>r.x>=state.shell.x-1&&r.right<=state.shell.right+1));
  if(mobile){assert(state.title>=32);assert(state.bars.every(b=>b.width<=1&&b.height>=10));}
  if(width===844){assert.equal(state.shell.width,390);assert.equal(state.shell.x,227);}
  await page.screenshot({path:folder+'/hero-'+width+'.png'});
  if(width===390||width===1440){
   await page.locator('.festival-intro-content').scrollIntoViewIfNeeded();
   await page.screenshot({path:folder+'/intro-'+width+'.png'});
   const media=page.locator(width===390?'.mobile-home-media':'[aria-labelledby="homepage-media-title"]');
   for(const img of await media.locator('img').all()){await img.scrollIntoViewIfNeeded();await img.evaluate(e=>e.decode().catch(()=>{}));}
   await page.screenshot({path:folder+'/media-'+width+'.png'});
  }
  if(mobile){
   await page.getByRole('button',{name:'Открыть меню',exact:true}).click();
   await page.getByRole('button',{name:'2026'}).first().click();
   await page.getByRole('button',{name:'Закрыть навигацию',exact:true}).click();
   assert.equal(await page.evaluate(()=>document.documentElement.style.overflow),'');
  }
  console.log('PASS layout',JSON.stringify(state));
  await page.close();
 }
 const motion=await browser.newPage({viewport:{width:390,height:844},isMobile:true,hasTouch:true});
 motion.on('pageerror',e=>errors.push(e.message));
 await motion.goto('http://127.0.0.1:5177/');
 await motion.waitForFunction(()=>document.querySelector('.logo-video-hero__emblem')?.dataset.videoReady==='true');
 await motion.waitForFunction(()=>[...document.querySelectorAll('.logo-video-hero video')].every(v=>!v.paused&&v.currentTime>0));
 await motion.locator('.festival-intro-content').scrollIntoViewIfNeeded();
 await motion.waitForFunction(()=>document.querySelector('.festival-intro-content').dataset.visible==='true');
 await motion.waitForFunction(()=>getComputedStyle(document.querySelector('.festival-intro-cta')).opacity==='1',null,{timeout:2500});
 console.log('PASS playback and About festival link fully revealed within 2.5s');
 assert.deepEqual(errors,[]);
 console.log('PASS no runtime errors');
}finally{releaseFirst?.();releaseSecond?.();await browser.close()}
