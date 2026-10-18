import {chromium} from 'playwright';
import assert from 'node:assert/strict';
const browser=await chromium.launch({headless:true});
try {
const page=await browser.newPage({viewport:{width:390,height:844},deviceScaleFactor:1,isMobile:true,hasTouch:true});
const errors=[];page.on('pageerror',e=>errors.push(e.message));
await page.goto('http://127.0.0.1:5173',{waitUntil:'domcontentloaded'});
await page.locator('.mobile-festival-hero').waitFor();
await page.evaluate(()=>document.fonts.ready);
await page.locator('.mobile-festival-hero video').first().evaluate(v=>new Promise(resolve=>{if(v.readyState>=2)return resolve();v.addEventListener('loadeddata',()=>resolve(),{once:true});setTimeout(resolve,10000);}));
await page.getByRole('button',{name:'OK',exact:true}).click();
await page.screenshot({path:'.tmp-audit/mobile-hero-390.png'});
for (const [width,height] of [[320,568],[390,844],[430,932],[768,1024],[1023,768]]) {
 await page.setViewportSize({width,height});
 const state=await page.evaluate(()=>{
 const hero=document.querySelector('.mobile-festival-hero');
 const box=s=>hero.querySelector(s).getBoundingClientRect();
 return {width:innerWidth,scrollWidth:document.documentElement.scrollWidth,heroHeight:hero.getBoundingClientRect().height,
 seam:box('.mobile-festival-hero__piano').top-box('.mobile-festival-hero__violin').bottom,
 videos:[...hero.querySelectorAll('video')].map(v=>({src:v.getAttribute('src'),width:v.videoWidth,height:v.videoHeight,controls:v.controls,pip:v.disablePictureInPicture,muted:v.muted,inline:v.playsInline,pointer:getComputedStyle(v).pointerEvents})),
 meta:[...hero.querySelectorAll('.mobile-festival-hero__metadata span')].map(e=>{const r=e.getBoundingClientRect();return [r.left,r.right]})};
 });
 assert(state.scrollWidth<=width+1);
 assert(Math.abs(state.seam)<0.1);
 assert(state.heroHeight>=height-1);
 assert(state.videos.every(v=>!v.controls&&v.pip&&v.muted&&v.inline&&v.pointer==='none'));
 assert(state.meta.every(([left,right])=>left>=0&&right<=width));
 console.log(width,JSON.stringify(state));
}
await page.setViewportSize({width:390,height:844});
await page.getByRole('button',{name:/меню/i}).first().click();
await page.locator('#mobile-navigation').waitFor({state:'visible'});
console.log('mobile menu opens');
await page.setViewportSize({width:1440,height:900});
await page.locator('.festival-hero').waitFor();
assert.equal(await page.locator('.mobile-festival-hero').count(),0);
assert.equal(await page.locator('.festival-hero video').count(),2);
assert.deepEqual(errors,[]);
console.log('desktop hero preserved; no page errors');
}finally{await browser.close();}
