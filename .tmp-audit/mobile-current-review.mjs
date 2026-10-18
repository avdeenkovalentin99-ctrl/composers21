import { chromium } from 'playwright';
import fs from 'node:fs/promises';
const browser=await chromium.launch({headless:true});
const errors=[];const results=[];
try{
 const context=await browser.newContext({viewport:{width:390,height:844},isMobile:true,hasTouch:true,reducedMotion:'reduce'});
 const page=await context.newPage(); page.on('pageerror',e=>errors.push(e.message));
 await page.goto('http://127.0.0.1:5177/',{waitUntil:'domcontentloaded'});
 await page.locator('.logo-video-hero').waitFor(); await page.evaluate(()=>document.fonts.ready);
 const cookie=page.getByRole('button',{name:'OK',exact:true}); if(await cookie.isVisible())await cookie.click();
 for(const [width,height] of [[320,568],[360,640],[375,667],[390,844],[430,932],[568,320],[844,390],[932,430],[768,1024],[1024,768]]){
  await page.setViewportSize({width,height}); await page.waitForTimeout(150);
  await page.evaluate(()=>scrollTo({top:0,behavior:'instant'}));
  const data=await page.evaluate(()=>{const rect=e=>{const r=e.getBoundingClientRect();return {x:r.x,y:r.y,w:r.width,h:r.height,right:r.right,bottom:r.bottom}};const text=s=>[...document.querySelectorAll(s)].map(e=>({text:e.textContent,rect:rect(e),size:getComputedStyle(e).fontSize,scrollWidth:e.scrollWidth,clientWidth:e.clientWidth}));return {viewport:[innerWidth,innerHeight],scrollWidth:document.documentElement.scrollWidth,hero:rect(document.querySelector('.logo-video-hero')),header:text('.logo-video-hero__status,.logo-video-hero__year,.logo-video-hero__title,.logo-video-hero__metadata p'),outside:[...document.querySelectorAll('main h1,main h2,main h3,main p,main a,footer a,footer p')].filter(e=>{const r=e.getBoundingClientRect();return r.width&&r.height&&!e.classList.contains('sr-only')&&(r.x< -1||r.right>innerWidth+1)}).map(e=>({text:e.textContent?.slice(0,70),rect:rect(e)})),mobileBroadcasts:!!document.querySelector('.mobile-home-broadcasts')?.getBoundingClientRect().height}});
  results.push(data);console.log(JSON.stringify(data));
  if([320,390,430,844].includes(width))await page.screenshot({path:'.tmp-audit/current-home-'+width+'x'+height+'.png'});
  if(width===390){await page.evaluate(()=>scrollTo({top:document.body.scrollHeight,behavior:'instant'}));await page.waitForTimeout(250);await page.screenshot({path:'.tmp-audit/current-home-full.png',fullPage:true});}
  if(width<1024){await page.getByRole('button',{name:'Открыть меню',exact:true}).click(); await page.getByRole('button',{name:'2026',exact:false}).first().click();await page.waitForTimeout(500);console.log('MENU',width,await page.locator('.mobile-navigation__secondary').evaluate(e=>({width:e.clientWidth,scrollWidth:e.scrollWidth,links:[...e.querySelectorAll('a')].map(a=>({text:a.textContent,width:a.clientWidth,scrollWidth:a.scrollWidth}))})));if(width===320)await page.screenshot({path:'.tmp-audit/current-menu-320.png'});await page.getByRole('button',{name:'Закрыть навигацию',exact:true}).click();}
 }
 console.log('ERRORS',JSON.stringify(errors));await fs.writeFile('.tmp-audit/current-home-results.json',JSON.stringify({errors,results},null,2));
}finally{await browser.close()}
