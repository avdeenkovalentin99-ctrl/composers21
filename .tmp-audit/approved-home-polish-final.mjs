import {chromium} from 'playwright';
import assert from 'node:assert/strict';
const browser=await chromium.launch({headless:true,timeout:15000});
try{
 for(const [width,height,touch] of [[430,932,true],[844,390,true],[1440,900,false]]){
  console.log('START',width);
  const page=await browser.newPage({viewport:{width,height},hasTouch:touch,isMobile:touch});
  page.setDefaultTimeout(15000);
  page.setDefaultNavigationTimeout(15000);
  const errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.goto('http://127.0.0.1:5177/',{waitUntil:'domcontentloaded'});
  await page.waitForFunction(()=>document.querySelector('.logo-video-hero__emblem')?.dataset.videoReady==='true',null,{timeout:15000});
  await page.waitForFunction(()=>[...document.querySelectorAll('.logo-video-hero video')].every(v=>!v.paused&&v.currentTime>0));
  await page.evaluate(()=>document.fonts.ready);
  const ok=page.getByRole('button',{name:'OK',exact:true});if(await ok.isVisible())await ok.click();
  const layout=await page.evaluate(()=>({width:innerWidth,scroll:document.documentElement.scrollWidth,shell:document.querySelector('.site-shell').getBoundingClientRect().width,title:getComputedStyle(document.querySelector('.logo-video-hero__title')).fontSize,body:getComputedStyle(document.querySelector('.festival-intro-paragraph')).fontSize}));
  assert(layout.scroll<=layout.width);
  if(width===844)assert.equal(layout.shell,390);
  await page.screenshot({path:'.tmp-audit/approved-home-polish/hero-'+width+'.png'});
  console.log('HERO PASS',layout);
  await page.locator('.festival-intro-content').scrollIntoViewIfNeeded();
  await page.waitForFunction(()=>document.querySelector('.festival-intro-content').dataset.visible==='true');
  await page.waitForFunction(()=>getComputedStyle(document.querySelector('.festival-intro-cta')).opacity==='1',null,{timeout:2500});
  if(width===1440)await page.screenshot({path:'.tmp-audit/approved-home-polish/intro-1440.png'});
  assert.deepEqual(errors,[]);
  console.log('PASS playback, early CTA, no runtime errors',width);
  await page.close();
 }
}finally{await browser.close()}
