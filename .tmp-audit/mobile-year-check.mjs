import {chromium} from 'playwright';
import assert from 'node:assert/strict';
const browser=await chromium.launch({headless:true,channel:"chromium"});
try{
const page=await browser.newPage({viewport:{width:390,height:844},isMobile:true,hasTouch:true});
await page.goto('http://127.0.0.1:5173',{waitUntil:'domcontentloaded'});
const year=page.locator('.mobile-festival-year');await year.waitFor();await page.evaluate(()=>document.fonts.ready);
const ok=page.getByRole('button',{name:'OK',exact:true});if(await ok.count())await ok.click();
for(const width of [320,390,430,768,1023]){
await page.setViewportSize({width,height:844});
const state=await year.evaluate(e=>{
const art=e.querySelector('.mobile-festival-year__composition');
const positions=[...art.querySelectorAll(".mobile-festival-year__figure")].map(d=>{const r=d.getBoundingClientRect();return {x:r.x,y:r.y,text:d.querySelector('.mobile-festival-year__digit').textContent}});
return{positions,interactive:art.querySelectorAll('a,button,[tabindex]').length,animations:art.getAnimations({subtree:true}).length,overflow:document.documentElement.scrollWidth>innerWidth,previous:e.previousElementSibling.className,links:[...e.querySelectorAll('a')].map(a=>a.getAttribute('href'))};
});
assert.equal(state.positions.map(p=>p.text).join(''),'2026');
assert.equal(state.positions[0].y,state.positions[1].y);assert.equal(state.positions[2].y,state.positions[3].y);assert(state.positions[2].y>state.positions[0].y);assert.equal(state.interactive,0);assert.equal(state.animations,0);assert(!state.overflow);assert(state.previous.includes('mobile-home-broadcasts'));
assert.deepEqual(state.links,['/afisha','/participants','/academies','/partners','/team']);console.log(width,'20 / 26, static and noninteractive; five links below');
}
await page.setViewportSize({width:390,height:844});
await year.screenshot({path:'.tmp-audit/mobile-year-390.png'});
for(const href of ['/afisha','/participants','/academies','/partners','/team']){
await year.locator('a[href="'+href+'"]').click();await page.waitForURL('**'+href);await page.goto('http://127.0.0.1:5173',{waitUntil:'domcontentloaded'});await year.waitFor();
}
console.log('all five menu links navigate');
await page.setViewportSize({width:1440,height:900});assert.equal(await year.isVisible(),false);assert(await page.locator('.home-year-composition').isVisible());console.log('desktop composition preserved');
}finally{await browser.close();}
