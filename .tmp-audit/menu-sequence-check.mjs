import {chromium} from 'playwright';
import assert from 'node:assert/strict';
const browser=await chromium.launch({headless:true});
try{
const page=await browser.newPage({viewport:{width:1440,height:900}});
await page.goto('http://127.0.0.1:5173/',{waitUntil:'domcontentloaded'});
await page.locator('[data-hero-rail-trigger]').waitFor();
await page.evaluate(()=>document.fonts.ready);
const samples=await page.evaluate(async()=>{
const rail=document.querySelector('.navigation-rail');
const art=rail.querySelector(':scope > .navigation-rail-art[data-theme="dark"]');
const items=[...art.querySelectorAll('.navigation-rail-art-item')];
const scale=(e,p)=>new DOMMatrix(getComputedStyle(e,p).transform).d;
const trigger=document.querySelector('[data-hero-rail-trigger]');
scrollTo({top:trigger.getBoundingClientRect().top+scrollY+10,behavior:'instant'});
while(rail.dataset.entrance!=='visible')await new Promise(requestAnimationFrame);
const start=performance.now(),out=[];
while(performance.now()-start<2700){
out.push({labels:items.slice(1).map(e=>Number(getComputedStyle(e.querySelector('.navigation-rail-label')).opacity)),before:items.map(e=>scale(e,'::before')),after:items.map(e=>scale(e,'::after'))});
await new Promise(requestAnimationFrame);
}
return out;
});
for(const s of samples){
assert.ok(s.labels.filter(v=>v>0&&v<1).length<=1,'Only one label fades in at a time');
for(let i=0;i<4;i++){
if(s.labels[i]>0){assert.ok(s.labels.slice(0,i).every(v=>v===1),'Earlier labels finish first');assert.equal(s.before[i+1],1,'Line reaches label before text appears');assert.equal(s.after[i],1,'Previous line segment finishes before text appears');}
if(s.labels[i]<1)assert.equal(s.after[i+1],0,'Next line waits for label');
}
}
assert.ok(samples.at(-1).labels.every(v=>v===1));
console.log('Sequential animation passed across '+samples.length+' frames');
const colors=await page.locator('.navigation-rail-art[data-theme="dark"]').first().evaluate(e=>{const item=e.querySelectorAll('.navigation-rail-art-item')[1];return {text:getComputedStyle(item).color,line:getComputedStyle(item,'::after').backgroundColor,width:getComputedStyle(item,'::after').width};});
assert.equal(colors.text,colors.line);assert.equal(colors.width,'1px');console.log(colors);
}finally{await browser.close();}