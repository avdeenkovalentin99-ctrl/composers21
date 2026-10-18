import { chromium } from 'playwright';
import assert from 'node:assert/strict';
const browser=await chromium.launch({headless:true});
try {
const page=await browser.newPage({viewport:{width:390,height:844},isMobile:true,hasTouch:true});
const errors=[];page.on('pageerror',e=>errors.push(e.message));
await page.goto('http://127.0.0.1:5173',{waitUntil:'domcontentloaded'});
const media=page.locator('.mobile-home-media');
await media.waitFor();await page.evaluate(()=>document.fonts.ready);
const ok=page.getByRole('button',{name:'OK',exact:true});if(await ok.count())await ok.click();
assert.equal(await media.locator('.mobile-home-media__report').count(),2);
assert.equal(await media.locator('.mobile-home-media__article').count(),4);
for(const width of [320,390,430,768,1023]){
await page.setViewportSize({width,height:844});
const result=await media.evaluate(s=>{
 const reports=[...s.querySelectorAll('.mobile-home-media__report')].map(e=>{const r=e.getBoundingClientRect();return{x:r.x,y:r.y,bottom:r.bottom}});
 return {before:s.previousElementSibling.className,after:s.nextElementSibling.className,overflow:document.documentElement.scrollWidth>innerWidth,reports,links:[...s.querySelectorAll('a[target="_blank"]')].map(a=>({url:a.href,rel:a.rel}))};
});
assert(result.before.includes('mobile-home-broadcasts'));assert(result.after.includes('mobile-festival-year'));assert(!result.overflow);assert.equal(result.links.length,6);assert(result.links.every(l=>l.url.startsWith('https://')&&l.rel.includes('noreferrer')));
if(width<640)assert(result.reports[1].y>result.reports[0].bottom);else assert(result.reports[1].x>result.reports[0].x);
console.log(width,'media layout and section order verified');
}
await page.setViewportSize({width:390,height:844});
for(const im of await media.locator('img').all()) {await im.scrollIntoViewIfNeeded();await im.evaluate(i=>i.decode());}
assert.deepEqual(await media.locator('img').evaluateAll(ims=>ims.map(i=>i.getAttribute('src'))),['/assets/hero/culture1.webp','/assets/hero/culture2.webp']);
await media.screenshot({path:'.tmp-audit/mobile-media-390.png'});
await media.locator('.mobile-home-media__all').click();await page.waitForURL('**/media');console.log('all publications link works');
await page.goto('http://127.0.0.1:5173',{waitUntil:'domcontentloaded'});
await page.setViewportSize({width:1440,height:900});
await page.locator('#homepage-media-title').waitFor();
assert.equal(await media.isVisible(),false);
assert.equal(await page.locator('section[aria-labelledby="homepage-media-title"]').isVisible(),true);
assert.deepEqual(errors,[]);console.log('both images loaded; desktop media preserved; no page errors');
}finally{await browser.close();}
