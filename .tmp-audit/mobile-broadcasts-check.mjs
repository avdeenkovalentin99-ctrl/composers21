import {chromium} from 'playwright';
import assert from 'node:assert/strict';
const browser=await chromium.launch({headless:true});
try {
const page=await browser.newPage({viewport:{width:390,height:844},isMobile:true,hasTouch:true});
const errors=[];page.on('pageerror',e=>errors.push(e.message));
await page.goto('http://127.0.0.1:5173',{waitUntil:'domcontentloaded'});
const section=page.locator('.mobile-home-broadcasts');await section.waitFor();
await page.evaluate(()=>document.fonts.ready);
const ok=page.getByRole('button',{name:'OK',exact:true});if(await ok.count())await ok.click();
await section.scrollIntoViewIfNeeded();
const preview=section.locator('.mobile-home-broadcasts__preview');
const buttons=section.getByRole('button');
assert.equal(await buttons.count(),5);
const expected=['p31.png','p12.png','p28.png','p27.png','p15.png'];
const urls=[];
for(let i=0;i<5;i++) {
 await buttons.nth(i).click();
 await page.waitForFunction(()=>{const im=document.querySelector('.mobile-home-broadcasts__preview img');return im.complete&&im.naturalWidth>0});
 assert((await preview.locator('img').getAttribute('src')).endsWith(expected[i]));
 assert.equal(await buttons.nth(i).getAttribute('aria-pressed'),'true');
 assert.equal(await section.locator('[aria-pressed="true"]').count(),1);
 urls.push(await preview.getAttribute('href'));
}
assert.equal(new Set(urls).size,5);assert(urls.every(u=>u.startsWith('https://www.culture.ru/')));
await buttons.first().click();
for(const width of [320,390,430,768,1023]) {
 await page.setViewportSize({width,height:844});
 assert(await section.isVisible());
 assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
 const rail=page.getByRole('navigation',{name:'Основная навигация',exact:true});
 assert.equal(await rail.isVisible(),false);
 console.log(width,'layout fits; no right menu');
}
await page.setViewportSize({width:390,height:844});
await section.screenshot({path:'.tmp-audit/mobile-broadcasts-390.png'});
await section.getByRole('link',{name:/все трансляции/i}).click();
await page.waitForURL('**/translyatsii');console.log('archive link works');
await page.setViewportSize({width:1440,height:900});
await page.goto('http://127.0.0.1:5173',{waitUntil:'domcontentloaded'});
await page.locator('#homepage-broadcasts-title').waitFor();
assert.equal(await page.locator('.mobile-home-broadcasts').isVisible(),false);
assert.equal(await page.locator('section[aria-labelledby="homepage-broadcasts-title"]').isVisible(),true);
assert.deepEqual(errors,[]);
console.log('5 selections, image mapping and record URLs verified; desktop preserved');
}finally{await browser.close();}
