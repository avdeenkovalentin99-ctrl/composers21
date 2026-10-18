import { chromium } from 'playwright';
const browser=await chromium.launch({headless:true});
const page=await browser.newPage({viewport:{width:1672,height:941}});
await page.goto('http://127.0.0.1:5173/hero3',{waitUntil:'networkidle'});
await page.screenshot({path:'.tmp-audit/hero3-inverted-line.png'});
console.log(await page.locator('.logo-video-hero__drawing > path').evaluateAll(paths=>paths.map(p=>({stroke:p.getAttribute('stroke'),clip:p.getAttribute('clip-path')}))));
await browser.close();