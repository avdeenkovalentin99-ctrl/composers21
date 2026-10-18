import {chromium} from 'playwright';
import assert from 'node:assert/strict';
const browser=await chromium.launch({headless:true});
try {
const page=await browser.newPage({viewport:{width:390,height:844},isMobile:true,hasTouch:true});
const errors=[];page.on('pageerror',e=>errors.push(e.message));
await page.goto('http://127.0.0.1:5173',{waitUntil:'domcontentloaded'});
const root=page.locator('.mobile-navigation'), trigger=root.locator('.mobile-navigation__trigger');
await trigger.waitFor();assert.equal(await trigger.count(),1);
const ok=page.getByRole('button',{name:'OK',exact:true});if(await ok.count())await ok.click();
for(const width of [320,390,430,768,1023]){
 await page.setViewportSize({width,height:844});
 await trigger.click();
 await root.locator('.mobile-navigation__primary a').first().waitFor();
 await page.waitForTimeout(450);
 let state=await root.evaluate(r=>{const p=r.querySelector('.mobile-navigation__primary').getBoundingClientRect();return {x:p.x,width:p.width,screen:innerWidth,overflow:document.documentElement.style.overflow,links:[...r.querySelectorAll('.mobile-navigation__primary nav > *')].map(e=>e.textContent),bad:[...r.querySelectorAll('.mobile-navigation__primary nav > *')].some(e=>e.scrollWidth>e.clientWidth+1)}});
 assert(Math.abs(state.width-width*0.46)<1);assert(Math.abs(state.x)<1);assert.equal(state.overflow,'hidden');assert(!state.bad);
 assert.equal(state.links.length,5);assert.equal(state.links[0],'Главная');
 await root.getByRole('button',{name:'2026'}).click();
 await page.waitForTimeout(450);
 const secondary=await root.locator('.mobile-navigation__secondary').evaluate(s=>{const r=s.getBoundingClientRect();return{x:r.x,width:r.width,color:getComputedStyle(s).backgroundColor,links:s.querySelectorAll('a').length,bad:[...s.querySelectorAll('a')].some(e=>e.scrollWidth>e.clientWidth+1)}});
 assert(Math.abs(secondary.x-width*0.46)<1);assert(secondary.width<width*0.46);assert(secondary.x+secondary.width<=width);assert.equal(secondary.color,'rgb(255, 255, 255)');assert.equal(secondary.links,5);assert(!secondary.bad);
 await page.mouse.click(width-10,400);
 assert.equal(await trigger.getAttribute('aria-expanded'),'false');
 assert.equal(await page.evaluate(()=>document.documentElement.style.overflow),'');
 console.log(width,'dark panel 46%; white panel fits labels; backdrop closes; scroll unlocks');
}
await page.setViewportSize({width:390,height:844});
await trigger.click();await root.getByRole('button',{name:'2026'}).click();await page.waitForTimeout(450);
await page.screenshot({path:'.tmp-audit/mobile-navigation-open.png'});
console.log('Panel balance screenshot saved');
}finally{await browser.close();}
