import assert from 'node:assert/strict';
import { chromium } from 'playwright';
const browser=await chromium.launch({headless:true});
for(const width of [1440,390]) {
 const page=await browser.newPage({viewport:{width,height:1000}});
 const videoRequests=[];page.on('request',r=>{if(/\.(mp4|webm)(?:$|\?)/.test(r.url()))videoRequests.push(r.url())});
 await page.goto('http://127.0.0.1:5176/');
 await page.locator('[data-sync-group="a"]').filter({visible:true}).waitFor();
 assert.equal(await page.locator('video').count(),0);
 await page.evaluate(()=>{const a=[...document.querySelectorAll('[data-sync-group="a"]')].find(e=>e.getBoundingClientRect().height); window.scrollTo({top:window.scrollY+a.getBoundingClientRect().top-150,behavior:'instant'});});
 await page.waitForFunction(()=>[...document.querySelectorAll('[data-sync-group="a"] img')].filter(e=>e.getBoundingClientRect().height).every(i=>i.complete&&i.naturalWidth));
 for(const at of [0,1000,2000,3200]) {
  const cards=await page.evaluate(at=>{const a=[...document.querySelectorAll('[data-sync-group="a"]')].find(e=>e.getBoundingClientRect().height);const root=a.closest('.mobile-home-media__inner')||a.parentElement;root.dispatchEvent(new CustomEvent('media-syncopation:replay',{detail:{at}}));return [...root.querySelectorAll('[data-sync-image-mask]')].map(m=>({background:getComputedStyle(m.parentElement).backgroundColor,clip:getComputedStyle(m).clipPath,image:m.querySelector('img').getAttribute('src')}));},at);
  assert.equal(cards.length,2);for(const card of cards)assert.equal(card.background,'rgba(0, 0, 0, 0)');
  if(at===0){assert.ok(cards[0].clip.includes('100%'));assert.ok(cards[1].clip.includes('100%'));}
  if(at===1000){assert.notEqual(cards[0].clip,cards[1].clip);await page.screenshot({path:'.tmp-audit/media-preview-fixed-'+width+'.png'});}
  if(at===3200)for(const card of cards)assert.equal(card.clip,'none');
 }
 assert.deepEqual(videoRequests,[]);
 console.log('PASS '+width+': transparent previews, staggered photo masks, original culture images, no hero videos or video requests');
 await page.close();
}
await browser.close();
