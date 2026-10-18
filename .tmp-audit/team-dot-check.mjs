import {chromium} from 'playwright';
const browser=await chromium.launch({headless:true});
try{
const page=await browser.newPage({viewport:{width:1440,height:900},reducedMotion:'reduce'});
await page.goto('http://127.0.0.1:5173/',{waitUntil:'domcontentloaded'});
const section=page.locator('[aria-labelledby="festival-year-title"]');
await section.waitFor();await page.evaluate(()=>document.fonts.ready);
await section.scrollIntoViewIfNeeded();await page.waitForTimeout(250);
await section.screenshot({path:'.tmp-audit/media-seam/team-dot.png'});
console.log(await page.locator('.home-year-column').last().evaluate(e=>{const dot=e.querySelector('.rounded-full'),r=dot.getBoundingClientRect(),col=e.getBoundingClientRect();return{width:r.width,height:r.height,center:r.x+r.width/2,columnCenter:col.x+col.width/2};}));
}finally{await browser.close();}