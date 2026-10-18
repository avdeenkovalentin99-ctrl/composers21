import { chromium } from 'playwright';
import assert from 'node:assert/strict';
const browser=await chromium.launch({headless:true});
const page=await browser.newPage({viewport:{width:1672,height:941}});
const errors=[]; page.on('pageerror',e=>errors.push(e.message));
for (const route of ['hero2','hero3']) {
 await page.goto('http://127.0.0.1:5173/'+route,{waitUntil:'networkidle'});
 const cookie=page.getByRole('button',{name:'OK',exact:true}); if(await cookie.isVisible()) await cookie.click();
 await page.waitForTimeout(300);
 console.log(route,await page.evaluate(()=>({background:getComputedStyle(document.querySelector('.logo-video-hero')).backgroundColor,weight:getComputedStyle(document.querySelector('h1')).fontWeight,font:getComputedStyle(document.querySelector('h1')).fontFamily,emblem:document.querySelector('.logo-video-hero__emblem').getBoundingClientRect().width,videos:[...document.querySelectorAll('video')].map(v=>({paused:v.paused,time:v.currentTime,filter:getComputedStyle(v).filter}))})));
 assert.equal(await page.locator('.logo-video-hero video').count(),2);
 assert.equal(await page.locator('.logo-video-hero__back').count(),0);
 await page.screenshot({path:'.tmp-audit/'+route+'-final-desktop.png'});
 await page.setViewportSize({width:390,height:844});
 await page.screenshot({path:'.tmp-audit/'+route+'-final-mobile.png'});
 assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
 await page.setViewportSize({width:1672,height:941});
}
await page.goto('http://127.0.0.1:5173/',{waitUntil:'networkidle'});
assert.equal(await page.locator('.reference-hero video').evaluate(v=>getComputedStyle(v).filter),'none');
await page.screenshot({path:'.tmp-audit/hero-final-main.png'});
assert.equal(errors.length,0); console.log('Both variants and main passed; no browser errors.');
await browser.close();
