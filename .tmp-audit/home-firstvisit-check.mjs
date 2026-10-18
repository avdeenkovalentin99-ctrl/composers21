import { chromium } from 'playwright';
const browser=await chromium.launch();
try {
 const page=await browser.newPage({viewport:{width:390,height:844},isMobile:true,hasTouch:true});
 await page.goto('http://127.0.0.1:5177/');
 await page.locator('.logo-video-hero').waitFor();
 await page.locator('aside[aria-label="Cookie"]').waitFor();
 await page.evaluate(()=>document.fonts.ready);
 console.log('FIRST_VISIT',JSON.stringify(await page.evaluate(()=>{
  const meta=document.querySelector('.logo-video-hero__metadata').getBoundingClientRect();
  const cookie=document.querySelector('aside[aria-label="Cookie"]').getBoundingClientRect();
  return {meta:meta.toJSON(),cookie:cookie.toJSON(),overlap:meta.top<cookie.bottom&&meta.bottom>cookie.top&&meta.left<cookie.right&&meta.right>cookie.left,
   videos:[...document.querySelectorAll('.logo-video-hero video')].map(v=>({ready:v.readyState,paused:v.paused,error:v.error?.code}))};
 })));
 await page.screenshot({path:'.tmp-audit/home-design-review/mobile-first-visit.png'});
 await page.getByRole('button',{name:'OK',exact:true}).click();
 await page.locator('.festival-intro-content').scrollIntoViewIfNeeded();
 console.log('INTRO_TIMING',await page.locator('.festival-intro-cta').evaluate(e=>({delay:getComputedStyle(e).transitionDelay,duration:getComputedStyle(e).transitionDuration})));
}finally{await browser.close()}
