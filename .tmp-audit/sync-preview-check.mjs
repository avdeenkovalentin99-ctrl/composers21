import { chromium } from 'playwright';
const browser = await chromium.launch({headless:true});
const page = await browser.newPage({viewport:{width:1440,height:1000}});
let url;
for (const port of [5173,5175,5176]) { try { const r=await fetch('http://127.0.0.1:'+port); if(r.ok){url='http://127.0.0.1:'+port;break;} }catch{} }
if(!url)throw new Error('No dev server');
console.log({url});
await page.goto(url);
await page.locator('[data-sync-group="a"]').filter({visible:true}).waitFor();
await page.evaluate(()=>[...document.querySelectorAll('[data-sync-group="a"]')].find(e=>e.getBoundingClientRect().height).scrollIntoView({block:'center'}));
await page.waitForFunction(()=>[...document.querySelectorAll('[data-sync-group="a"] img')].filter(e=>e.getBoundingClientRect().height).every(i=>i.complete&&i.naturalWidth));
console.log({videos:await page.locator('video').count()});
for(const t of [0,350,650,1000,1500,2000,2400,3200]) {
 await page.evaluate(at=>[...document.querySelectorAll('[data-sync-group="a"]')].find(e=>e.getBoundingClientRect().height).parentElement.dispatchEvent(new CustomEvent('media-syncopation:replay',{detail:{at}})),t);
 console.log(JSON.stringify({t,groups:await page.locator('[data-sync-group]').evaluateAll(es=>es.filter(e=>e.getBoundingClientRect().height).map(e=>{const m=e.querySelector('[data-sync-image-mask]');const i=e.querySelector('img');return {id:e.dataset.syncGroup,state:e.dataset.syncState,clip:m&&getComputedStyle(m).clipPath,rect:m&&{width:m.getBoundingClientRect().width,height:m.getBoundingClientRect().height},image:i&&{src:i.currentSrc,complete:i.complete,width:i.naturalWidth,loading:i.loading}}}))}));
 if(t===1000)await page.screenshot({path:'.tmp-audit/sync-preview-before.png'});
}
await browser.close();
