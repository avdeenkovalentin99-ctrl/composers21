import {chromium} from 'playwright';
import assert from 'node:assert/strict';
const browser=await chromium.launch({headless:true});
try {
const page=await browser.newPage({viewport:{width:390,height:844},isMobile:true,hasTouch:true});
await page.goto('http://127.0.0.1:5173',{waitUntil:'domcontentloaded'});
const intro=page.locator('section[aria-labelledby="festival-about-title"]');
await intro.waitFor();await page.evaluate(()=>document.fonts.ready);
const ok=page.getByRole('button',{name:'OK',exact:true});if(await ok.count())await ok.click();
for(const width of [320,390,430,768,1023]){
await page.setViewportSize({width,height:844});
const state=await intro.evaluate(e=>{
const h=e.querySelector('h2'),ps=[...e.querySelectorAll('p')],a=e.querySelector('a');
const r=e.getBoundingClientRect(),ar=a.getBoundingClientRect();
return{paragraphs:ps.length,titleSize:parseFloat(getComputedStyle(h).fontSize),bodySize:parseFloat(getComputedStyle(ps[0]).fontSize),ctaRight:ar.right,lastRight:ps[1].getBoundingClientRect().right,ctaTop:ar.top,bodyBottom:ps[1].getBoundingClientRect().bottom,followedByBroadcasts:e.nextElementSibling.matches('.mobile-home-broadcasts'),overflow:document.documentElement.scrollWidth>innerWidth};
});
assert.equal(state.paragraphs,2);assert(state.titleSize>state.bodySize*2);assert(Math.abs(state.ctaRight-state.lastRight)<1);assert(state.ctaTop>state.bodyBottom);assert(state.followedByBroadcasts);assert(!state.overflow);console.log(width,'intro hierarchy and right-aligned CTA verified');
}
await page.setViewportSize({width:390,height:844});
await intro.screenshot({path:'.tmp-audit/mobile-intro-390.png'});
await intro.getByRole('link',{name:/О фестивале/}).click();await page.waitForURL('**/festival');
console.log('festival link works');
}finally{await browser.close();}
