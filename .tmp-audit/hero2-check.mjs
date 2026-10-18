import { chromium } from 'playwright';
import assert from 'node:assert/strict';
const browser = await chromium.launch({headless:true});
const page = await browser.newPage({viewport:{width:1672,height:941}});
const errors=[];
page.on('pageerror',e=>errors.push(e.message));
for (const route of ['/', '/hero2']) {
  await page.goto('http://127.0.0.1:5173'+route,{waitUntil:'domcontentloaded'});
  await page.locator('.festival-hero').waitFor();
  await page.evaluate(()=>document.fonts.ready);
  const cookie=page.getByRole('button',{name:'OK',exact:true});
  if(await cookie.isVisible()) await cookie.click();
  await page.waitForFunction(()=>[...document.querySelectorAll('.festival-hero video')].every(v=>v.readyState>=2));
  const state=await page.locator('.festival-hero').evaluate(hero=>{
    const get=s=>hero.querySelector(s);
    const rect=s=>get(s).getBoundingClientRect().toJSON();
    return {dark:hero.classList.contains('festival-hero--graphite'),band:getComputedStyle(get('.festival-hero__band')).backgroundColor,titleColor:getComputedStyle(get('h1')).color,blend:getComputedStyle(get('.festival-hero__clip')).mixBlendMode,title:rect('h1'),copy:rect('.festival-hero__title--over-media'),video:rect('.festival-hero__media--violin'),playing:[...hero.querySelectorAll('video')].every(v=>!v.paused),overflow:document.documentElement.scrollWidth>innerWidth};
  });
  assert.equal(state.dark,route==='/hero2');
  assert.equal(state.blend,route==='/hero2'?'difference':'normal');
  assert(Math.abs(state.video.top)<1);
  for(const key of ['x','y','width','height']) assert(Math.abs(state.title[key]-state.copy[key])<0.1,key+' text alignment');
  assert(!state.overflow); assert(state.playing);
  await page.screenshot({path:'.tmp-audit/'+(route==='/'?'hero1-final':'hero2-final')+'.png'});
  console.log(route,JSON.stringify(state));
}
for(const size of [{width:1440,height:1000},{width:1024,height:768},{width:390,height:844}]){
  await page.setViewportSize(size);
  const state=await page.locator('.festival-hero').evaluate(hero=>({top:hero.querySelector('.festival-hero__media--violin').getBoundingClientRect().top,overflow:document.documentElement.scrollWidth>innerWidth}));
  assert(Math.abs(state.top)<1); assert(!state.overflow);
  console.log(size,state);
}
await page.setViewportSize({width:1672,height:941});
await page.getByRole('link',{name:'О фестивале',exact:true}).last().click();
await page.waitForURL('**/festival');
assert.equal(errors.length,0,errors.join('\n'));
console.log('Route, video playback, overlay alignment, viewport geometry, and festival link passed.');
await browser.close();

