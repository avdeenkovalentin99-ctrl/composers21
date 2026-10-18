import { chromium } from 'playwright';
import { PNG } from '../node_modules/playwright-core/lib/utilsBundle.js';
import assert from 'node:assert/strict';
const browser=await chromium.launch({headless:true});
try {
const page=await browser.newPage({viewport:{width:1440,height:900},reducedMotion:'reduce'});
const errors=[]; page.on('pageerror',e=>errors.push(e.message));
await page.goto('http://127.0.0.1:5173/',{waitUntil:'domcontentloaded'});
await page.locator('[data-nav-light-start]').waitFor();
await page.evaluate(()=>document.fonts.ready);
const videos=await page.locator('#home-old-hero video').evaluateAll(es=>es.map(e=>({controls:e.controls,pip:e.disablePictureInPicture,remote:e.disableRemotePlayback,pointer:getComputedStyle(e).pointerEvents,tabIndex:e.tabIndex})));
for(const v of videos){assert.equal(v.controls,false);assert.equal(v.pip,true);assert.equal(v.remote,true);assert.equal(v.pointer,'none');assert.equal(v.tabIndex,-1);}
console.log('videos',videos);
for(const [name,selector,color] of [['intro','[aria-labelledby="festival-about-title"]',8],['broadcasts','[aria-labelledby="homepage-broadcasts-title"]',8],['media','[data-nav-light-start]',255]]){
await page.locator(selector).evaluate(e=>scrollTo({top:e.getBoundingClientRect().top+scrollY-120,behavior:'instant'}));
await page.waitForTimeout(450);
const x=await page.locator('.navigation-rail').evaluate(e=>e.getBoundingClientRect().left+3);
const png=PNG.sync.read(await page.screenshot());
const pixel=[...png.data.subarray((200*png.width+Math.floor(x))*4,(200*png.width+Math.floor(x))*4+3)];
assert.deepEqual(pixel,[color,color,color],name+' rail background');
await page.screenshot({path:'.tmp-audit/media-seam/final-'+name+'.png'});
console.log(name,pixel);
}
await page.evaluate(()=>scrollTo({top:document.documentElement.scrollHeight,behavior:'instant'}));
await page.waitForTimeout(200);
const before=await page.evaluate(()=>({y:scrollY,bottom:document.querySelector('footer').getBoundingClientRect().bottom,viewport:innerHeight}));
await page.mouse.move(1394,800);await page.mouse.wheel(0,2000);await page.waitForTimeout(250);
assert.equal(await page.evaluate(()=>scrollY),before.y);
assert.ok(Math.abs(before.bottom-before.viewport)<1);
assert.equal(await page.evaluate(()=>getComputedStyle(document.documentElement).overscrollBehaviorY),'none');
await page.screenshot({path:'.tmp-audit/media-seam/final-footer.png'});
console.log('footer stops at viewport',before);
assert.deepEqual(errors,[]);
await page.setViewportSize({width:390,height:844});
await page.evaluate(()=>scrollTo({top:0,behavior:'instant'}));
await page.locator('#home-old-hero video').waitFor();
const mobile=await page.locator('#home-old-hero video').evaluate(e=>({pointer:getComputedStyle(e).pointerEvents,pip:e.disablePictureInPicture,controls:e.controls}));
assert.equal(mobile.pointer,'none');assert.equal(mobile.pip,true);assert.equal(mobile.controls,false);
console.log('mobile video',mobile);
}finally{await browser.close();}
