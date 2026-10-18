import { chromium } from 'playwright';
const browser = await chromium.launch();
try {
 const page = await browser.newPage({viewport:{width:844,height:390},hasTouch:true,isMobile:true,reducedMotion:'reduce'});
 await page.goto('http://127.0.0.1:5177/');
 await page.locator('.logo-video-hero').waitFor();
 console.log(JSON.stringify(await page.evaluate(()=>({
  shell:document.querySelector('main')?.parentElement.className,
  styles:[...document.querySelectorAll('style[data-vite-dev-id]')].map(e=>e.getAttribute('data-vite-dev-id')).filter(e=>e.includes('Landscape')),
  media:['(hover: none)','(pointer: coarse)','(orientation: landscape)','(min-width: 35rem)','(max-width: 63.99rem)','(max-height: 31.25rem)'].map(q=>[q,matchMedia(q).matches]),
  css:document.querySelector('style[data-vite-dev-id*="HomePhoneLandscape"]')?.textContent,
  width:getComputedStyle(document.querySelector('main').parentElement).width
 })),null,2));
 await page.screenshot({path:'.tmp-audit/phone-landscape-check.png'});
}finally{await browser.close()}
