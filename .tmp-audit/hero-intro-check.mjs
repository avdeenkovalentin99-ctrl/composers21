import { chromium } from 'playwright';
import assert from 'node:assert/strict';
const browser=await chromium.launch({headless:true});
const page=await browser.newPage({viewport:{width:1440,height:900},reducedMotion:'no-preference'});
await page.goto('http://127.0.0.1:5173/',{waitUntil:'domcontentloaded'});
await page.locator('.festival-hero__status').waitFor({state:'attached'});
await page.evaluate(()=>document.fonts.ready);
const sequence=['title','band','year','violin','piano','choir','composers','upper','lower','status'];
const moments=[0,1500,2300,3200,4200,5300,6300,7000,7800,8700,9700,10500];
for(const [index,time]of moments.entries()){
 const s=await page.evaluate(t=>{
  const hero=document.querySelector('.festival-hero');
  for(const a of hero.getAnimations({subtree:true})){a.pause();a.currentTime=t;}
  const opacity=s=>Number(getComputedStyle(hero.querySelector(s)).opacity);
  return {title:opacity('h1'),band:opacity('.festival-hero__band'),year:opacity('.festival-hero__year-echo'),violin:opacity('.festival-hero__media--violin'),piano:opacity('.festival-hero__media--piano'),choir:opacity('.festival-hero__media--choir'),composers:opacity('.festival-hero__composers'),upper:opacity('.festival-hero__soloists--upper'),lower:opacity('.festival-hero__soloists--lower'),status:opacity('.festival-hero__status')};
 },time);
 if(index===0)assert(Object.values(s).every(v=>v===0));
 else if(index===sequence.length+1)assert(Object.values(s).every(v=>v===1));
 else {
  for(const key of sequence.slice(0,index-1))assert.equal(s[key],1,key+' must be complete');
  assert(s[sequence[index-1]]>0,'Current block must be appearing');
  for(const key of sequence.slice(index))assert.equal(s[key],0,key+' must still be hidden');
 }
 console.log(JSON.stringify({time,...s}));
}
const times=await page.locator('.festival-hero').evaluate(el=>el.getAnimations({subtree:true}).map(a=>({target:a.effect.target.className,...a.effect.getTiming()})));
const status=times.find(a=>a.target==='festival-hero__status');
assert(times.filter(a=>a!==status).every(a=>Number(a.delay)+Number(a.duration)<Number(status.delay)));
assert(await page.locator('.festival-hero__composers,.festival-hero__soloists').evaluateAll(els=>els.every(el=>getComputedStyle(el).display==='flex')));
await page.emulateMedia({reducedMotion:'reduce'});
assert.equal(await page.locator('.festival-hero').evaluate(el=>el.getAnimations({subtree:true}).length),0);
await browser.close();
console.log('PASS: text, sharp video reveals, composer and soloist lists, status last; reduced motion.');
