import { chromium } from 'playwright';
const browser = await chromium.launch({headless:true});
const page = await browser.newPage();
for (const [width,height] of [[1440,900],[1672,941],[1920,1080],[1366,768],[1920,800]]) {
 await page.setViewportSize({width,height});
 await page.goto('http://127.0.0.1:5173/',{waitUntil:'domcontentloaded'});
 await page.locator('.festival-hero__stage').waitFor();
 await page.evaluate(()=>document.fonts.ready);
 const state=await page.evaluate(()=>{
  const rect=s=>{const r=document.querySelector(s).getBoundingClientRect();return {x:r.x,y:r.y,right:r.right,bottom:r.bottom,width:r.width,height:r.height}};
  return {viewport:[innerWidth,innerHeight], stage:rect('.festival-hero__stage'),year:rect('.festival-hero__stage > .festival-hero__year'),title:rect('h1'),copies:[...document.querySelectorAll('.festival-hero__title--over-media')].map(el=>{const r=el.getBoundingClientRect();return {x:r.x,y:r.y,width:r.width,height:r.height}}),titleColor:getComputedStyle(document.querySelector('h1')).color,scrollWidth:document.documentElement.scrollWidth};
 });
 console.log(JSON.stringify(state));
 if(state.year.bottom>height+1 || state.year.bottom>state.stage.bottom+1) throw new Error('Year outside hero');
 for(const copy of state.copies) for(const k of ['x','y','width','height']) if(Math.abs(copy[k]-state.title[k])>.1) throw new Error('Title copy misaligned');
 if(width===1440) await page.screenshot({path:'.tmp-audit/hero/hero-resized.png'});
}
await browser.close();
