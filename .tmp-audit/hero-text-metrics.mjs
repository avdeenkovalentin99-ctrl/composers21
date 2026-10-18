import {chromium} from 'playwright';
import {writeFile} from 'node:fs/promises';
const browser=await chromium.launch({headless:true});
const page=await browser.newPage({viewport:{width:1687,height:960}});
await page.goto('http://127.0.0.1:5174/',{waitUntil:'domcontentloaded'});
await page.locator('.festival-hero').waitFor();
await page.evaluate(()=>document.fonts.ready);
const result=await page.locator('h1').evaluate(h=>{
 const node=h.firstChild, rect=h.getBoundingClientRect(), props=getComputedStyle(h);
 const chars=[...node.textContent].map((char,i)=>{const range=document.createRange();range.setStart(node,i);range.setEnd(node,i+1);const r=range.getBoundingClientRect();return{char,index:i,x:r.x,width:r.width};});
 const baseline=document.createElement('span');baseline.style.cssText='display:inline-block;width:0;height:0;padding:0;margin:0;vertical-align:baseline;';h.appendChild(baseline);
 const base=baseline.getBoundingClientRect().top;baseline.remove();
 return{heroWidth:document.querySelector('.festival-hero').clientWidth,titleX:rect.x,titleY:rect.y,fontSize:props.fontSize,lineHeight:props.lineHeight,baseline:base,chars};
});
await writeFile('.tmp-audit/hero/text-metrics.json',JSON.stringify(result,null,2));console.log(JSON.stringify(result));await browser.close();
