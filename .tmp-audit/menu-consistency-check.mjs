import {chromium} from 'playwright';
import assert from 'node:assert/strict';
const browser=await chromium.launch({headless:true});
try{
const page=await browser.newPage({viewport:{width:1440,height:900},reducedMotion:'reduce'});
let baseline;
for(const path of ['/','/media','/translyatsii','/afisha','/participants']){
await page.goto('http://127.0.0.1:5173'+path,{waitUntil:'domcontentloaded'});
if(path==='/'){await page.locator('[data-nav-light-start]').waitFor();await page.locator('[data-nav-light-start]').evaluate(e=>scrollTo({top:e.getBoundingClientRect().top+scrollY,behavior:'instant'}));}
await page.locator('.navigation-rail').waitFor();await page.evaluate(()=>document.fonts.ready);
await page.mouse.move(500,400);await page.waitForTimeout(150);
const label=page.locator('.navigation-rail-light-window .navigation-rail-label').filter({hasText:'О фестивале'});
const read=()=>label.evaluate(e=>{const s=getComputedStyle(e);return{font:s.fontFamily,weight:s.fontWeight,size:s.fontSize,spacing:s.letterSpacing,color:s.color};});
const normal=await read();
if(!baseline)baseline=normal;else assert.deepEqual(normal,baseline);
assert.equal(normal.color,'rgb(93, 93, 93)');
await page.getByRole('navigation',{name:'Основная навигация'}).getByRole('link',{name:'О фестивале',exact:true}).hover();
const hover=await read();assert.equal(hover.color,'rgb(15, 15, 15)');assert.equal(hover.weight,normal.weight);
await page.mouse.move(500,400);assert.deepEqual(await read(),normal);
console.log(path,JSON.stringify({normal,hover:hover.color}));
}
}finally{await browser.close();}