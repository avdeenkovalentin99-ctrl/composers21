import {chromium} from 'playwright';
import assert from 'node:assert/strict';
const browser=await chromium.launch({headless:true});
try{
const page=await browser.newPage({viewport:{width:1440,height:1000}});
await page.goto('http://127.0.0.1:5173/',{waitUntil:'domcontentloaded'});
await page.locator('.home-year-composition').waitFor();
await page.locator('.home-year-composition').scrollIntoViewIfNeeded();
await page.locator('.home-year-column').nth(2).hover();
const angles=await page.locator('.home-year-hairline').evaluate(async e=>{
const a=[],start=performance.now();
while(performance.now()-start<6400){a.push(parseFloat(getComputedStyle(e).rotate));await new Promise(requestAnimationFrame);}
return a;
});
assert.ok(angles.every(a=>a>=0&&a<=6));
assert.ok(Math.max(...angles)>5.8);
assert.ok(angles.at(-1)<3,'Returns gently within the bounded arc');
await page.mouse.move(10,10);await page.waitForTimeout(450);
const angle=()=>page.locator('.home-year-hairline').evaluate(e=>getComputedStyle(e).rotate);
const stopped=await angle();await page.waitForTimeout(250);assert.equal(await angle(),stopped);
console.log(JSON.stringify({min:Math.min(...angles),max:Math.max(...angles),stopped,fullRotation:false}));
}finally{await browser.close();}