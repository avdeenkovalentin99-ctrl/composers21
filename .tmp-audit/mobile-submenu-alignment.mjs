import {chromium} from 'playwright';import assert from 'node:assert/strict';
const browser=await chromium.launch({headless:true});
try {
const page=await browser.newPage({viewport:{width:390,height:844},isMobile:true,hasTouch:true});
await page.goto('http://127.0.0.1:5173',{waitUntil:'domcontentloaded'});
for(const [width,height] of [[320,568],[390,844],[430,932],[844,390]]){
 await page.setViewportSize({width,height});
 await page.locator('.mobile-navigation__trigger').click();
 await page.locator('.mobile-navigation__primary').getByRole('button',{name:'2026'}).click();
 await page.waitForTimeout(450);
 const d=await page.evaluate(()=>{const t=document.querySelector('.mobile-navigation__primary button'),s=document.querySelector('.mobile-navigation__secondary'),a=s.querySelector('a'),tr=t.getBoundingClientRect(),ar=a.getBoundingClientRect();return {delta:(tr.top+tr.height/2)-(ar.top+ar.height/2),primary:tr.height,secondary:ar.height,scroll:s.scrollHeight,view:s.clientHeight};});
 assert(Math.abs(d.delta)<1);assert.equal(d.secondary,44);assert(d.secondary<d.primary);
 const last=page.locator('.mobile-navigation__secondary a').last();await last.scrollIntoViewIfNeeded();const rect=await last.boundingBox();assert(rect.y>=0&&rect.y+rect.height<=height+1);
 await page.locator('.mobile-navigation__trigger').click();
 console.log(width,height,JSON.stringify(d));
}
}finally{await browser.close();}
