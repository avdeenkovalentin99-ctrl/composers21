import {chromium} from 'playwright';
import assert from 'node:assert/strict';
const browser=await chromium.launch({headless:true});
try{
const page=await browser.newPage({viewport:{width:390,height:844},isMobile:true,hasTouch:true});
await page.goto('http://127.0.0.1:5173',{waitUntil:'domcontentloaded'});
await page.locator('.mobile-festival-hero video').waitFor();
assert.equal(await page.locator('button[aria-controls="mobile-navigation"]').count(),0);console.log('mobile menu button removed');
await page.evaluate(()=>document.fonts.ready);
for(const width of [320,390,430,768,1023]){
await page.setViewportSize({width,height:844});
const state=await page.locator('.mobile-festival-hero').evaluate(h=>{
const v=h.querySelector('video'),hr=h.getBoundingClientRect(),vr=v.getBoundingClientRect();
return {count:h.querySelectorAll('video').length,src:v.getAttribute('src'),rect:[vr.x-hr.x,vr.y-hr.y,vr.width-hr.width,vr.height-hr.height],controls:v.controls,pip:v.disablePictureInPicture,pointer:getComputedStyle(v).pointerEvents,letters:h.querySelectorAll('svg path').length,overflow:document.documentElement.scrollWidth>innerWidth};
});
assert.equal(state.count,1);assert.match(state.src,/herovidmob/);assert(state.rect.every(n=>Math.abs(n)<1));assert.equal(state.controls,false);assert(state.pip);assert.equal(state.pointer,'none');assert(state.letters>10);assert.equal(state.overflow,false);console.log(width,state.src,'full hero, typography present');
}
await page.setViewportSize({width:390,height:844});
const ok=page.getByRole('button',{name:'OK',exact:true});if(await ok.count())await ok.click();
await page.waitForFunction(()=>{const v=document.querySelector('.mobile-festival-hero video');return v.readyState>=2&&v.currentTime>1;},{timeout:15000});
console.log('background video playing');
const copy=await page.locator('.mobile-festival-hero').evaluate(h=>{const f=h.querySelector('.mobile-festival-hero__footer'),s=h.querySelector('.mobile-festival-hero__status');return {gap:h.getBoundingClientRect().bottom-f.getBoundingClientRect().bottom,border:getComputedStyle(f).borderBottomWidth,statusInStage:s.parentElement.className,footerText:f.textContent};});
assert.equal(copy.gap,24);assert.equal(copy.border,'0px');assert.equal(copy.statusInStage,'mobile-festival-hero__stage');assert(!copy.footerText.includes('состоялся'));console.log('metadata at bottom, no rule; status in original composition');
await page.screenshot({path:'.tmp-audit/mobile-hero-background.png'});
await page.setViewportSize({width:1440,height:900});
await page.locator('.festival-hero').waitFor();assert.equal(await page.locator('.festival-hero video').count(),2);console.log('desktop preserved');
}finally{await browser.close();}
