import { chromium } from 'playwright';
import assert from 'node:assert/strict';
const browser=await chromium.launch({headless:true});
try {
const page=await browser.newPage({viewport:{width:1440,height:1000}});
await page.goto('http://127.0.0.1:5173/',{waitUntil:'domcontentloaded'});
const nav=page.locator('.home-year-composition');
await nav.waitFor();await page.evaluate(()=>document.fonts.ready);await nav.scrollIntoViewIfNeeded();
await page.mouse.move(10,10);
const digits=()=>nav.locator('.home-year-figure .home-year-digit').evaluateAll(es=>es.map(e=>({rect:e.getBoundingClientRect().toJSON(),transform:getComputedStyle(e).transform})));
const initial=await digits();
const columns=nav.locator('.home-year-column');
for(let i=0;i<4;i++){
await columns.nth(i).hover();await page.waitForTimeout(700);
const current=await digits();
for(let j=0;j<initial.length;j++){
assert.equal(current[j].transform,initial[j].transform,'All digits keep their original transforms');
for(const key of ['x','y','width','height'])assert.ok(Math.abs(current[j].rect[key]-initial[j].rect[key])<0.05,'Digit position and inversion stay fixed');
}
await page.mouse.move(10,10);await page.waitForTimeout(420);
}
const line=nav.locator('.home-year-hairline');
const read=()=>line.evaluate(e=>{const r=e.getBoundingClientRect(),s=getComputedStyle(e);return {angle:parseFloat(s.rotate),width:s.width,translate:s.translate,x:r.x+r.width/2,y:r.y+r.height/2};});
const stopped=await read();await page.waitForTimeout(200);assert.deepEqual(await read(),stopped);
await columns.nth(2).hover();await page.waitForTimeout(650);const moving=await read();
assert.ok(moving.angle>stopped.angle,'Clockwise rotation resumes from the saved angle');
assert.equal(moving.width,'1px');assert.equal(moving.translate,'none');
assert.ok(Math.abs(moving.x-stopped.x)<0.02&&Math.abs(moving.y-stopped.y)<0.02,'Rotation center stays fixed');
await page.mouse.move(10,10);await page.waitForTimeout(420);
const frozen=await read();await page.waitForTimeout(200);assert.deepEqual(await read(),frozen);
await page.emulateMedia({reducedMotion:'reduce'});await columns.nth(2).hover();await page.waitForTimeout(500);assert.deepEqual(await read(),frozen);
console.log('Passed: fixed digits, aligned inversions, clockwise line rotation, frozen/resumed phase, stable 1px width, reduced motion.');
}finally{await browser.close();}