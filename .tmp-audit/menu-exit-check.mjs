import {chromium} from 'playwright';
import assert from 'node:assert/strict';
const browser=await chromium.launch({headless:true});
try{
const page=await browser.newPage({viewport:{width:1440,height:900}});
await page.goto('http://127.0.0.1:5173/',{waitUntil:'domcontentloaded'});
await page.locator('[data-hero-rail-trigger]').waitFor();
await page.evaluate(()=>document.fonts.ready);
await page.locator('[data-hero-rail-trigger]').evaluate(e=>scrollTo({top:e.getBoundingClientRect().top+scrollY+10,behavior:'instant'}));
await page.waitForTimeout(2600);
const frames=await page.evaluate(async()=>{
const rail=document.querySelector('.navigation-rail');
const label=rail.querySelector(':scope > .navigation-rail-art .navigation-rail-label');
const item=rail.querySelector(':scope > .navigation-rail-art .navigation-rail-art-item');
const samples=[];scrollTo({top:0,behavior:'instant'});
const start=performance.now();
while(performance.now()-start<800){
samples.push({state:rail.dataset.entrance,x:new DOMMatrix(getComputedStyle(rail).transform).e,labelOpacity:getComputedStyle(label).opacity,labelTransform:getComputedStyle(label).transform,lineScale:new DOMMatrix(getComputedStyle(item,'::after').transform).d,duration:getComputedStyle(rail).transitionDuration});
await new Promise(requestAnimationFrame);
}
return samples;});
const leaving=frames.filter(f=>f.state==='leaving');
assert.ok(leaving.length>0);
for(const f of leaving){assert.equal(f.labelOpacity,'1');assert.equal(f.labelTransform,'none');assert.equal(f.lineScale,1);assert.ok(f.duration.startsWith('0.52s'));}
assert.ok(leaving.some(f=>f.x>0&&f.x<65));
assert.equal(frames.at(-1).state,'hidden');
console.log('Exit passed:',JSON.stringify({frames:leaving.length,first:leaving[0],last:leaving.at(-1),final:frames.at(-1)}));
}finally{await browser.close();}